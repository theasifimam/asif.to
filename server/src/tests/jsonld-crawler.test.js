import assert from "node:assert/strict";
import test from "node:test";
import { parseRobots } from "../services/jobs/crawl/robots.js";
import { parseSitemap } from "../services/jobs/crawl/sitemap.js";
import { extractJsonLd, findJobPostings, mapJobPosting } from "../services/jobs/crawl/jsonld.js";
import { JsonLdJobProvider, extractLinks } from "../services/jobs/providers/jsonld.provider.js";
import { normalizeImportedJob } from "../services/jobs/jobImport.service.js";
import { providerForSource } from "../services/jobs/providers/index.js";

const description = `<p>${"Join our regional team and deliver excellent service to customers every day. ".repeat(3)}</p>`;
const posting = (over = {}) => ({
  "@context": "https://schema.org", "@type": "JobPosting", title: "Sales Executive", description, datePosted: "2026-10-01",
  validThrough: "2027-01-01", employmentType: "FULL_TIME", identifier: { "@type": "PropertyValue", value: "REQ-1" },
  hiringOrganization: { "@type": "Organization", name: "Example Group", sameAs: "https://example.com" },
  jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" } }, ...over,
});
const page = (...postings) => `<html><head>${postings.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("")}</head><body>hi</body></html>`;

test("robots.txt: longest rule wins, wildcards work, our own group beats *, crawl-delay and sitemaps are read", () => {
  const robots = parseRobots(`
    User-agent: *
    Disallow: /private
    Disallow: /*.pdf$
    Allow: /private/open
    Crawl-delay: 3
    User-agent: Googlebot
    Disallow: /
    Sitemap: https://example.com/sitemap.xml
  `);
  assert.equal(robots.isAllowed("/jobs/1"), true);
  assert.equal(robots.isAllowed("/private/x"), false);
  assert.equal(robots.isAllowed("/private/open/x"), true);
  assert.equal(robots.isAllowed("/a/b.pdf"), false);
  assert.equal(robots.isAllowed("/a/b.pdf?x=1"), true);
  assert.equal(robots.crawlDelay, 3);
  assert.deepEqual(robots.sitemaps, ["https://example.com/sitemap.xml"]);
  const named = parseRobots("User-agent: asif.to-jobs-importer\nDisallow: /jobs\nUser-agent: *\nDisallow:\n");
  assert.equal(named.isAllowed("/jobs/1"), false);
  assert.equal(parseRobots("User-agent: *\nDisallow: /\n").isAllowed("/anything"), false);
  assert.equal(parseRobots("").isAllowed("/anything"), true);
});

