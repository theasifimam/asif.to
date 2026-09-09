import Company from "../../models/Company.js";
import Job from "../../models/Job.js";
import JobSource from "../../models/JobSource.js";
import JobSyncLog from "../../models/JobSyncLog.js";
import { cleanStringArray, cleanText, escapeRegex, normalizeUrl, normalizedJobFingerprint } from "../../utils/jobValidation.js";
import { slugify } from "../../utils/slugify.js";
import {
  classifyCategory, normalizeEmploymentType, normalizeExperience, normalizeSalary, normalizeUaeLocation,
  normalizeWorkMode, prepareDescription, scoreImport, validateNormalizedJob,
} from "./jobNormalization.service.js";
import { providerForSource } from "./providers/index.js";

const asDate = (value, fallback = null) => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
};

export const normalizeCompanyName = (value) => cleanText(value, 180).toLowerCase()
  .replace(/&/g, " and ").replace(/\b(l\.?l\.?c\.?|limited|ltd\.?|incorporated|inc\.?|corp(?:oration)?\.?|fze|fzco|pjsc|llp|plc)\b/gi, " ")
  .replace(/[^a-z0-9]+/g, " ").trim().replace(/\b(uae|united arab emirates|middle east)\b$/i, "").trim().replace(/\s+/g, " ");

const websiteDomain = (value) => {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
};

async function uniqueSlug(model, value, excludeId = null) {
  const base = slugify(value) || `item-${Date.now()}`; let slug = base; let counter = 2;
  while (await model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) slug = `${base}-${counter++}`;
  return slug;
}

const creationOriginFor = (source) => ["greenhouse", "lever", "smartrecruiters", "workable", "ashby"].includes(source.type)
  ? "ats_import" : source.type === "api" ? "api_import" : "automated_import";

export async function resolveCompany(data, source, { CompanyModel = Company } = {}) {
  const name = cleanText(data.companyName, 180);
  if (!name) throw new Error("Company name is required.");
  const normalizedName = normalizeCompanyName(name); const domain = websiteDomain(data.companyWebsite);
  const identity = cleanText(data.sourceCompanyId || source.providerOrganizationId, 300); const candidates = [];
  if (identity) candidates.push({ providerIdentities: { $elemMatch: { provider: source.type, organizationId: identity } } });
  if (domain) candidates.push({ websiteDomain: domain });
  if (normalizedName) candidates.push({ normalizedName });
  candidates.push({ name: new RegExp(`^${escapeRegex(name)}$`, "i") });
  let company = await CompanyModel.findOne({ $or: candidates }); const origin = creationOriginFor(source);
  if (!company) {
    company = await CompanyModel.create({
      name, normalizedName, slug: await uniqueSlug(CompanyModel, name), logo: data.companyLogo || "", website: data.companyWebsite || "",
      websiteDomain: domain, careersUrl: data.companyCareersUrl || source.careersUrl || "", description: cleanText(data.companyDescription, 5000),
      headquarters: cleanText(data.companyHeadquarters, 180), active: true, creationOrigin: origin, source: source._id,
      sourceName: source.name, sourceProvider: source.type, providerIdentities: identity ? [{ provider: source.type, organizationId: identity }] : [],
    });
    return company;
  }
  const protectedFields = new Set(company.overrideFields || []); const fill = {};
  const offered = { logo: data.companyLogo, website: data.companyWebsite, websiteDomain: domain, careersUrl: data.companyCareersUrl || source.careersUrl, description: data.companyDescription, headquarters: data.companyHeadquarters };
  for (const [key, value] of Object.entries(offered)) if (value && !company[key] && !protectedFields.has(key)) fill[key] = key === "description" ? cleanText(value, 5000) : value;
  if (!company.normalizedName) fill.normalizedName = normalizedName;
  if (identity && !(company.providerIdentities || []).some((item) => item.provider === source.type && item.organizationId === identity)) fill.providerIdentities = [...(company.providerIdentities || []), { provider: source.type, organizationId: identity }];
  if (Object.keys(fill).length) { Object.assign(company, fill); await company.save(); }
  return company;
}

