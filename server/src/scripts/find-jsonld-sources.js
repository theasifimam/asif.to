// Checks whether career sites can be crawled for JobPosting JSON-LD, and how many Gulf jobs they would add.
// Read-only and database-free: for each site it reads robots.txt, finds the sitemap, samples a few pages and
// reports the sitemap URL and `jobsPath` to register, the share of sampled job pages in the Gulf, and an
// estimate of Gulf jobs. It makes about 30-60 polite requests per site and obeys robots.txt like the importer.
//
//   npm run find:jsonld-sources -- --urls=https://careers.example.com,https://jobs.example.org/sitemap.xml
//   npm run find:jsonld-sources -- --json
//
// A site is only worth registering when it allows crawling, has JobPosting markup, and a useful Gulf share.
import { JsonLdJobProvider } from "../services/jobs/providers/jsonld.provider.js";
import { findJobPostings, mapJobPosting } from "../services/jobs/crawl/jsonld.js";
import { normalizeRegionLocation } from "../services/jobs/jobNormalization.service.js";

process.env.JOB_JSONLD_MAX_URLS = "500000"; process.env.JOB_JSONLD_MAX_SITEMAPS = "60"; process.env.JOB_JSONLD_DELAY_MS ||= "400";
const arg = (name) => process.argv.find((item) => item.startsWith(`--${name}=`))?.slice(name.length + 3);
const urls = (arg("urls") || "").split(",").map((item) => item.trim()).filter(Boolean);
const asJson = process.argv.includes("--json");
if (!urls.length) { console.error("Pass career site URLs with --urls=https://careers.example.com,..."); process.exit(1); }

const segmentOf = (url) => { try { return new URL(url).pathname.split("/").filter(Boolean)[0] || ""; } catch { return ""; } };
const pick = (list, count) => { const step = Math.max(1, Math.floor(list.length / count)); return list.filter((_, i) => i % step === 0).slice(0, count); };

async function inspect(input) {
  const origin = new URL(input).origin;
  const report = { site: origin, input };
  const provider = new JsonLdJobProvider({ name: origin, type: "jsonld", endpointUrl: input });
  try {
    const robots = await provider.loadRobots(input);
    report.robotsAllowsCrawl = robots.isAllowed("/") !== false || robots.isAllowed(new URL(input).pathname);
    if (!report.robotsAllowsCrawl) return { ...report, verdict: "robots.txt disallows crawling" };
    // Start from the given URL; for a plain careers page also try the sitemaps robots.txt announces and /sitemap.xml.
    let entry = input; let found = null;
    const entries = [input, ...robots.sitemaps, `${origin}/sitemap.xml`];
    for (const candidate of [...new Set(entries)]) {
      try { entry = candidate; found = await provider.discover(candidate, robots, { maxUrls: 500_000, maxSitemaps: 60, maxBytes: 2_000_000 }); if (found.pageUrls.length || found.direct.length) break; } catch { /* try the next */ }
    }
    if (!found || (!found.pageUrls.length && !found.direct.length)) return { ...report, verdict: "no sitemap or job links found" };
    report.sitemapUrl = entry; report.urlsInSitemap = found.pageUrls.length;

    // Which URL path holds the job pages? Sample a few from each of the biggest sections.
    const bySegment = new Map();
    for (const url of found.pageUrls) { const key = segmentOf(url); bySegment.set(key, [...(bySegment.get(key) || []), url]); }
    const sections = [...bySegment.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6);
    const sample = async (list) => {
      const rows = [];
      for (const url of list) {
        if (!provider.allowed(robots, url)) continue;
        try {
          const page = await provider.requestText(url);
          for (const posting of findJobPostings(page.text)) {
            const job = mapJobPosting(posting, page.url);
            if (job) rows.push({ url, place: normalizeRegionLocation(job.location, job.country)?.country || null });
          }
        } catch { /* a broken page is just not counted */ }
        await new Promise((resolve) => setTimeout(resolve, Number(process.env.JOB_JSONLD_DELAY_MS)));
      }
      return rows;
    };
    let best = null;
    for (const [segment, list] of sections) {
      const rows = await sample(pick(list, 3));
      if (rows.length && (!best || list.length > best.list.length)) best = { segment, list, probe: rows };
    }
    if (!best && found.direct.length) return { ...report, verdict: "JobPosting markup on the listing page only", directPostings: found.direct.length };
    if (!best) return { ...report, verdict: "no JobPosting JSON-LD on sampled pages" };

    const rows = await sample(pick(best.list, 15));
    const gulf = rows.filter((row) => row.place);
    const share = rows.length ? gulf.length / rows.length : 0;
    const byCountry = {}; for (const row of gulf) byCountry[row.place] = (byCountry[row.place] || 0) + 1;
    const total = best.list.length;
    return {
      ...report, jobsPath: best.segment ? `/${best.segment}/` : "", jobPagesInSection: total, sampled: rows.length, gulfShare: Math.round(share * 100),
      estimatedGulfJobs: Math.round(total * share), sampledByCountry: byCountry, crawlCostPerSync: `~${total} requests`,
      verdict: !gulf.length ? "JobPosting markup, but no Gulf jobs in the sample" : share < 0.05 && total > 800 ? "mostly non-Gulf: a full crawl is expensive for little gain" : "worth registering",
    };
  } catch (error) { return { ...report, verdict: `error: ${String(error.message).slice(0, 120)}` }; }
}

const results = [];
for (const url of urls) { const result = await inspect(url); results.push(result); if (!asJson) console.error(`[done] ${url}: ${result.verdict}`); }
if (asJson) console.log(JSON.stringify(results, null, 2));
else for (const r of results) console.log(`\n${r.site}\n  verdict: ${r.verdict}${r.sitemapUrl ? `\n  endpointUrl: ${r.sitemapUrl}\n  jobsPath: ${r.jobsPath}\n  job pages: ${r.jobPagesInSection}, Gulf share of ${r.sampled} sampled: ${r.gulfShare}% (~${r.estimatedGulfJobs} Gulf jobs) ${JSON.stringify(r.sampledByCountry)}` : ""}`);
process.exit(0);
