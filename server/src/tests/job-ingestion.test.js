import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyCategory, normalizeEmploymentType, normalizeExperience, normalizeSalary, normalizeUaeLocation,
  normalizeWorkMode, prepareDescription, scoreImport, validateNormalizedJob,
} from "../services/jobs/jobNormalization.service.js";
import { buildDedupeCriteria, buildImportedUpdate, normalizeCompanyName, normalizeImportedJob, resolveCompany, upsertJob } from "../services/jobs/jobImport.service.js";
import { GreenhouseJobProvider } from "../services/jobs/providers/greenhouse.provider.js";
import { LeverJobProvider } from "../services/jobs/providers/lever.provider.js";
import { SmartRecruitersJobProvider } from "../services/jobs/providers/smartRecruiters.provider.js";
import { WorkableJobProvider } from "../services/jobs/providers/workable.provider.js";
import { buildPublicCategoryFilter } from "../services/jobs/jobFilter.service.js";

test("UAE locations normalize to the existing filter taxonomy and foreign jobs are rejected", () => {
  assert.equal(normalizeUaeLocation("Dubai - United Arab Emirates"), "Dubai");
  assert.equal(normalizeUaeLocation("RAK, UAE"), "Ras Al Khaimah");
  assert.equal(normalizeUaeLocation("Remote", "AE"), "United Arab Emirates");
  assert.equal(normalizeUaeLocation("Riyadh, Saudi Arabia"), null);
});

test("classification rules normalize filters deterministically", () => {
  assert.equal(classifyCategory({ title: "Senior Frontend Developer" }), "Software Development");
  assert.equal(classifyCategory({ title: "Document Controller" }), "Document Control");
  assert.equal(classifyCategory({ title: "Legal Counsel", description: "Advise a global software company" }), "Legal");
  assert.equal(classifyCategory({ title: "Cost Manager", description: "Use project management software" }), "Construction");
  assert.equal(classifyCategory({ title: "Vice President", description: "Lead software and engineering teams" }), "Management");
  assert.equal(normalizeEmploymentType("Permanent full time"), "full-time");
  assert.equal(normalizeEmploymentType("6 month fixed-term"), "contract");
  assert.equal(normalizeEmploymentType(""), "not-specified");
  assert.equal(normalizeWorkMode("Hybrid workplace"), "hybrid");
  assert.equal(normalizeWorkMode("", "Dubai"), "not-specified");
  assert.deepEqual(normalizeExperience("2-4 years"), { experienceLevel: "mid", minimumExperience: 2, maximumExperience: 4, originalExperienceText: "2-4 years" });
});

test("web development filtering excludes unrelated roles misclassified by legacy imports", () => {
  const filter = buildPublicCategoryFilter("web-development");
  assert.deepEqual(filter.categorySlug, { $in: ["software-development", "web-development"] });
  assert.equal(filter.semanticMatch.title.test("Senior Frontend Developer"), true);
  assert.equal(filter.semanticMatch.title.test("Legal Counsel"), false);
  assert.equal(filter.semanticMatch.title.test("Vice President"), false);
  assert.equal(filter.semanticMatch.title.test("Cost Manager"), false);
});

test("salary parser only structures explicit AED salary data", () => {
  assert.deepEqual(normalizeSalary({ salaryText: "AED 10,000 - 15,000 per month" }), { minimumSalary: 10000, maximumSalary: 15000, salaryCurrency: "AED", salaryPeriod: "month", salaryVisible: true });
  assert.equal(normalizeSalary({ salaryText: "$80,000 per year" }).salaryVisible, false);
  assert.equal(normalizeSalary({ minimumSalary: 5000, salaryCurrency: "USD" }).salaryVisible, false);
});

test("imported HTML removes active content and attributes but preserves safe formatting", () => {
  const result = prepareDescription('<script>alert(1)</script><h2 onclick="evil()">Role</h2><p>Build <strong>safe</strong> systems.</p><form>track</form>');
  assert.equal(result.descriptionHtml, "<h2>Role</h2><p>Build <strong>safe</strong> systems.</p>");
  assert.equal(result.description, "Role Build safe systems.");

  const encoded = prepareDescription('&lt;div class=&quot;content-intro&quot;&gt;&lt;p&gt;&lt;span style=&quot;font-size: 12pt;&quot;&gt;Careem is building the Everything App.&lt;/span&gt;&lt;/p&gt;&lt;/div&gt;');
  assert.equal(encoded.descriptionHtml, "<div><p><span>Careem is building the Everything App.</span></p></div>");
  assert.equal(encoded.description, "Careem is building the Everything App.");
});