test("sitemaps: index and urlset are read, entity tricks and non-http locations are refused", () => {
  const index = parseSitemap(`<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://example.com/s1.xml</loc></sitemap></sitemapindex>`);
  assert.deepEqual(index.sitemaps, ["https://example.com/s1.xml"]);
  const urls = parseSitemap(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/job/1</loc><lastmod>2026-10-01</lastmod></url><url><loc>javascript:alert(1)</loc></url></urlset>`);
  assert.deepEqual(urls.urls, [{ loc: "https://example.com/job/1", lastmod: "2026-10-01" }]);
  assert.throws(() => parseSitemap(`<?xml version="1.0"?><!DOCTYPE x [<!ENTITY a "b">]><urlset></urlset>`), /Invalid sitemap/);
});

test("JSON-LD: postings are found in arrays, @graph and ItemLists; broken blocks are skipped", () => {
  const html = `<script type="application/ld+json">{ broken</script>
    <script type='application/ld+json'>${JSON.stringify({ "@graph": [{ "@type": "WebSite" }, posting({ title: "A" })] })}</script>
    <script type="application/ld+json">${JSON.stringify([posting({ title: "B", "@type": ["JobPosting"] })])}</script>
    <script type="application/ld+json">${JSON.stringify({ "@type": "ItemList", itemListElement: [{ "@type": "ListItem", item: posting({ title: "C" }) }] })}</script>`;
  assert.deepEqual(findJobPostings(html).map((item) => item.title).sort(), ["A", "B", "C"]);
  assert.equal(extractJsonLd("<html></html>").length, 0);
});

test("a JobPosting maps to the importer shape, including salary, remote work and closed postings", () => {
  const job = mapJobPosting(posting({
    baseSalary: { "@type": "MonetaryAmount", currency: "AED", value: { "@type": "QuantitativeValue", minValue: 8000, maxValue: 12000, unitText: "MONTH" } },
    jobLocation: [{ address: { addressLocality: "Dubai", addressRegion: "Dubai", addressCountry: { name: "United Arab Emirates" } } }, { address: { addressLocality: "Riyadh", addressCountry: "SA" } }],
  }), "https://example.com/job/1", { now: new Date("2026-10-12") });
  assert.equal(job.sourceJobId, "REQ-1"); assert.equal(job.companyName, "Example Group"); assert.equal(job.employmentType, "FULL_TIME");
  assert.equal(job.location, "Dubai, Dubai, United Arab Emirates, Riyadh, SA");
  assert.deepEqual([job.minimumSalary, job.maximumSalary, job.salaryPeriod, job.salaryCurrency], [8000, 12000, "month", "AED"]);
  assert.equal(job.applicationUrl, "https://example.com/job/1");

  const remote = mapJobPosting(posting({ jobLocation: undefined, jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "United Arab Emirates" }, identifier: undefined }), "https://example.com/job/2?utm=x#frag");
  assert.equal(remote.workMode, "remote"); assert.equal(remote.location, "Remote, United Arab Emirates"); assert.equal(remote.sourceJobId, "example.com/job/2");

  assert.equal(mapJobPosting(posting({ validThrough: "2026-01-01" }), "https://example.com/job/3", { now: new Date("2026-10-12") }), null);
  assert.equal(mapJobPosting(posting({ title: "" }), "https://example.com/job/4"), null);
  assert.equal(mapJobPosting(posting({ baseSalary: { currency: "AED", value: { value: 50, unitText: "WEEK" } } }), "https://example.com/j").minimumSalary, undefined);
});

test("listing-page links are resolved, de-duplicated and limited to https", () => {
  const html = `<a href="/jobs/1">a</a><a href="/jobs/1#top">b</a><a href='http://example.com/jobs/2'>c</a><a href="mailto:x@y.z">d</a><a href="https://example.com/jobs/3?x=1&amp;y=2">e</a>`;
  assert.deepEqual(extractLinks(html, "https://example.com/careers"), ["https://example.com/jobs/1", "https://example.com/jobs/3?x=1&y=2"]);
});

// A small fake website: path -> { status, body, location }.
function fakeSite(files, log = []) {
  return async (url) => {
    const parsed = new URL(url); log.push(`${parsed.pathname}${parsed.search}`);
    const file = files[`${parsed.hostname}${parsed.pathname}`];
    if (!file) return { status: 404, ok: false, headers: { get: () => null }, text: async () => "" };
    const status = file.status || 200;
    return { status, ok: status >= 200 && status < 300, headers: { get: (name) => (name.toLowerCase() === "location" ? file.location || null : null) }, text: async () => file.body ?? "" };
  };
}
const sitemap = (...paths) => `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${path}</loc></url>`).join("")}</urlset>`;
const source = (over = {}) => ({ _id: "s1", name: "Example Group", type: "jsonld", endpointUrl: "https://careers.example.com/sitemap.xml", jobsPath: "/job/", baseUrl: "https://example.com", autoPublish: true, trusted: true, qualityThreshold: 70, ...over });
const withEnv = async (vars, run) => {
  const previous = Object.fromEntries(Object.keys(vars).map((key) => [key, process.env[key]]));
  Object.assign(process.env, vars);
  try { return await run(); } finally { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
};
const FAST = { JOB_JSONLD_DELAY_MS: "0" };

test("the crawler reads a sitemap index, skips what robots forbids and what is not a job URL, and imports Gulf jobs", async () => {
  const log = [];
  const files = {
    "careers.example.com/robots.txt": { body: "User-agent: *\nDisallow: /job/secret\nSitemap: https://careers.example.com/sitemap.xml" },
    "careers.example.com/sitemap.xml": { body: `<?xml version="1.0"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://careers.example.com/s1.xml</loc></sitemap><sitemap><loc>https://evil.example.net/s2.xml</loc></sitemap></sitemapindex>` },
    "careers.example.com/s1.xml": { body: sitemap("https://careers.example.com/job/dubai", "https://careers.example.com/job/london", "https://careers.example.com/job/secret", "https://careers.example.com/job/gone", "https://careers.example.com/about", "https://other.example.org/job/x") },
    "careers.example.com/job/dubai": { body: page(posting()) },
    "careers.example.com/job/london": { body: page(posting({ identifier: "REQ-2", jobLocation: { address: { addressLocality: "London", addressCountry: "GB" } } })) },
    "careers.example.com/job/secret": { body: page(posting({ identifier: "REQ-3" })) },
  };
  const provider = new JsonLdJobProvider(source(), { validateRemoteHost: false, fetchImpl: fakeSite(files, log) });
  const jobs = await withEnv(FAST, () => provider.fetchJobs());
  assert.deepEqual(jobs.map((job) => job.sourceJobId), ["REQ-1"]);
  assert.ok(!log.includes("/job/secret") && !log.includes("/about") && !log.some((path) => path.includes("s2.xml")), log.join(","));
  assert.deepEqual(provider.crawlStats, { urls: 4, postings: 2, failed: 0, notFound: 1, skippedByRobots: 1 });
  assert.deepEqual(provider.lastFetchStats, { jobsFound: 2, uaeJobsFound: 1 });

  const normalized = await normalizeImportedJob(jobs[0], { ...source(), _id: "s1" }, provider, new Date("2026-10-12"));
  assert.equal(normalized.data.location, "Dubai"); assert.equal(normalized.data.country, "AE"); assert.equal(normalized.data.status, "published");
  assert.equal(normalized.data.creationOrigin, "automated_import"); assert.equal(normalized.data.postedAtSource, "provider");
  assert.ok(providerForSource(source()) instanceof JsonLdJobProvider);
});

test("a forbidden or unreadable robots.txt means no crawling; a missing one means everything is allowed", async () => {
  const base = { "careers.example.com/sitemap.xml": { body: sitemap("https://careers.example.com/job/1") }, "careers.example.com/job/1": { body: page(posting()) } };
  const run = (robotsFile) => new JsonLdJobProvider(source(), { validateRemoteHost: false, fetchImpl: fakeSite({ ...base, ...(robotsFile ? { "careers.example.com/robots.txt": robotsFile } : {}) }) });
  assert.equal((await withEnv(FAST, () => run(null).fetchJobs())).length, 1); // 404
  assert.deepEqual(await withEnv(FAST, () => run({ status: 403 }).fetchJobs()), []); // forbidden: nothing allowed
  await assert.rejects(withEnv(FAST, () => run({ status: 500 }).fetchJobs()), /robots\.txt could not be read/);
  assert.deepEqual(await withEnv(FAST, () => run({ body: "User-agent: *\nDisallow: /" }).fetchJobs()), []);
});

test("redirects are followed only within the same site over https", async () => {
  const files = {
    "careers.example.com/robots.txt": { status: 404 },
    "careers.example.com/sitemap.xml": { body: sitemap("https://careers.example.com/job/a", "https://careers.example.com/job/b") },
    "careers.example.com/job/a": { status: 301, location: "https://www.careers.example.com/job/a2" },
    "www.careers.example.com/job/a2": { body: page(posting({ identifier: "A" })) },
    "careers.example.com/job/b": { status: 302, location: "https://attacker.example.net/job/b" },
    "attacker.example.net/job/b": { body: page(posting({ identifier: "B" })) },
  };
  const provider = new JsonLdJobProvider(source(), { validateRemoteHost: false, fetchImpl: fakeSite(files) });
  const jobs = await withEnv({ ...FAST }, () => provider.fetchJobs().catch((error) => error));
  assert.deepEqual(jobs.map?.((job) => job.sourceJobId), ["A"]);
  assert.equal(provider.crawlStats.failed, 1);
});

test("a crawl that mostly fails keeps existing jobs, and an oversized site refuses to crawl partially", async () => {
  const many = Array.from({ length: 10 }, (_, i) => `https://careers.example.com/job/${i}`);
  const files = { "careers.example.com/robots.txt": { status: 404 }, "careers.example.com/sitemap.xml": { body: sitemap(...many) } };
  for (const url of many) files[`careers.example.com${new URL(url).pathname}`] = { status: 503 };
  await assert.rejects(withEnv(FAST, () => new JsonLdJobProvider(source(), { validateRemoteHost: false, fetchImpl: fakeSite(files) }).fetchJobs()), /could not be read; keeping existing jobs/);
  await assert.rejects(withEnv({ ...FAST, JOB_JSONLD_MAX_URLS: "5" }, () => new JsonLdJobProvider(source(), { validateRemoteHost: false, fetchImpl: fakeSite(files) }).fetchJobs()), /exceed the limit of 5/);
});

test("a listing page can carry its postings and link to job pages; bad entry URLs are refused", async () => {
  const files = {
    "careers.example.com/robots.txt": { status: 404 },
    "careers.example.com/careers": { body: `${page(posting({ identifier: "LIST-1" }))}<a href="/jobs/42">x</a><a href="/about">y</a>` },
    "careers.example.com/jobs/42": { body: page(posting({ identifier: "PAGE-42" })) },
  };
  const provider = new JsonLdJobProvider(source({ endpointUrl: "https://careers.example.com/careers", jobsPath: "" }), { validateRemoteHost: false, fetchImpl: fakeSite(files) });
  assert.deepEqual((await withEnv(FAST, () => provider.fetchJobs())).map((job) => job.sourceJobId).sort(), ["LIST-1", "PAGE-42"]);
  for (const endpointUrl of ["", "http://careers.example.com/s.xml", "https://user:pw@careers.example.com/s.xml", "not a url"]) {
    await assert.rejects(new JsonLdJobProvider(source({ endpointUrl }), { validateRemoteHost: false, fetchImpl: fakeSite({}) }).fetchJobs(), /endpointUrl|https/);
  }
});
