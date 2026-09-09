import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCompanyName, normalizeImportedJob } from "../services/jobs/jobImport.service.js";
import { runMaintenance } from "../services/jobs/jobScheduler.service.js";
import { seedJobSourceDefinitions } from "../services/jobs/jobSourceSeed.service.js";
import { verifyAndPersistJobSource, verifyJobSource } from "../services/jobs/jobSourceVerification.service.js";
import { AshbyJobProvider } from "../services/jobs/providers/ashby.provider.js";
import { LeverJobProvider } from "../services/jobs/providers/lever.provider.js";
import { UAE_JOB_SOURCE_DEFINITIONS } from "../services/jobs/uaeSourceRegistry.js";

function memoryJobSources() {
  const documents = new Map();
  return {
    documents,
    async updateOne(filter, update) {
      const current = documents.get(filter.slug);
      if (!current) {
        documents.set(filter.slug, { _id: `id-${documents.size + 1}`, ...update.$setOnInsert, ...update.$set });
        return { upsertedCount: 1, modifiedCount: 0 };
      }
      Object.assign(current, update.$set || {});
      return { upsertedCount: 0, modifiedCount: 1 };
    },
    async findOne(filter) { return documents.get(filter.slug) || null; },
  };
}

test("the curated UAE registry contains exactly 50 unique provider-resolved sources", () => {
  assert.equal(UAE_JOB_SOURCE_DEFINITIONS.length, 50);
  assert.equal(new Set(UAE_JOB_SOURCE_DEFINITIONS.map((item) => item.slug)).size, 50);
  assert.deepEqual(
    UAE_JOB_SOURCE_DEFINITIONS.reduce((counts, item) => ({ ...counts, [item.type]: (counts[item.type] || 0) + 1 }), {}),
    { lever: 24, smartrecruiters: 8, greenhouse: 13, ashby: 5 },
  );
  for (const source of UAE_JOB_SOURCE_DEFINITIONS) {
    assert.ok(source.providerOrganizationId);
    assert.match(source.careersUrl, /^https:\/\//);
    assert.match(source.endpointUrl, /^https:\/\//);
    assert.equal(source.syncIntervalHours, 6);
  }
});

test("seeding the 50-source registry is idempotent and preserves admin-controlled settings", async () => {
  const JobSourceModel = memoryJobSources();
  const first = await seedJobSourceDefinitions(UAE_JOB_SOURCE_DEFINITIONS, { JobSourceModel });
  assert.equal(first.created, 50);
  assert.equal(JobSourceModel.documents.size, 50);
  const kpler = JobSourceModel.documents.get("lever-kpler");
  kpler.enabled = false;
  kpler.syncIntervalHours = 48;
  const second = await seedJobSourceDefinitions(UAE_JOB_SOURCE_DEFINITIONS, { JobSourceModel });
  assert.equal(second.created, 0);
  assert.equal(second.updated, 50);
  assert.equal(JobSourceModel.documents.size, 50);
  assert.equal(kpler.enabled, false);
  assert.equal(kpler.syncIntervalHours, 48);
});

test("source verification enables valid UAE feeds and keeps invalid provider IDs disabled", async () => {
  const validSource = { _id: "valid", name: "Example", type: "lever", providerOrganizationId: "example" };
  const valid = await verifyJobSource(validSource, { providerOptions: {
    validateRemoteHost: false,
    fetchImpl: async () => ({ ok: true, json: async () => [{ id: "1", text: "Engineer", categories: { location: "Dubai, UAE" } }] }),
  } });
  assert.equal(valid.verificationStatus, "Verified");
  assert.equal(valid.uaeJobsFound, 1);
  assert.equal(valid.canSync, true);

  let persisted;
  const invalidSource = { _id: "invalid", name: "Missing", type: "lever", providerOrganizationId: "not-a-board" };
  const invalid = await verifyAndPersistJobSource(invalidSource, {
    JobSourceModel: { updateOne: async (_filter, update) => { persisted = update.$set; } },
    enableWhenVerified: true,
    providerOptions: { validateRemoteHost: false, fetchImpl: async () => ({ ok: false, status: 404, json: async () => ({}) }) },
  });
  assert.equal(invalid.verificationStatus, "Source Unavailable");
  assert.equal(invalid.canSync, false);
  assert.equal(persisted.enabled, false);
});

test("zero-UAE feeds remain valid but are not eligible for scheduled sync", async () => {
  const source = { name: "Example", type: "lever", providerOrganizationId: "example" };
  const result = await verifyJobSource(source, { providerOptions: {
    validateRemoteHost: false,
    fetchImpl: async () => ({ ok: true, json: async () => [{ id: "1", text: "Engineer", categories: { location: "London, UK" } }] }),
  } });
  assert.equal(result.reachable, true);
  assert.equal(result.providerValid, true);
  assert.equal(result.verificationStatus, "No UAE Jobs Currently");
  assert.equal(result.canSync, false);
});

test("provider fetches return only UAE jobs before ingestion", async () => {
  const provider = new LeverJobProvider(
    { name: "Example", type: "lever", providerOrganizationId: "example" },
    { validateRemoteHost: false, fetchImpl: async () => ({ ok: true, json: async () => [
      { id: "uae", text: "Engineer", categories: { location: "Abu Dhabi" } },
      { id: "foreign", text: "Engineer", categories: { location: "London, UK" } },
    ] }) },
  );
  const jobs = await provider.fetchJobs();
  assert.deepEqual(jobs.map((job) => job.id), ["uae"]);
  assert.deepEqual(provider.lastFetchStats, { jobsFound: 2, uaeJobsFound: 1 });
});

test("Ashby adapter maps official URLs and preserves ATS import origin", async () => {
  const source = { _id: "source", name: "Example", type: "ashby", providerOrganizationId: "example", autoPublish: true, trusted: true, qualityThreshold: 70 };
  const raw = {
    id: "ashby-1", title: "Sales Manager", department: "Sales", employmentType: "FullTime", location: "Dubai, UAE",
    workplaceType: "Hybrid", publishedAt: "2026-09-01", isListed: true,
    jobUrl: "https://jobs.ashbyhq.com/example/ashby-1", applyUrl: "https://jobs.ashbyhq.com/example/ashby-1/application",
    descriptionHtml: `<p>${"Lead UAE enterprise sales and build lasting customer relationships. ".repeat(3)}</p>`,
  };
  const provider = new AshbyJobProvider(source, { validateRemoteHost: false, fetchImpl: async () => ({ ok: true, json: async () => ({ jobs: [raw] }) }) });
  const [fetched] = await provider.fetchJobs();
  const normalized = await normalizeImportedJob(fetched, source, provider, new Date("2026-09-09"));
  assert.equal(normalized.data.creationOrigin, "ats_import");
  assert.equal(normalized.data.sourceProvider, "ashby");
  assert.equal(normalized.data.applicationUrl, raw.applyUrl);
  assert.equal(normalized.data.location, "Dubai");
});

test("company matching collapses common UAE and Middle East suffix variants", () => {
  assert.equal(normalizeCompanyName("Deliveroo UAE"), normalizeCompanyName("Deliveroo Middle East"));
  assert.equal(normalizeCompanyName("Deliveroo United Arab Emirates"), "deliveroo");
});

test("scheduler queries enabled due sources and isolates one source failure", async () => {
  const calls = [];
  let sourceFilter;
  await runMaintenance({
    JobModel: { updateMany: async () => ({ modifiedCount: 0 }) },
    JobSourceModel: { find: async (filter) => { sourceFilter = filter; return [{ _id: "bad", name: "Bad" }, { _id: "good", name: "Good" }]; } },
    ensureSources: async () => {},
    syncSource: async (id) => { calls.push(id); if (id === "bad") throw new Error("source failed"); },
  });
  assert.equal(sourceFilter.enabled, true);
  assert.deepEqual(calls, ["bad", "good"]);
});