const compactSnapshot = (raw) => {
  try { return { snapshot: JSON.stringify(raw).slice(0, 12_000) }; } catch { return {}; }
};

export async function normalizeImportedJob(raw, source, provider, now = new Date()) {
  const data = await provider.normalizeJob(raw); const title = cleanText(data.title, 220);
  const companyName = cleanText(data.companyName || source.name, 180); const location = normalizeUaeLocation(data.location, data.country);
  const description = prepareDescription(data.description); const applicationUrl = normalizeUrl(data.applicationUrl, { required: true });
  const sourceUrl = normalizeUrl(data.sourceUrl || applicationUrl, { required: true });
  const category = classifyCategory({ title, description: description.description, category: data.category });
  const employmentType = normalizeEmploymentType(`${data.employmentType || ""} ${title} ${description.description}`);
  const workMode = normalizeWorkMode(`${data.workMode || ""} ${title} ${description.description}`, data.location);
  const experience = normalizeExperience(data.experienceText || data.experienceLevel, title); const salary = normalizeSalary(data);
  const postedAt = asDate(data.postedAt, now); const expiresAt = asDate(data.expiresAt);
  const result = {
    title, companyName, companyLogo: data.companyLogo ? normalizeUrl(data.companyLogo) : "",
    companyWebsite: data.companyWebsite ? normalizeUrl(data.companyWebsite) : "", companyCareersUrl: data.companyCareersUrl ? normalizeUrl(data.companyCareersUrl) : "",
    companyDescription: cleanText(data.companyDescription, 5000), companyHeadquarters: cleanText(data.companyHeadquarters, 180),
    ...description, responsibilities: cleanStringArray(data.responsibilities), requirements: cleanStringArray(data.requirements), benefits: cleanStringArray(data.benefits), skills: cleanStringArray(data.skills),
    category, categorySlug: slugify(category), location, locationSlug: slugify(location), emirate: location === "Al Ain" ? "Abu Dhabi" : location || "", country: "AE",
    employmentType, workMode, ...experience, ...salary, applicationType: "external", applicationUrl,
    normalizedApplicationUrl: applicationUrl.toLowerCase().replace(/\/$/, ""), source: source._id, sourceName: source.name, sourceUrl,
    sourceJobId: cleanText(data.sourceJobId, 300), sourceProvider: source.type, sourceCompanyId: cleanText(data.sourceCompanyId || source.providerOrganizationId, 300),
    creationOrigin: creationOriginFor(source), importedAt: now, lastSyncedAt: now, lastSeenAt: now, missingSyncCount: 0, postedAt, expiresAt,
    fingerprint: normalizedJobFingerprint({ title, companyName, location, employmentType }), importedData: compactSnapshot(data.raw || raw),
  };
  const quality = scoreImport(result); const validation = validateNormalizedJob(result, now);
  result.importQualityScore = quality.score; result.importQualityBreakdown = quality.checks;
  result.status = !validation.valid
    ? "rejected"
    : source.autoPublish && source.trusted && quality.score >= source.qualityThreshold ? "published"
      : quality.score < 70 ? "rejected" : "pending";
  result.importStatus = validation.valid ? "imported" : "validation_failed";
  return { data: result, validation, quality };
}

export async function deduplicateJob(data, source, { JobModel = Job } = {}) {
  const criteria = buildDedupeCriteria(data, source);
  if (criteria.sourceJob) {
    const match = await JobModel.findOne(criteria.sourceJob);
    if (match) return { match, type: "source_job_id", confidence: 1, update: true };
  }
  if (criteria.applicationUrl) {
    const match = await JobModel.findOne(criteria.applicationUrl);
    if (match) return { match, type: "application_url", confidence: 1, update: String(match.source) === String(source._id) };
  }
  const match = await JobModel.findOne(criteria.fingerprint);
  if (match) return { match, type: "fingerprint", confidence: 0.88, update: String(match.source) === String(source._id) };
  return null;
}

