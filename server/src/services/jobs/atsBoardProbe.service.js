/**
 * ATS board prober: the "search the outside world" signal for company discovery.
 *
 * Turns known Gulf employer names into candidate public ATS board IDs and keeps
 * only those that really exist on the provider's public JSON API. Verification
 * (companyDiscovery) then requires real in-scope jobs before a source is created, so
 * a wrong guess costs one HTTP request and nothing else. Only documented public
 * job-board endpoints are called; nothing is scraped or authenticated.
 *
 * Each run probes a rolling window of (name x slug variant x provider) tuples,
 * persisted in DiscoveryState so successive runs cover the whole list.
 *   DISCOVERY_PROBE_BATCH        tuples per run          default 800
 *   DISCOVERY_PROBE_CONCURRENCY  parallel requests       default 8
 */
import Company from "../../models/Company.js";
import DiscoveryState from "../../models/DiscoveryState.js";
import { cleanText } from "../../utils/jobValidation.js";
import { normalizeCompanyName } from "./jobImport.service.js";
import { COMPANY_SEEDS } from "./gccCompanySeeds.js";

const CURSOR_KEY = "atsProbeCursor";

export const PROBE_PROVIDERS = {
  greenhouse: { api: (id) => `https://boards-api.greenhouse.io/v1/boards/${id}`, careers: (id) => `https://job-boards.greenhouse.io/${id}`, exists: (json) => Boolean(json?.name), boardName: (json) => json?.name },
  lever: { api: (id) => `https://api.lever.co/v0/postings/${id}?mode=json&limit=1`, careers: (id) => `https://jobs.lever.co/${id}`, exists: (json) => Array.isArray(json) },
  ashby: { api: (id) => `https://api.ashbyhq.com/posting-api/job-board/${id}`, careers: (id) => `https://jobs.ashbyhq.com/${id}`, exists: (json) => Array.isArray(json?.jobs) },
  // SmartRecruiters answers 200 with an empty list for any company ID, so require real postings.
  smartrecruiters: { api: (id) => `https://api.smartrecruiters.com/v1/companies/${id}/postings?limit=1`, careers: (id) => `https://jobs.smartrecruiters.com/${id}`, exists: (json) => Number(json?.totalFound) > 0 },
  workable: { api: (id) => `https://apply.workable.com/api/v1/widget/accounts/${id}`, careers: (id) => `https://apply.workable.com/${id}`, exists: (json) => Array.isArray(json?.jobs) && json.jobs.length > 0 }, // 200 for unknown accounts too
};

const compact = (value) => normalizeCompanyName(value).replace(/\s+/g, "");

/** Candidate board slugs for a company name: "majidalfuttaim" and "majid-al-futtaim". */
export function slugVariants(name) {
  const words = normalizeCompanyName(name).split(" ").filter(Boolean);
  const variants = new Set([words.join(""), words.join("-")]);
  return [...variants].filter((slug) => /^[a-z0-9][a-z0-9-]{2,48}$/.test(slug));
}

/** Seed names plus any company we already hold that has no job source yet. */
export async function probeNames({ CompanyModel = Company } = {}) {
  const names = new Map();
  const add = (name) => {
    const key = compact(name);
    if (key.length >= 3 && !names.has(key)) names.set(key, cleanText(name, 180));
  };
  COMPANY_SEEDS.forEach(add);
  try {
    const orphans = await CompanyModel.find({ $or: [{ source: null }, { source: { $exists: false } }], active: { $ne: false } }).select("name").limit(500).lean();
    orphans.forEach((company) => add(company.name));
  } catch { /* Seeds alone are enough. */ }
  return [...names.values()];
}

export function buildProbeTuples(names) {
  const tuples = [];
  for (const name of names) for (const slug of slugVariants(name)) for (const provider of Object.keys(PROBE_PROVIDERS)) tuples.push({ name, slug, provider });
  return tuples;
}

async function probeOne({ name, slug, provider }, fetchImpl, rateLimited) {
  if (rateLimited.has(provider)) return null; // Back off a provider that told us to slow down.
  const spec = PROBE_PROVIDERS[provider];
  try {
    const response = await fetchImpl(spec.api(encodeURIComponent(slug)), {
      headers: { Accept: "application/json", "User-Agent": "asif.to-jobs-discovery/1.0" }, redirect: "error", signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 429) rateLimited.add(provider);
    if (!response.ok) return null;
    const json = await response.json();
    if (!spec.exists(json)) return null;
    // Greenhouse reveals the board's real name; reject look-alike slugs that belong to someone else.
    const boardName = spec.boardName?.(json);
    if (boardName && !compact(boardName).includes(compact(name).slice(0, 6)) && !compact(name).includes(compact(boardName).slice(0, 6))) return null;
    const careersUrl = spec.careers(encodeURIComponent(slug));
    return { companyName: name, normalizedCompanyName: normalizeCompanyName(name), domain: "", careersUrl, sourceUrl: careersUrl, discoveryMethod: "ats_slug_probe" };
  } catch {
    return null; // Timeouts, DNS or 4xx/5xx all mean "no usable board here".
  }
}

export async function probeAtsBoards({
  batch = parseInt(process.env.DISCOVERY_PROBE_BATCH || "800", 10),
  concurrency = parseInt(process.env.DISCOVERY_PROBE_CONCURRENCY || "8", 10),
  fetchImpl = globalThis.fetch, StateModel = DiscoveryState, names,
} = {}) {
  const tuples = buildProbeTuples(names || await probeNames());
  if (!tuples.length || batch <= 0) return { signals: [], probed: 0, total: tuples.length };
  const state = await StateModel.findOne({ key: CURSOR_KEY }).lean();
  const start = Number.isInteger(state?.value) && state.value >= 0 ? state.value % tuples.length : 0;
  const window = Array.from({ length: Math.min(batch, tuples.length) }, (_, i) => tuples[(start + i) % tuples.length]);

  const signals = [];
  const rateLimited = new Set();
  let index = 0;
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (index < window.length) {
      const hit = await probeOne(window[index++], fetchImpl, rateLimited);
      if (hit) signals.push(hit);
    }
  }));
  await StateModel.updateOne({ key: CURSOR_KEY }, { $set: { value: (start + window.length) % tuples.length } }, { upsert: true });
  return { signals, probed: window.length, total: tuples.length };
}