test("validation and transparent quality scoring cover malformed and expired jobs", () => {
  const valid = { title: "Engineer", companyName: "Acme", location: "Dubai", description: "A".repeat(120), applicationUrl: "https://example.com/apply", sourceUrl: "https://example.com/job", postedAt: new Date(), expiresAt: new Date(Date.now() + 86_400_000), category: "Engineering", employmentType: "full-time", workMode: "on-site" };
  assert.equal(validateNormalizedJob(valid).valid, true);
  assert.equal(scoreImport(valid).score, 100);
  assert.deepEqual(validateNormalizedJob({ ...valid, title: "", companyName: "", location: null, description: "x", applicationUrl: "", expiresAt: new Date(0) }).errors, ["missing_title", "missing_company", "non_uae_location", "malformed_description", "invalid_application_url", "expired_job"]);
});

test("company normalization prevents trivial UAE legal suffix duplicates", () => {
  assert.equal(normalizeCompanyName("ABC Technologies L.L.C."), normalizeCompanyName("ABC Technologies LLC"));
  assert.equal(normalizeCompanyName("ABC Technologies Limited"), "abc technologies");
});

test("company resolver reuses a normalized provider company and creates only when unmatched", async () => {
  const source = { _id: "source-1", name: "ABC Technologies LLC", type: "greenhouse", providerOrganizationId: "abc" };
  const existing = { _id: "company-1", name: "ABC Technologies", normalizedName: "abc technologies", logo: "", website: "https://abc.example/", websiteDomain: "abc.example", careersUrl: "", description: "", headquarters: "", providerIdentities: [{ provider: "greenhouse", organizationId: "abc" }], overrideFields: [] };
  let created = 0;
  const reused = await resolveCompany({ companyName: "ABC Technologies L.L.C.", companyWebsite: "https://abc.example/", sourceCompanyId: "abc" }, source, { CompanyModel: { findOne: async () => existing, create: async () => { created += 1; }, exists: async () => false } });
  assert.equal(reused._id, "company-1"); assert.equal(created, 0);
  const made = await resolveCompany({ companyName: "New UAE Co", companyWebsite: "https://new.example/" }, { ...source, providerOrganizationId: "new" }, { CompanyModel: { findOne: async () => null, exists: async () => false, create: async (value) => { created += 1; return { _id: "company-2", ...value }; } } });
  assert.equal(made.normalizedName, "new uae co"); assert.equal(created, 1);
});

test("deduplication criteria cover provider ID, apply URL, and normalized fingerprint", () => {
  const criteria = buildDedupeCriteria({ sourceJobId: "gh-1", normalizedApplicationUrl: "https://example.com/a", fingerprint: "abc" }, { _id: "source-1" });
  assert.deepEqual(criteria.sourceJob, { source: "source-1", sourceJobId: "gh-1" });
  assert.deepEqual(criteria.applicationUrl, { normalizedApplicationUrl: "https://example.com/a" });
  assert.equal(criteria.fingerprint.fingerprint, "abc");
});

test("admin-controlled fields survive future imported updates", () => {
  const existing = { title: "Admin title", category: "IT", description: "Old", featured: true, status: "hidden", overrideFields: ["title", "category", "status"] };
  const { update, changed } = buildImportedUpdate(existing, { title: "Feed title", category: "Engineering", description: "New", featured: false, status: "published" });
  assert.equal(update.title, undefined); assert.equal(update.category, undefined); assert.equal(update.status, undefined); assert.equal(update.featured, undefined);
  assert.equal(update.description, "New"); assert.equal(changed, true); assert.equal(update.importStatus, "updated");
});

test("upsert creates a new normalized job and flags uncertain cross-source duplicates", async () => {
  const company = { _id: "company-1", name: "Example", logo: "", normalizedName: "example", providerIdentities: [], overrideFields: [] };
  const CompanyModel = { findOne: async () => company, exists: async () => false };
  const createdJobs = [];
  const JobModel = { findOne: async () => null, exists: async () => false, create: async (value) => { createdJobs.push(value); return { _id: `job-${createdJobs.length}`, ...value }; } };
  const source = { _id: "source-a", type: "greenhouse", name: "Example" };
  const data = { title: "Engineer", companyName: "Example", location: "Dubai", employmentType: "full-time", sourceJobId: "a1", normalizedApplicationUrl: "https://example.com/a1", fingerprint: "fp1", companyLogo: "" };
  assert.equal((await upsertJob({ ...data }, source, { CompanyModel, JobModel })).outcome, "created");
  const duplicateModel = { ...JobModel, findOne: async (query) => query.fingerprint ? { _id: "other-job", source: "source-b" } : null };
  const duplicate = await upsertJob({ ...data, sourceJobId: "a2", normalizedApplicationUrl: "https://example.com/a2" }, source, { CompanyModel, JobModel: duplicateModel });
  assert.equal(duplicate.outcome, "duplicates"); assert.equal(duplicate.job.status, "pending"); assert.equal(duplicate.job.importStatus, "duplicate");
});

