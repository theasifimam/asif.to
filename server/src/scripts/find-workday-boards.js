// Finds Workday career sites that exist and have Gulf jobs. Read-only and database-free: it only calls the
// public Workday search API (the same one each career site's own page uses), a few requests at a time.
//
//   npm run find:workday-boards                     test every candidate in workdayCandidates.js
//   npm run find:workday-boards -- --only=mastercard,accenture
//   npm run find:workday-boards -- --urls=https://x.wd3.myworkdayjobs.com/en-US/Site,...   test known career URLs
//   npm run find:workday-boards -- --json           machine-readable
//
// Boards found here are registered by adding them to workdaySourceRegistry.js and running `npm run seed:job-sources`.
import { WORKDAY_CANDIDATES } from "../services/jobs/workdayCandidates.js";
import { detectJobBoard } from "../services/jobs/jobSourceDiscovery.service.js";
import { WorkdayJobProvider, workdayBase, parseWorkdayId } from "../services/jobs/providers/workday.provider.js";

const arg = (name) => process.argv.find((item) => item.startsWith(`--${name}=`))?.slice(name.length + 3);
const only = arg("only")?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
const urls = arg("urls")?.split(",").map((item) => item.trim()).filter(Boolean) || [];
const asJson = process.argv.includes("--json");
const GULF_PROBE = ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"];

const post = async (base, body) => {
  const response = await fetch(`${base}/jobs`, {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "asif.to-jobs-discovery/1.0" },
    body: JSON.stringify(body), redirect: "error", signal: AbortSignal.timeout(12_000),
  });
  return response.ok ? response.json() : null;
};

// Cheap existence check, then a count of Gulf search hits so empty boards are not reported.
async function probe({ tenant, pod, site }) {
  const base = workdayBase({ tenant, pod, site });
  try {
    const first = await post(base, { appliedFacets: {}, limit: 1, offset: 0, searchText: "" });
    if (!Array.isArray(first?.jobPostings)) return null;
    let gulfHits = 0;
    for (const searchText of GULF_PROBE) gulfHits += Number((await post(base, { appliedFacets: {}, limit: 1, offset: 0, searchText }))?.total) || 0;
    return { id: `${tenant}/${pod}/${site}`, boardJobs: first.total, gulfSearchHits: gulfHits };
  } catch { return null; }
}

const tuples = [];
for (const url of urls) {
  const board = detectJobBoard(url); const { tenant, pod, site } = parseWorkdayId(board.providerOrganizationId);
  tuples.push({ tenant, pod, site });
}
if (!urls.length) {
  for (const candidate of WORKDAY_CANDIDATES) {
    if (only && !only.includes(candidate.tenant)) continue;
    for (const pod of candidate.pods) for (const site of candidate.sites) tuples.push({ tenant: candidate.tenant, pod, site });
  }
}

const found = []; const confirmed = new Set(); let index = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (index < tuples.length) {
    const tuple = tuples[index++];
    const key = `${tuple.tenant}/${tuple.pod}`;
    if (confirmed.has(key) && !urls.length && found.some((hit) => hit.id.startsWith(`${key}/`))) continue; // one working site per tenant is enough
    const hit = await probe(tuple);
    if (hit) { confirmed.add(key); found.push(hit); console.error(`[found] ${hit.id} board=${hit.boardJobs} gulfHits=${hit.gulfSearchHits}`); }
    if (index % 250 === 0) console.error(`[progress] ${index}/${tuples.length} combinations tested, ${found.length} boards found`);
  }
}));

// A board only counts if the real importer would keep Gulf jobs from it: confirm with a capped fetch.
const verified = [];
for (const hit of found.filter((item) => item.gulfSearchHits > 0).sort((a, b) => b.gulfSearchHits - a.gulfSearchHits)) {
  process.env.JOB_WORKDAY_MAX_PER_SEARCH = "40"; process.env.JOB_WORKDAY_MAX_JOBS = "60";
  try {
    const source = { name: hit.id.split("/")[0], type: "workday", providerOrganizationId: hit.id };
    const provider = new WorkdayJobProvider(source);
    const jobs = await provider.fetchJobs();
    if (jobs.length) verified.push({ ...hit, sampleGulfJobs: jobs.length, sampleTitles: jobs.slice(0, 3).map((job) => job.info.title) });
  } catch (error) { verified.push({ ...hit, error: String(error.message).slice(0, 100) }); }
}

const result = { tested: tuples.length, boardsFound: found.length, withGulfJobs: verified.filter((item) => !item.error).length, boards: verified, boardsWithoutGulfSearchHits: found.filter((item) => !item.gulfSearchHits).map((item) => item.id) };
if (asJson) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`Tested ${result.tested} tenant/site combinations; ${result.boardsFound} boards exist; ${result.withGulfJobs} have Gulf jobs.\n`);
  for (const board of verified) console.log(`${board.error ? "!" : "+"} ${board.id.padEnd(48)} board=${board.boardJobs} gulfHits=${board.gulfSearchHits} ${board.error ? board.error : `kept(sample)=${board.sampleGulfJobs}  e.g. ${board.sampleTitles.join(" | ")}`}`);
  if (result.boardsWithoutGulfSearchHits.length) console.log(`\nExist but no Gulf hits: ${result.boardsWithoutGulfSearchHits.join(", ")}`);
}
process.exit(0);
