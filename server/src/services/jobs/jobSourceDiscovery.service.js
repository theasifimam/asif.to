import { normalizeCompanyName } from "./jobImport.service.js";

const compact = (value) => normalizeCompanyName(value || "").replace(/\s+/g, "");
const aliases = new Map([["checkoutcom", "checkout"], ["vams", "vamsystems"], ["sixconstruct", "besix"]]);
const nameKey = (value) => aliases.get(compact(value)) || compact(value);
const urlKey = (value) => {
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, "")}${decodeURIComponent(url.pathname).replace(/\/+$/, "")}`.toLowerCase();
  } catch { return ""; }
};

export function detectJobBoard(value) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("An HTTPS public career URL is required.");
  const parts = url.pathname.split("/").filter(Boolean);
  const subdomain = url.hostname.match(/^([a-z0-9-]+)\.(recruitee\.com|pinpointhq\.com|teamtailor\.com)$/);
  if (subdomain) {
    const type = { "recruitee.com": "recruitee", "pinpointhq.com": "pinpoint", "teamtailor.com": "teamtailor" }[subdomain[2]];
    return { type, providerOrganizationId: subdomain[1], providerRegion: "global", careersUrl: url.origin, endpointUrl: `${url.origin}${{ recruitee: "/api/offers/", pinpoint: "/postings.json", teamtailor: "/jobs.rss" }[type]}` };
  }
  let type;
  let id = parts[0];
  if (["jobs.lever.co", "jobs.eu.lever.co"].includes(url.hostname)) type = "lever";
  if (["boards.greenhouse.io", "job-boards.greenhouse.io"].includes(url.hostname)) {
    type = "greenhouse";
    if (id === "embed") id = url.searchParams.get("for");
  }
  if (["jobs.smartrecruiters.com", "careers.smartrecruiters.com"].includes(url.hostname)) {
    type = "smartrecruiters";
    if (id === "oneclick-ui" && parts[1] === "company") id = parts[2];
  }
  if (url.hostname === "jobs.ashbyhq.com") type = "ashby";
  if (url.hostname === "apply.workable.com") {
    type = "workable";
    if (id === "api") id = parts[1] === "v1" && parts[2] === "widget" && parts[3] === "accounts" ? parts[4] : null;
  }
  if (!type || !id || !/^[a-z0-9_.-]+$/i.test(id)) throw new Error("Unsupported or unresolved public board URL.");
  const providerRegion = url.hostname === "jobs.eu.lever.co" ? "eu" : "global";
  const encoded = encodeURIComponent(id);
  const endpointUrl = {
    lever: `https://api${providerRegion === "eu" ? ".eu" : ""}.lever.co/v0/postings/${encoded}`,
    greenhouse: `https://boards-api.greenhouse.io/v1/boards/${encoded}/jobs?content=true`,
    smartrecruiters: `https://api.smartrecruiters.com/v1/companies/${encoded}/postings`,
    ashby: `https://api.ashbyhq.com/posting-api/job-board/${encoded}`,
    workable: `https://apply.workable.com/api/v1/widget/accounts/${encoded}?details=true`,
  }[type];
  return { type, providerOrganizationId: id, providerRegion, careersUrl: `https://${url.hostname}/${encoded}`, endpointUrl };
}

export function sourceIdentityKeys(source) {
  const keys = [];
  if (source._id) keys.push(`id:${source._id}`);
  for (const value of [source.name, source.normalizedName, source.sourceName]) if (nameKey(value)) keys.push(`name:${nameKey(value)}`);
  const provider = source.type || source.sourceProvider;
  if (provider && source.providerOrganizationId) keys.push(`board:${provider}:${source.providerOrganizationId.toLowerCase()}`);
  for (const identity of source.providerIdentities || []) keys.push(`board:${identity.provider}:${identity.organizationId.toLowerCase()}`);
  for (const value of [source.careersUrl, source.endpointUrl, source.feedUrl]) {
    if (urlKey(value)) keys.push(`url:${urlKey(value)}`);
    try { const board = detectJobBoard(value); keys.push(`board:${board.type}:${board.providerOrganizationId.toLowerCase()}`); } catch { /* Non-ATS employer URL. */ }
  }
  for (const value of [source.baseUrl, source.website, source.companyWebsite]) {
    try { const domain = new URL(value).hostname.toLowerCase().replace(/^www\./, ""); keys.push(`domain:${domain}`); } catch { /* Missing employer website. */ }
  }
  if (source.websiteDomain) keys.push(`domain:${source.websiteDomain.toLowerCase().replace(/^www\./, "")}`);
  return [...new Set(keys)];
}