test("Greenhouse fetch uses a mocked public response and normalizes ATS data", async () => {
  const source = { name: "Example Co", type: "greenhouse", providerOrganizationId: "example", baseUrl: "https://example.com", careersUrl: "https://example.com/careers" };
  const provider = new GreenhouseJobProvider(source, { validateRemoteHost: false, fetchImpl: async () => ({ ok: true, json: async () => ({ jobs: [{ id: 7, title: "Backend Engineer", content: "<p>Build and operate reliable UAE services with our experienced engineering team using modern backend systems and careful production practices.</p>", location: { name: "Dubai, UAE" }, absolute_url: "https://example.com/jobs/7" }] }) }) });
  const jobs = await provider.fetchJobs(); assert.equal(jobs.length, 1);
  const normalized = await normalizeImportedJob(jobs[0], { ...source, _id: "source-id", autoPublish: true, trusted: true, qualityThreshold: 70 }, provider, new Date("2026-01-01"));
  assert.equal(normalized.data.sourceProvider, "greenhouse"); assert.equal(normalized.data.creationOrigin, "ats_import"); assert.equal(normalized.data.location, "Dubai"); assert.equal(normalized.data.category, "Software Development"); assert.equal(normalized.data.status, "published");
});

test("foreign imported jobs reach validation instead of failing during slug generation", async () => {
  const source = { _id: "source-id", name: "Example Co", type: "greenhouse", providerOrganizationId: "example", autoPublish: true, trusted: true, qualityThreshold: 70 };
  const provider = new GreenhouseJobProvider(source, { validateRemoteHost: false });
  const normalized = await normalizeImportedJob({
    id: 8, title: "Backend Engineer", content: `<p>${"Build reliable backend systems. ".repeat(4)}</p>`,
    location: { name: "Lahore, Pakistan" }, absolute_url: "https://example.com/jobs/8",
  }, source, provider, new Date("2026-01-01"));
  assert.equal(normalized.data.location, null);
  assert.equal(normalized.data.locationSlug, "");
  assert.equal(normalized.data.status, "rejected");
  assert.deepEqual(normalized.validation.errors, ["non_uae_location"]);
});

test("SmartRecruiters fetch requests public postings and only expands UAE summaries", async () => {
  const requested = [];
  const responses = [
    { content: [
      { id: "uae-1", location: { city: "Dubai", country: "ae" } },
      { id: "foreign-1", location: { city: "Riyadh", country: "sa" } },
    ] },
    {
      id: "uae-1", name: "Project Manager", company: { identifier: "example", name: "Example Co" },
      location: { city: "Dubai", country: "ae" }, ref: "https://jobs.example.com/uae-1", releasedDate: "2026-01-01",
      jobAd: { sections: { jobDescription: { text: "Lead complex UAE projects and coordinate delivery teams across every stage of execution." } } },
    },
  ];
  const provider = new SmartRecruitersJobProvider(
    { name: "Example Co", type: "smartrecruiters", providerOrganizationId: "example" },
    { validateRemoteHost: false, fetchImpl: async (url) => {
      requested.push(url);
      const body = responses.shift();
      return { ok: true, json: async () => body };
    } },
  );
  const jobs = await provider.fetchJobs();
  assert.equal(jobs.length, 1);
  assert.match(requested[0], /[?&]destination=PUBLIC(?:&|$)/);
  assert.match(requested[1], /\/postings\/uae-1$/);
  assert.equal(requested.some((url) => url.endsWith("/foreign-1")), false);
});

test("Workable fetch uses the direct public widget endpoint", async () => {
  let requestedUrl = "";
  const provider = new WorkableJobProvider(
    { name: "Example Co", type: "workable", providerOrganizationId: "example" },
    { validateRemoteHost: false, fetchImpl: async (url) => {
      requestedUrl = url;
      return { ok: true, json: async () => ({ name: "Example Co", jobs: [] }) };
    } },
  );
  assert.deepEqual(await provider.fetchJobs(), []);
  assert.equal(requestedUrl, "https://apply.workable.com/api/v1/widget/accounts/example?details=true");
});

test("Lever adapter preserves apply destination and filter fields", () => {
  const provider = new LeverJobProvider({ name: "Example", type: "lever", providerOrganizationId: "example" }, { validateRemoteHost: false });
  const job = provider.normalizeJob({ id: "l1", text: "Sales Manager", description: "Lead our UAE sales team.", hostedUrl: "https://jobs.lever.co/example/l1", applyUrl: "https://jobs.lever.co/example/l1/apply", categories: { location: "Abu Dhabi, UAE", commitment: "Full-time", team: "Sales" }, workplaceType: "hybrid" });
  assert.equal(job.applicationUrl, "https://jobs.lever.co/example/l1/apply"); assert.equal(job.location, "Abu Dhabi, UAE"); assert.equal(job.workMode, "hybrid");
});
