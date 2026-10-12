import assert from "node:assert/strict";
import test from "node:test";
import { WorkdayJobProvider, parseWorkdayId, workdayBase } from "../services/jobs/providers/workday.provider.js";
import { providerForSource } from "../services/jobs/providers/index.js";
import { detectJobBoard } from "../services/jobs/jobSourceDiscovery.service.js";
import { normalizeImportedJob } from "../services/jobs/jobImport.service.js";

const source = { _id: "wd", name: "Example Corp", type: "workday", providerOrganizationId: "example/wd3/Careers", baseUrl: "https://example.com", autoPublish: true, trusted: true, qualityThreshold: 70 };
const posting = (path, locationsText, extra = {}) => ({ title: `Role ${path}`, externalPath: path, locationsText, postedOn: "Posted Today", bulletFields: [`R-${path.length}`], ...extra });
const description = `<p>${"Deliver outstanding results for our regional customers with a collaborative team. ".repeat(3)}</p>`;

// A tiny fake Workday: search returns postings per term; detail returns jobPostingInfo by path.
function fakeWorkday(postingsByTerm, details) {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, method: options.method || "GET", body: options.body ? JSON.parse(options.body) : null });
    const body = options.body ? JSON.parse(options.body) : null;
    if (body) {
      const all = postingsByTerm[body.searchText] || [];
      return { ok: true, json: async () => ({ total: body.offset === 0 ? all.length : 0, jobPostings: all.slice(body.offset, body.offset + body.limit), facets: [] }) };
    }
    const path = new URL(url).pathname.replace("/wday/cxs/example/Careers", "");
    return details[path] ? { ok: true, json: async () => ({ jobPostingInfo: details[path] }) } : { ok: false, status: 404, headers: { get: () => null } };
  };
  return { fetchImpl, requests };
}

test("source ids must be tenant/wdN/site and build only a myworkdayjobs.com host", () => {
  assert.deepEqual(parseWorkdayId("Example/WD3/External_Careers"), { tenant: "example", pod: "wd3", site: "External_Careers" });
  assert.equal(workdayBase(parseWorkdayId("example/wd3/Careers")), "https://example.wd3.myworkdayjobs.com/wday/cxs/example/Careers");
  for (const bad of ["", "example", "example/wd3", "example/wd3/a/b", "evil.com/wd3/Careers", "example/x3/Careers", "example/wd3/a b", "ex ample/wd3/Careers"]) assert.throws(() => parseWorkdayId(bad), /tenant\/wdN\/site/, bad);
  assert.ok(providerForSource(source) instanceof WorkdayJobProvider);
});