export function buildDedupeCriteria(data, source) {
  return {
    sourceJob: data.sourceJobId ? { source: source._id, sourceJobId: data.sourceJobId } : null,
    applicationUrl: data.normalizedApplicationUrl ? { normalizedApplicationUrl: data.normalizedApplicationUrl } : null,
    fingerprint: { fingerprint: data.fingerprint, status: { $nin: ["archived"] } },
  };
}

const comparable = (value) => JSON.stringify(value instanceof Date ? value.toISOString() : value ?? null);

export function buildImportedUpdate(existing, data) {
  const protectedFields = new Set(existing.overrideFields || []); const update = {}; let changed = false;
  for (const [key, value] of Object.entries(data)) {
    if (protectedFields.has(key) || ["slug", "featured", "verified", "createdBy", "updatedBy"].includes(key)) continue;
    if (comparable(existing[key]) !== comparable(value)) {
      update[key] = value;
      if (!["lastSeenAt", "lastSyncedAt", "importedAt", "importStatus", "importedData"].includes(key)) changed = true;
    }
  }
  update.importedAt = existing.importedAt || data.importedAt; update.missingSyncCount = 0; update.sourceRemovedAt = null;
  update.importStatus = changed ? "updated" : "unchanged"; if (changed) update.lastImportChangedAt = new Date();
  return { update, changed };
}

export async function upsertJob(data, source, { CompanyModel = Company, JobModel = Job } = {}) {
  const company = await resolveCompany(data, source, { CompanyModel }); data.company = company._id; data.companyName = company.name; data.companyLogo ||= company.logo;
  data.fingerprint = normalizedJobFingerprint({ title: data.title, companyName: company.name, location: data.location, employmentType: data.employmentType });
  const duplicate = await deduplicateJob(data, source, { JobModel });
  if (duplicate && !duplicate.update) {
    const slug = await uniqueSlug(JobModel, `${data.title}-${data.companyName}-${data.location}`);
    const job = await JobModel.create({ ...data, slug, status: "pending", importStatus: "duplicate", duplicateCandidate: duplicate.match._id, duplicateConfidence: duplicate.confidence });
    return { outcome: "duplicates", job };
  }
  if (!duplicate) {
    const slug = await uniqueSlug(JobModel, `${data.title}-${data.companyName}-${data.location}`);
    return { outcome: "created", job: await JobModel.create({ ...data, slug, lastImportChangedAt: new Date() }) };
  }
  const existing = duplicate.match; const { update, changed } = buildImportedUpdate(existing, data);
  await JobModel.updateOne({ _id: existing._id }, { $set: update });
  return { outcome: changed ? "updated" : "unchanged", job: await JobModel.findById(existing._id) };
}

const logError = (errors, raw, error) => {
  if (errors.length >= 25) return;
  errors.push({ sourceJobId: cleanText(raw?.id || raw?.jobId || raw?.shortcode, 300), code: cleanText(error.code || "IMPORT_ERROR", 80), message: cleanText(error.message, 1000) });
};

