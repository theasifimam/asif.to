import test from "node:test";
import assert from "node:assert/strict";
import { addDiscoveryBatch, createExclusionSet, detectJobBoard, duplicateSource, selectVerifiedSources, sourceIdentityKeys } from "../services/jobs/jobSourceDiscovery.service.js";
import { isJobSuppressed, suppressDeletedJob } from "../services/jobs/jobSuppression.service.js";
import { upsertJob } from "../services/jobs/jobImport.service.js";
import { normalizeUaeLocation } from "../services/jobs/jobNormalization.service.js";
import { verifyJobSource } from "../services/jobs/jobSourceVerification.service.js";
import { SmartRecruitersJobProvider } from "../services/jobs/providers/smartRecruiters.provider.js";
import { JobProvider } from "../services/jobs/providers/base.provider.js";

const candidate = (index) => ({ name: `Employer ${index}`, ...detectJobBoard(`https://jobs.ashbyhq.com/employer-${index}`), verification: { valid: true, credentialsRequired: false, uaeJobsFound: 1 } });

test("discovery excludes existing source identities, aliases, URLs and linked company domains", () => {
  const sources = [{ _id: "existing", name: "Checkout.com", type: "ashby", providerOrganizationId: "checkout.com", careersUrl: "https://jobs.ashbyhq.com/checkout.com/" }];
  const companies = [{ name: "Example LLC UAE", normalizedName: "example", websiteDomain: "example.ae", source: "existing" }];
  const exclusions = createExclusionSet(sources, companies);
  for (const source of [{ name: "checkout-com" }, { name: "checkout" }, { name: "Different", type: "ashby", providerOrganizationId: "CHECKOUT.COM" }, { careersUrl: "https://jobs.ashbyhq.com/checkout.com?tracking=x" }, { name: "Example Middle East" }, { website: "https://www.example.ae/careers" }, { _id: "existing" }]) assert.ok(duplicateSource(source, exclusions));
  assert.equal(duplicateSource(candidate(1), exclusions), null);
  assert.equal(createExclusionSet([], [{ name: "Standalone company" }]).size, 0);
});

test("provider detection resolves actual IDs from board links and embed URLs", () => {
  for (const [url, type, id] of [
    ["https://jobs.lever.co/certik/a-job", "lever", "certik"],
    ["https://boards.greenhouse.io/embed/job_board?for=mongodb", "greenhouse", "mongodb"],
    ["https://jobs.smartrecruiters.com/oneclick-ui/company/IFS1/publication/abc", "smartrecruiters", "IFS1"],
    ["https://jobs.ashbyhq.com/checkout.com/a-job", "ashby", "checkout.com"],
    ["https://apply.workable.com/api/v1/widget/accounts/foodics?details=true", "workable", "foodics"],
  ]) { const result = detectJobBoard(url); assert.equal(result.type, type); assert.equal(result.providerOrganizationId, id); }
  assert.equal(detectJobBoard("https://jobs.eu.lever.co/example").providerRegion, "eu");
  assert.throws(() => detectJobBoard("https://linkedin.com/jobs"));
  assert.throws(() => detectJobBoard("https://apply.workable.com/api/private"));
  assert.throws(() => detectJobBoard("https://jobs.lever.co.evil.example/foo"));
  assert.equal(sourceIdentityKeys({ endpointUrl: "https://apply.workable.com/api/v1/widget/accounts/fuku" }).includes("board:workable:api"), false);
});

test("exactly 100 verified net-new sources are selected, excluding duplicates and invalid/blocked boards", () => {
  const existing = candidate(0);
  const candidates = [existing, { ...candidate(200), verification: { valid: false, access: "BLOCKED" } }, { ...candidate(201), verification: { valid: true, credentialsRequired: true, uaeJobsFound: 4 } }, { ...candidate(202), verification: { valid: true, uaeJobsFound: 0 } }, ...Array.from({ length: 110 }, (_, i) => candidate(i + 1))];
  candidates.splice(6, 0, { ...candidate(1), name: "Alias" });
  const result = selectVerifiedSources(candidates, createExclusionSet([existing]));
  assert.equal(result.length, 100);
  assert.equal(new Set(result.map((row) => row.providerOrganizationId)).size, 100);
  assert.equal(result[0].providerOrganizationId, "employer-1");
  assert.throws(() => selectVerifiedSources(result.slice(0, 99), new Set()), /only 99 qualify/);
});