test("Workday search is POSTed per Gulf term; only in-scope postings are fetched and imported", async () => {
  const dubai = posting("/job/Dubai-United-Arab-Emirates/Account-Manager_R-1", "Dubai, United Arab Emirates");
  const riyadh = posting("/job/Riyadh/Engineer_R-2", "Riyadh, Saudi Arabia");
  const london = posting("/job/London/Analyst_R-3", "London, United Kingdom"); // matched by description text only
  const multi = posting("/job/Multiple/Lead_R-4", "2 Locations");
  const bogus = posting("/../../etc/passwd", "Dubai, United Arab Emirates");
  const { fetchImpl, requests } = fakeWorkday(
    { Dubai: [dubai, london], "Saudi Arabia": [riyadh, dubai], Qatar: [multi, bogus] },
    {
      "/job/Dubai-United-Arab-Emirates/Account-Manager_R-1": { id: "a", title: "Account Manager", jobDescription: description, location: "Dubai, United Arab Emirates", startDate: "2026-10-01", timeType: "Full time", jobReqId: "R-1", country: { descriptor: "United Arab Emirates" }, externalUrl: "https://example.wd3.myworkdayjobs.com/Careers/job/Dubai-United-Arab-Emirates/Account-Manager_R-1" },
      "/job/Riyadh/Engineer_R-2": { id: "b", title: "Engineer", jobDescription: description, location: "Riyadh, Saudi Arabia", startDate: "2026-10-02", timeType: "Full time", jobReqId: "R-2", country: { descriptor: "Saudi Arabia" }, externalUrl: "https://example.wd3.myworkdayjobs.com/Careers/job/Riyadh/Engineer_R-2" },
      "/job/Multiple/Lead_R-4": { id: "c", title: "Lead", jobDescription: description, location: "London, United Kingdom", additionalLocations: ["Doha, Qatar"], jobReqId: "R-4", country: { descriptor: "United Kingdom" }, externalUrl: "https://example.wd3.myworkdayjobs.com/Careers/job/Multiple/Lead_R-4" },
    },
  );
  const provider = new WorkdayJobProvider(source, { validateRemoteHost: false, fetchImpl });
  const jobs = await provider.fetchJobs();

  assert.deepEqual(jobs.map((job) => job.info.jobReqId).sort(), ["R-1", "R-2", "R-4"]);
  const searches = requests.filter((request) => request.method === "POST");
  assert.ok(searches.length >= 10);
  assert.ok(searches.every((request) => request.url === "https://example.wd3.myworkdayjobs.com/wday/cxs/example/Careers/jobs" && request.body.limit === 20));
  assert.ok(searches.some((request) => request.body.searchText === "Dubai") && searches.some((request) => request.body.searchText === "Doha"));
  const detailUrls = requests.filter((request) => request.method === "GET").map((request) => request.url);
  assert.equal(detailUrls.length, 3); // London and the traversal path were never fetched
  assert.ok(detailUrls.every((url) => url.startsWith("https://example.wd3.myworkdayjobs.com/wday/cxs/example/Careers/job/")));
  assert.equal(provider.lastFetchStats.uaeJobsFound, 3);

  const normalized = await Promise.all(jobs.map((raw) => normalizeImportedJob(raw, { ...source, _id: "wd" }, provider, new Date("2026-10-12"))));
  const byReq = Object.fromEntries(normalized.map((item) => [item.data.sourceJobId, item.data]));
  assert.equal(byReq["R-1"].location, "Dubai"); assert.equal(byReq["R-1"].country, "AE"); assert.equal(byReq["R-1"].status, "published");
  assert.equal(byReq["R-1"].postedAtSource, "provider");
  assert.equal(byReq["R-2"].location, "Riyadh"); assert.equal(byReq["R-2"].country, "SA");
  assert.equal(byReq["R-4"].location, "Doha"); assert.equal(byReq["R-4"].country, "QA"); // resolved from the additional location
  assert.equal(byReq["R-1"].creationOrigin, "ats_import");
  assert.match(byReq["R-1"].applicationUrl, /^https:\/\/example\.wd3\.myworkdayjobs\.com\/Careers\/job\//);
});

test("Workday pagination uses the first-page total and stops on a short page", async () => {
  const many = Array.from({ length: 45 }, (_, i) => posting(`/job/Dubai/Role_${i}`, "Dubai, United Arab Emirates"));
  const { fetchImpl, requests } = fakeWorkday({ Dubai: many }, {});
  const provider = new WorkdayJobProvider(source, { validateRemoteHost: false, fetchImpl });
  await provider.fetchJobs().catch(() => {}); // detail calls 404 here; only the search paging is under test
  const dubaiPages = requests.filter((request) => request.body?.searchText === "Dubai").map((request) => request.body.offset);
  assert.deepEqual(dubaiPages, [0, 20, 40]);
});

test("JOB_COUNTRIES limits which Gulf terms are searched", async () => {
  const previous = process.env.JOB_COUNTRIES; process.env.JOB_COUNTRIES = "QA";
  try {
    const { fetchImpl, requests } = fakeWorkday({}, {});
    await new WorkdayJobProvider(source, { validateRemoteHost: false, fetchImpl }).fetchJobs();
    assert.deepEqual([...new Set(requests.map((request) => request.body.searchText))].sort(), ["Doha", "Qatar"]);
  } finally { if (previous === undefined) delete process.env.JOB_COUNTRIES; else process.env.JOB_COUNTRIES = previous; }
});

test("Workday career URLs are detected with or without a locale and with a job path", () => {
  const expected = { type: "workday", providerOrganizationId: "mastercard/wd1/CorporateCareers" };
  for (const url of ["https://mastercard.wd1.myworkdayjobs.com/CorporateCareers", "https://mastercard.wd1.myworkdayjobs.com/en-US/CorporateCareers", "https://Mastercard.wd1.myworkdayjobs.com/en-US/CorporateCareers/job/Dubai/Role_R-1"]) {
    assert.deepEqual({ type: detectJobBoard(url).type, providerOrganizationId: detectJobBoard(url).providerOrganizationId }, expected, url);
  }
  assert.throws(() => detectJobBoard("https://mastercard.wd1.myworkdayjobs.com/"), /Unsupported/);
  assert.throws(() => detectJobBoard("https://mastercard.wd1.myworkdayjobs.com/wday/cxs/mastercard/CorporateCareers/jobs"), /Unsupported/);
  assert.throws(() => detectJobBoard("https://mastercard.myworkdayjobs.com/CorporateCareers"), /Unsupported/);
});

test("the Workday registry has unique slugs and valid tenant/wdN/site ids", async () => {
  const { WORKDAY_JOB_SOURCE_DEFINITIONS } = await import("../services/jobs/workdaySourceRegistry.js");
  assert.ok(WORKDAY_JOB_SOURCE_DEFINITIONS.length >= 15);
  assert.equal(new Set(WORKDAY_JOB_SOURCE_DEFINITIONS.map((item) => item.slug)).size, WORKDAY_JOB_SOURCE_DEFINITIONS.length);
  assert.equal(new Set(WORKDAY_JOB_SOURCE_DEFINITIONS.map((item) => item.providerOrganizationId)).size, WORKDAY_JOB_SOURCE_DEFINITIONS.length);
  for (const item of WORKDAY_JOB_SOURCE_DEFINITIONS) {
    assert.equal(item.type, "workday");
    const parts = parseWorkdayId(item.providerOrganizationId);
    assert.equal(item.careersUrl, `https://${parts.tenant}.${parts.pod}.myworkdayjobs.com/${parts.site}`);
    assert.equal(detectJobBoard(item.careersUrl).providerOrganizationId, item.providerOrganizationId);
  }
});