export function createExclusionSet(sources, companies = []) {
  // Company records linked to sources participate in source exclusion; standalone
  // companies may be reused when their first recruiting source is discovered.
  const linkedCompanies = companies.filter((company) => company.source || company.providerIdentities?.length);
  return new Set([...sources, ...linkedCompanies].flatMap(sourceIdentityKeys));
}

export function duplicateSource(source, exclusions) {
  return sourceIdentityKeys(source).find((key) => exclusions.has(key)) || null;
}

export function selectVerifiedSources(candidates, exclusions, target = 100) {
  const seen = new Set(exclusions);
  const selected = [];
  for (const candidate of candidates) {
    if (!candidate.verification?.valid || candidate.verification.credentialsRequired || !candidate.verification.uaeJobsFound || duplicateSource(candidate, seen)) continue;
    selected.push(candidate);
    for (const key of sourceIdentityKeys(candidate)) seen.add(key);
    if (selected.length === target) break;
  }
  if (selected.length !== target) throw new Error(`Need ${target} verified net-new sources; only ${selected.length} qualify.`);
  return selected;
}

export async function addDiscoveryBatch(selected, { runId = "20260913", findBySlug, checkDuplicate, createSource, syncSource, onProgress = async () => {} }) {
  if (!/^[a-z0-9-]{1,60}$/.test(runId)) throw new Error("Invalid discovery run identifier.");
  if (selected.length !== 100 || new Set(selected.map((row) => `${row.type}:${row.providerOrganizationId.toLowerCase()}`)).size !== 100) throw new Error("A discovery batch must contain exactly 100 unique verified sources.");
  if (selected.some((row) => !row.verification?.valid || row.verification.credentialsRequired || row.verification.uaeJobsFound < 1)) throw new Error("Every selected source must have verified UAE jobs.");
  const results = [];
  for (const row of selected) {
    const slug = `discovery-${runId}-${row.type}-${row.providerOrganizationId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    let source = await findBySlug(slug);
    if (!source) {
      const duplicate = await checkDuplicate(row);
      if (duplicate) throw new Error(`${row.name} now duplicates ${duplicate}; refresh the selection before inserting.`);
      source = await createSource({
        name: row.name, slug, type: row.type, providerOrganizationId: row.providerOrganizationId, providerRegion: row.providerRegion,
        baseUrl: row.baseUrl || "", careersUrl: row.careersUrl, endpointUrl: row.endpointUrl,
        enabled: true, autoPublish: true, trusted: true, qualityThreshold: 90, syncIntervalHours: 6, syncFrequency: "daily",
        nextSyncAt: new Date(Date.now() + 6 * 3_600_000), creationOrigin: "automated_source_discovery",
        verificationStatus: "Verified", lastVerifiedAt: row.checkedAt,
        verifiedJobsFound: row.verification.currentJobsFound, verifiedUaeJobsFound: row.verification.uaeJobsFound,
        verificationNotes: `Automated Source Discovery ${runId}. Public employer ATS feed. Evidence: ${row.evidenceUrl}`,
      });
    } else if (source.creationOrigin !== "automated_source_discovery") throw new Error(`Slug collision for ${row.name}.`);
    await onProgress({ row, source, stage: "created" });
    const sync = source.lastSuccessfulSyncAt ? null : await syncSource(source._id, { trigger: "manual" });
    if (sync?.errors?.some((error) => error.code !== "VALIDATION_FAILED")) throw new Error(`Initial sync had import errors for ${row.name}; inspect logs before resuming.`);
    const result = { row, source, sync };
    results.push(result);
    await onProgress({ ...result, stage: "synced" });
  }
  return results;
}