export async function syncJobSource(sourceId, { trigger = "scheduled", providerOptions } = {}) {
  const startedAt = new Date();
  const staleBefore = new Date(startedAt.getTime() - 45 * 60_000);
  const source = await JobSource.findOneAndUpdate(
    { _id: sourceId, enabled: true, $or: [{ syncStatus: { $ne: "running" } }, { lastSyncAt: null }, { lastSyncAt: { $lt: staleBefore } }] },
    { $set: { syncStatus: "running", lastSyncAt: startedAt, lastError: "" } }, { new: true },
  );
  if (!source) {
    const existing = await JobSource.findById(sourceId).select("enabled syncStatus").lean();
    if (!existing) throw Object.assign(new Error("Job source not found."), { statusCode: 404 });
    if (!existing.enabled) throw Object.assign(new Error("Enable this source before synchronizing it."), { statusCode: 400 });
    throw Object.assign(new Error("This source is already synchronizing."), { statusCode: 409 });
  }
  await JobSyncLog.updateMany({ source: source._id, status: "running", startedAt: { $lt: staleBefore } }, { $set: { status: "failed", completedAt: startedAt, "errors.0": { code: "STALE_RUN", message: "The worker stopped before completing this run." } } });
  const log = await JobSyncLog.create({ source: source._id, sourceName: source.name, provider: source.type, trigger, startedAt });
  const counts = { fetched: 0, created: 0, updated: 0, unchanged: 0, rejected: 0, duplicates: 0, validationFailed: 0, sourceRemoved: 0, errors: 0 }; const errors = [];
  try {
    const provider = providerForSource(source, providerOptions); const rawJobs = await provider.fetchJobs(); counts.fetched = rawJobs.length;
    for (const raw of rawJobs) {
      try {
        const normalized = await normalizeImportedJob(raw, source, provider);
        if (!normalized.validation.valid && ["missing_title", "missing_company", "non_uae_location", "invalid_application_url", "invalid_source_url", "malformed_description"].some((code) => normalized.validation.errors.includes(code))) {
          counts.validationFailed += 1; counts.rejected += 1;
          logError(errors, raw, Object.assign(new Error(normalized.validation.errors.join(", ")), { code: "VALIDATION_FAILED" })); continue;
        }
        const result = await upsertJob(normalized.data, source); counts[result.outcome] += 1;
      } catch (error) { counts.errors += 1; logError(errors, raw, error); }
    }
    await Job.updateMany({ source: source._id, importedAt: { $ne: null }, lastSeenAt: { $lt: startedAt }, importStatus: { $ne: "source_removed" } }, { $inc: { missingSyncCount: 1 } });
    const missing = await Job.updateMany({ source: source._id, importedAt: { $ne: null }, lastSeenAt: { $lt: startedAt }, missingSyncCount: { $gte: 2 }, importStatus: { $ne: "source_removed" } }, { $set: { importStatus: "source_removed", sourceRemovedAt: new Date() } });
    counts.sourceRemoved = missing.modifiedCount;
    await Job.updateMany({ source: source._id, importStatus: "source_removed", status: "published", overrideFields: { $ne: "status" } }, { $set: { status: "expired", expiresAt: new Date() } });
    const completedAt = new Date(); const runStatus = counts.errors || counts.validationFailed ? "partial" : "success";
    Object.assign(source, {
      syncStatus: "success", availabilityStatus: "available", lastSuccessfulSyncAt: completedAt,
      nextSyncAt: source.syncFrequency === "manual" ? null : new Date(completedAt.getTime() + source.syncIntervalHours * 3_600_000),
      lastRunImported: counts.created, lastRunUpdated: counts.updated, lastRunRejected: counts.rejected, lastRunDuplicates: counts.duplicates, lastRunUnchanged: counts.unchanged,
      numberImported: source.numberImported + counts.created, numberUpdated: source.numberUpdated + counts.updated,
      numberRejected: source.numberRejected + counts.rejected, numberDuplicates: source.numberDuplicates + counts.duplicates, numberUnchanged: source.numberUnchanged + counts.unchanged,
      lastError: errors.length ? errors.map((item) => item.message).join("; ").slice(0, 2000) : "",
    });
    await source.save(); Object.assign(log, { status: runStatus, completedAt, durationMs: completedAt - startedAt, counts, errors }); await log.save();
    return { imported: counts.created, updated: counts.updated, unchanged: counts.unchanged, rejected: counts.rejected, duplicates: counts.duplicates, sourceRemoved: counts.sourceRemoved, errors };
  } catch (error) {
    const completedAt = new Date(); source.syncStatus = "failed"; source.availabilityStatus = /HTTP (401|403|404)/.test(error.message) ? "unavailable" : "available";
    source.lastError = cleanText(error.message, 2000); source.nextSyncAt = source.syncFrequency === "manual" ? null : new Date(completedAt.getTime() + source.syncIntervalHours * 3_600_000); await source.save();
    await Job.updateMany({ source: source._id, importedAt: { $ne: null } }, { $set: { importStatus: "sync_error" } });
    counts.errors += 1; logError(errors, null, error); Object.assign(log, { status: "failed", completedAt, durationMs: completedAt - startedAt, counts, errors }); await log.save();
    throw error;
  }
}