test("all Emirates and Jebel Ali use the existing UAE filter taxonomy", () => {
  for (const location of ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain", "United Arab Emirates"]) assert.equal(normalizeUaeLocation(location), location);
  assert.equal(normalizeUaeLocation("Jebel Ali"), "Dubai");
  assert.equal(normalizeUaeLocation("Remote UAE"), "United Arab Emirates");
  assert.equal(normalizeUaeLocation("Remote USA"), null);
});

test("applying the batch creates exactly 100 net-new enabled records and runs every first sync, with safe resume", async () => {
  const selected = Array.from({ length: 100 }, (_, index) => candidate(index));
  const records = new Map();
  let syncs = 0;
  const dependencies = {
    findBySlug: async (slug) => records.get(slug),
    checkDuplicate: async (row) => duplicateSource(row, createExclusionSet([...records.values()])),
    createSource: async (source) => { const record = { _id: `source-${records.size}`, ...source }; records.set(source.slug, record); return record; },
    syncSource: async (id) => { syncs++; const source = [...records.values()].find((item) => item._id === id); source.lastSuccessfulSyncAt = new Date(); return { imported: 1, errors: [] }; },
  };
  await assert.rejects(addDiscoveryBatch(selected.slice(0, 99), dependencies), /exactly 100/);
  assert.equal(records.size, 0);
  await addDiscoveryBatch(selected, dependencies);
  assert.equal(records.size, 100); assert.equal(syncs, 100);
  assert.ok([...records.values()].every((source) => source.enabled && source.syncIntervalHours === 6 && source.nextSyncAt && source.creationOrigin === "automated_source_discovery"));
  await addDiscoveryBatch(selected, dependencies);
  assert.equal(records.size, 100); assert.equal(syncs, 100);
});

test("public source verification distinguishes blocked feeds and required credentials", async () => {
  for (const [status, access] of [[401, "REQUIRES_CREDENTIALS"], [403, "BLOCKED"]]) {
    const result = await verifyJobSource(candidate(1), { providerOptions: { validateRemoteHost: false, fetchImpl: async () => ({ ok: false, status }) } });
    assert.equal(result.valid, false); assert.equal(result.access, access); assert.equal(result.credentialsRequired, status === 401);
  }
});

test("a subsequent discovery run excludes all 153 existing sources and adds only its own 100", async () => {
  const existing = Array.from({ length: 153 }, (_, i) => ({ _id: `old-${i}`, ...candidate(i) }));
  const selected = selectVerifiedSources([...existing, ...Array.from({ length: 110 }, (_, i) => candidate(i + 153))], createExclusionSet(existing));
  const records = new Map(existing.map(source => [source._id, source]));
  const before = JSON.stringify(existing);
  let syncs = 0;
  await addDiscoveryBatch(selected, {
    runId: "batch-two",
    findBySlug: async slug => [...records.values()].find(source => source.slug === slug),
    checkDuplicate: async row => duplicateSource(row, createExclusionSet([...records.values()])),
    createSource: async source => { const record = { _id: `new-${records.size}`, ...source }; records.set(record._id, record); return record; },
    syncSource: async () => { syncs++; return { imported: 1, errors: [] }; },
  });
  assert.equal(records.size, 253); assert.equal(syncs, 100);
  assert.equal(JSON.stringify(existing), before);
  assert.ok([...records.values()].filter(source => source.slug).every(source => source.slug.startsWith("discovery-batch-two-")));
});

test("provider rate limits with long Retry-After are deferred, never bypassed with early retries", async () => {
  let requests = 0;
  const provider = new JobProvider({}, { validateRemoteHost: false, fetchImpl: async () => { requests++; return { ok: false, status: 429, headers: { get: () => "120" } }; } });
  await assert.rejects(provider.requestJson("https://public.example/jobs"), /HTTP 429/);
  assert.equal(requests, 1);
});

test("deleted imported jobs retain tombstones and cannot create jobs or companies on a later sync", async () => {
  const stored = new Set();
  const Model = { updateOne: async ({ key }) => stored.add(key), exists: async (query) => query.key.$in.some((key) => stored.has(key)) };
  const deleted = { importedAt: new Date(), source: "source-1", sourceJobId: "job-1", normalizedApplicationUrl: "https://employer.example/job-1", fingerprint: "fingerprint" };
  await suppressDeletedJob(deleted, Model);
  assert.equal(stored.size, 3);
  assert.ok(await isJobSuppressed({ fingerprint: "fingerprint" }, Model));
  const result = await upsertJob(deleted, { _id: "source-1" }, { checkSuppressed: (job) => isJobSuppressed(job, Model), CompanyModel: { findOne: () => assert.fail("Must not create a company") }, JobModel: { create: () => assert.fail("Must not recreate a deleted job") } });
  assert.equal(result.outcome, "duplicates");
  assert.equal(result.job, null);
});

test("large SmartRecruiters boards use public UAE pagination without losing later UAE postings", async () => {
  const requests = [];
  const provider = new SmartRecruitersJobProvider({ name: "Large", type: "smartrecruiters", providerOrganizationId: "Large" }, {
    validateRemoteHost: false,
    fetchImpl: async (url) => {
      requests.push(url);
      const parsed = new URL(url);
      const body = parsed.pathname.endsWith("/uae-job") ? { id: "uae-job", location: { city: "Jebel Ali", country: "ae" } } : parsed.searchParams.has("country") ? { totalFound: 1, content: [{ id: "uae-job", location: { city: "Jebel Ali", country: "ae" } }] } : { totalFound: 6000, content: Array.from({ length: 100 }, (_, id) => ({ id, location: { country: "us" } })) };
      return { ok: true, json: async () => body };
    },
  });
  assert.equal((await provider.fetchJobs()).length, 1);
  assert.equal(provider.lastFetchStats.jobsFound, 6000);
  assert.match(requests[1], /country=ae/);
  assert.match(requests[1], /offset=0/);
});
