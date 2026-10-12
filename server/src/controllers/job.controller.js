import fs from "fs/promises";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import JobEvent from "../models/JobEvent.js";
import JobSource from "../models/JobSource.js";
import JobSyncLog from "../models/JobSyncLog.js";
import SavedJob from "../models/SavedJob.js";
import { suppressDeletedJob } from "../services/jobs/jobSuppression.service.js";
import {
  APPLICATION_TYPES, CREATION_ORIGINS, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, GCC_COUNTRIES, GCC_LOCATIONS, IMPORT_STATUSES,
  JOB_STATUSES, SOURCE_TYPES, UAE_JOB_CATEGORIES, WORK_MODES,
} from "../constants/jobs.js";
import { activeJobCountries } from "../services/jobs/jobNormalization.service.js";
import { parseWorkdayId } from "../services/jobs/providers/workday.provider.js";
import { buildPublicCategoryFilter } from "../services/jobs/jobFilter.service.js";
import { getPrivateJobResumePath, validateJobResume } from "../middlewares/upload.middleware.js";
import { logActivity } from "../services/activity.service.js";
import { normalizeCompanyName, syncJobSource } from "../services/jobs/jobImport.service.js";
import { expireJobs } from "../services/jobs/jobScheduler.service.js";
import { verifyAndPersistJobSource } from "../services/jobs/jobSourceVerification.service.js";
import {
  assertSafeRemoteUrl, cleanStringArray, cleanText, decodeHtmlEntities, escapeRegex, normalizeUrl, normalizedJobFingerprint,
  parseNullableNumber, publicJobFilter, sanitizeJobHtml,
} from "../utils/jobValidation.js";
import { slugify } from "../utils/slugify.js";
import { diversifyByCompany } from "../utils/jobFeedOrder.js";
import { buildJobLearning } from "../services/jobs/jobLearning.service.js";
import { correctKeyword, suggestJobs } from "../services/jobs/jobSearch.service.js";
import { rankSimilarJobs } from "../services/jobs/jobSimilarity.service.js";
import { JOB_TAGS, JOB_TAG_IDS } from "../constants/jobTags.js";
import { buildCompanyInsights, salaryInsightFor } from "./jobInsights.controller.js";
import { SKILL_CATALOG } from "../services/jobs/skillCatalog.js";

// "Tech" roles for the tech-first landing page: stored categories, not a guess from titles.
const TECH_CATEGORY_SLUGS = ["software-development", "web-development", "it"];

// `?country=` accepts an ISO code or the country slug ("sa", "saudi-arabia", "uae"); anything else is ignored.
export const countryFromParam = (value) => {
  const key = String(value ?? "").trim().toLowerCase();
  return key ? GCC_COUNTRIES.find((country) => country.code.toLowerCase() === key || country.slug === key) || null : null;
};

const isId = (value) => mongoose.Types.ObjectId.isValid(value);
const asBoolean = (value) => value === true || value === "true" || value === "1";
const asDate = (value, fallback = null) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
};
const pageValues = (query, defaultLimit = 20) => {
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit || String(defaultLimit), 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const PUBLIC_LIST_SELECT = "-applicationUrl -normalizedApplicationUrl -sourceUrl -importedData -overrideFields -missingSyncCount -createdBy -updatedBy -creationOrigin -importStatus -importQualityScore -importQualityBreakdown -duplicateCandidate -duplicateConfidence -sourceCompanyId -sourceProvider -sourceRemovedAt -lastImportChangedAt";

const publicFields = (job) => {
  if (!job) return null;
  const value = typeof job.toObject === "function" ? job.toObject() : { ...job };
  const rawHtml = value.descriptionHtml || value.description || "";
  const decoded = decodeHtmlEntities(rawHtml);
  if (/<[a-z0-9]+(?:\s[^>]*)?>/i.test(decoded)) {
    value.descriptionHtml = sanitizeJobHtml(decoded);
    value.description = cleanText(decoded);
  } else {
    value.description = cleanText(value.description || decoded);
  }
  delete value.applicationUrl;
  delete value.normalizedApplicationUrl;
  delete value.importedData;
  delete value.overrideFields;
  delete value.missingSyncCount;
  delete value.createdBy;
  delete value.updatedBy;
  delete value.sourceUrl;
  delete value.importQualityBreakdown;
  delete value.duplicateCandidate;
  delete value.duplicateConfidence;
  delete value.sourceCompanyId;
  delete value.creationOrigin;
  delete value.importStatus;
  delete value.importQualityScore;
  delete value.sourceProvider;
  delete value.sourceRemovedAt;
  delete value.lastImportChangedAt;
  return value;
};

const errorResponse = (res, error, context) => {
  console.error(`[JOBS] ${context}:`, error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : "Internal server error",
  });
};

async function uniqueSlug(model, candidate, excludeId = null) {
  const base = slugify(candidate) || `item-${Date.now()}`;
  let result = base;
  let suffix = 2;
  while (await model.exists({ slug: result, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) result = `${base}-${suffix++}`;
  return result;
}

async function ensureManualSource(userId) {
  let source = await JobSource.findOne({ type: "manual", slug: "manual" });
  if (!source) {
    source = await JobSource.create({ name: "Manual", slug: "manual", type: "manual", enabled: true, createdBy: userId });
  }
  return source;
}

async function getCompany(value, body = {}) {
  if (isId(value)) {
    const company = await Company.findById(value);
    if (company) return company;
  }
  const companyName = cleanText(body.companyName || value, 180);
  if (!companyName) throw Object.assign(new Error("Company is required."), { statusCode: 400 });
  const existing = await Company.findOne({ name: new RegExp(`^${escapeRegex(companyName)}$`, "i") });
  if (existing) return existing;
  return Company.create({
    name: companyName,
    slug: await uniqueSlug(Company, companyName),
    logo: body.companyLogo ? normalizeUrl(body.companyLogo) : "",
    active: true,
  });
}

async function buildJobPayload(body, { existing = null, userId = null } = {}) {
  const company = await getCompany(body.company || body.companyId || existing?.company, {
    ...body,
    companyName: body.companyName || existing?.companyName,
    companyLogo: body.companyLogo === undefined ? existing?.companyLogo : body.companyLogo,
  });
  const requestedSource = body.source || body.sourceId || existing?.source;
  const source = isId(requestedSource)
    ? await JobSource.findById(requestedSource)
    : await ensureManualSource(userId);
  if (!source) throw Object.assign(new Error("Job source not found."), { statusCode: 400 });
  const title = cleanText(body.title ?? existing?.title, 220);
  const description = cleanText(body.description ?? existing?.description, 30_000);
  const descriptionChanged = existing && body.description !== undefined && cleanText(body.description, 30_000) !== existing.description;
  const category = cleanText(body.category ?? existing?.category, 120);
  const location = cleanText(body.location ?? existing?.location, 160);
  const emirate = cleanText(body.emirate ?? location ?? existing?.emirate, 80);
  if (!title || !description || !category || !location || !emirate) {
    throw Object.assign(new Error("Title, description, category, location, and emirate are required."), { statusCode: 400 });
  }
  const applicationType = body.applicationType ?? existing?.applicationType ?? "external";
  if (!APPLICATION_TYPES.includes(applicationType)) throw Object.assign(new Error("Invalid application type."), { statusCode: 400 });
  const applicationUrl = applicationType === "external"
    ? normalizeUrl(body.applicationUrl ?? existing?.applicationUrl, { required: true })
    : "";
  const employmentType = body.employmentType ?? existing?.employmentType ?? "full-time";
  const workMode = body.workMode ?? existing?.workMode ?? "on-site";
  const experienceLevel = body.experienceLevel ?? existing?.experienceLevel ?? "mid";
  if (!EMPLOYMENT_TYPES.includes(employmentType) || !WORK_MODES.includes(workMode) || !EXPERIENCE_LEVELS.includes(experienceLevel)) {
    throw Object.assign(new Error("Invalid employment, work mode, or experience value."), { statusCode: 400 });
  }
  const minimumExperience = parseNullableNumber(body.minimumExperience ?? existing?.minimumExperience);
  const maximumExperience = parseNullableNumber(body.maximumExperience ?? existing?.maximumExperience);
  const minimumSalary = parseNullableNumber(body.minimumSalary ?? existing?.minimumSalary);
  const maximumSalary = parseNullableNumber(body.maximumSalary ?? existing?.maximumSalary);
  if (minimumExperience != null && maximumExperience != null && minimumExperience > maximumExperience) {
    throw Object.assign(new Error("Minimum experience cannot exceed maximum experience."), { statusCode: 400 });
  }
  if (minimumSalary != null && maximumSalary != null && minimumSalary > maximumSalary) {
    throw Object.assign(new Error("Minimum salary cannot exceed maximum salary."), { statusCode: 400 });
  }
  const requestedStatus = body.status ?? existing?.status ?? "draft";
  if (!JOB_STATUSES.includes(requestedStatus)) throw Object.assign(new Error("Invalid job status."), { statusCode: 400 });
  const sourceUrl = body.sourceUrl === undefined ? existing?.sourceUrl || "" : normalizeUrl(body.sourceUrl);
  const companyLogo = body.companyLogo === undefined ? company.logo || existing?.companyLogo || "" : normalizeUrl(body.companyLogo);
  return {
    title,
    company: company._id,
    companyName: company.name,
    companyLogo,
    description,
    descriptionHtml: descriptionChanged ? "" : existing?.descriptionHtml || "",
    responsibilities: cleanStringArray(body.responsibilities ?? existing?.responsibilities),
    requirements: cleanStringArray(body.requirements ?? existing?.requirements),
    benefits: cleanStringArray(body.benefits ?? existing?.benefits),
    skills: cleanStringArray(body.skills ?? existing?.skills),
    category,
    categorySlug: slugify(category),
    location,
    locationSlug: slugify(location),
    emirate,
    country: countryFromParam(body.country)?.code || existing?.country || "AE",
    employmentType,
    workMode,
    experienceLevel,
    minimumExperience,
    maximumExperience,
    minimumSalary,
    maximumSalary,
    salaryCurrency: "AED",
    salaryPeriod: ["hour", "day", "month", "year"].includes(body.salaryPeriod) ? body.salaryPeriod : existing?.salaryPeriod || "month",
    salaryVisible: asBoolean(body.salaryVisible ?? existing?.salaryVisible),
    applicationType,
    applicationUrl,
    normalizedApplicationUrl: applicationUrl.toLowerCase().replace(/\/$/, ""),
    source: source._id,
    sourceName: source.name,
    sourceUrl,
    sourceJobId: cleanText(body.sourceJobId ?? existing?.sourceJobId, 300),
    postedAt: asDate(body.postedAt, existing?.postedAt || new Date()),
    expiresAt: body.expiresAt === undefined ? existing?.expiresAt || null : asDate(body.expiresAt, null),
    status: requestedStatus,
    featured: asBoolean(body.featured ?? existing?.featured),
    verified: asBoolean(body.verified ?? existing?.verified),
    isDemo: asBoolean(body.isDemo ?? existing?.isDemo),
    seoTitle: cleanText(body.seoTitle ?? existing?.seoTitle, 180),
    seoDescription: cleanText(body.seoDescription ?? existing?.seoDescription, 500),
    canonicalUrl: body.canonicalUrl === undefined ? existing?.canonicalUrl || "" : normalizeUrl(body.canonicalUrl),
    fingerprint: normalizedJobFingerprint({ title, companyName: company.name, location, employmentType }),
    creationOrigin: existing?.creationOrigin || "admin_created",
    sourceProvider: existing?.sourceProvider || source.type,
  };
}

function applyPublicFilters(query) {
  const now = new Date();
  const active = publicJobFilter(now);
  const country = countryFromParam(query.country);
  const filter = {
    status: active.status, postedAt: active.postedAt, $and: [{ $or: active.$or }],
    country: country ? country.code : { $in: activeJobCountries() },
  };
  if (query.keyword?.trim()) filter.$text = { $search: cleanText(query.keyword, 200) };
  if (query.location) filter.locationSlug = slugify(query.location);
  if (query.category) {
    const categoryFilter = buildPublicCategoryFilter(query.category);
    if (categoryFilter) {
      filter.categorySlug = categoryFilter.categorySlug;
      if (categoryFilter.semanticMatch) filter.$and.push(categoryFilter.semanticMatch);
    }
  }
  if (query.track === "tech") filter.categorySlug = filter.categorySlug || { $in: TECH_CATEGORY_SLUGS };
  const skillLabel = SKILL_CATALOG.find((skill) => skill.id === query.skill || skill.label.toLowerCase() === String(query.skill || "").toLowerCase());
  if (skillLabel) filter.skills = skillLabel.label;
  const tags = String(query.tag || "").split(",").map((tag) => tag.trim()).filter((tag) => JOB_TAG_IDS.includes(tag));
  if (tags.length) filter.tags = { $all: tags };
  if (EMPLOYMENT_TYPES.includes(query.employmentType)) filter.employmentType = query.employmentType;
  if (WORK_MODES.includes(query.workMode)) filter.workMode = query.workMode;
  if (EXPERIENCE_LEVELS.includes(query.experienceLevel)) filter.experienceLevel = query.experienceLevel;
  if (query.salaryMin || query.salaryMax) {
    filter.salaryVisible = true;
    const salary = [];
    const requestedMin = parseNullableNumber(query.salaryMin);
    const requestedMax = parseNullableNumber(query.salaryMax);
    if (requestedMin != null) salary.push({ maximumSalary: { $gte: requestedMin } });
    if (requestedMax != null) salary.push({ minimumSalary: { $lte: requestedMax } });
    if (salary.length) filter.$and.push(...salary);
  }
  if (["day", "week", "month"].includes(query.datePosted)) {
    const days = { day: 1, week: 7, month: 30 }[query.datePosted];
    filter.postedAt = { ...filter.postedAt, $gte: new Date(Date.now() - days * 86_400_000) };
  }
  return filter;
}

// Interleaved id order per filter, cached briefly: it needs every matching job's id, company and date.
const FEED_TTL_MS = 60_000;
const feedCache = new Map();
async function diversifiedFeed(query, filter) {
  const { page: _page, limit: _limit, skip: _skip, sort: _sort, groupByCompany: _group, ...rest } = query;
  const key = JSON.stringify(Object.keys(rest).sort().map((name) => [name, rest[name]]));
  const cached = feedCache.get(key);
  if (cached && Date.now() - cached.at < FEED_TTL_MS) return cached.ids;
  // Sorted here, not by MongoDB: a server-side sort over the full documents exceeds its memory limit.
  const rows = (await Job.find(filter).select("company postedAt featured").lean())
    .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt) || Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  const ids = diversifyByCompany(rows).map((row) => row._id);
  if (feedCache.size > 200) feedCache.clear();
  feedCache.set(key, { at: Date.now(), ids });
  return ids;
}

export async function listPublicJobs(req, res) {
  try {
    await expireJobs();
    const { page, limit, skip } = pageValues(req.query);
    const filter = applyPublicFilters(req.query);
    // Mongo text search matches ANY word, so a typo still returns loose results. Correct unknown
    // words up front ("sofware" -> "software"); ?exact=true searches the typed words as they are.
    const originalText = filter.$text;
    let correctedKeyword = null;
    if (filter.$text && !asBoolean(req.query.exact)) {
      correctedKeyword = await correctKeyword(req.query.keyword).catch(() => null);
      if (correctedKeyword) filter.$text = { $search: correctedKeyword };
    }
    // A keyword search defaults to best match; browsing defaults to newest. An explicit ?sort= always wins.
    const sortName = ["newest", "relevant", "featured"].includes(req.query.sort) ? req.query.sort : filter.$text ? "relevant" : "newest";
    const listQuery = (where) => Job.find(where).populate("company", "name slug logo verified industry").select("-applicationUrl -normalizedApplicationUrl -sourceUrl -importedData -overrideFields -missingSyncCount -createdBy -updatedBy -creationOrigin -importStatus -importQualityScore -importQualityBreakdown -duplicateCandidate -duplicateConfidence -sourceCompanyId -sourceProvider -sourceRemovedAt -lastImportChangedAt");
    const buildQuery = () => {
    let query = listQuery(filter);
    if (sortName === "relevant" && filter.$text) query = query.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" }, featured: -1, postedAt: -1 });
    else if (sortName === "featured") query = query.sort({ featured: -1, postedAt: -1 });
    else query = query.sort({ postedAt: -1, featured: -1 });
    return query;
    };
    // "Newest" is interleaved by company so one employer's bulk upload cannot fill a page.
    // groupByCompany=true keeps the plain chronological order.
    const diversify = sortName === "newest" && !filter.$text && !asBoolean(req.query.groupByCompany);
    let jobs; let total;
    if (diversify) {
      const order = await diversifiedFeed(req.query, filter);
      const pageIds = order.slice(skip, skip + limit);
      const byId = new Map((await listQuery({ _id: { $in: pageIds } }).lean()).map((job) => [String(job._id), job]));
      jobs = pageIds.map((id) => byId.get(String(id))).filter(Boolean);
      total = order.length;
    } else {
      [jobs, total] = await Promise.all([buildQuery().skip(skip).limit(limit).lean(), Job.countDocuments(filter)]);
    }
    if (correctedKeyword && total === 0) {
      // The corrected wording found nothing; search what the person actually typed.
      filter.$text = originalText; correctedKeyword = null;
      [jobs, total] = await Promise.all([buildQuery().skip(skip).limit(limit).lean(), Job.countDocuments(filter)]);
    }
    const indexableCount = await Job.countDocuments({ ...filter, isDemo: { $ne: true } });
    return res.json({ success: true, data: jobs, pagination: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) }, meta: { indexableCount, correctedKeyword, searchedKeyword: correctedKeyword ? cleanText(req.query.keyword, 200) : null } });
  } catch (error) { return errorResponse(res, error, "listPublicJobs"); }
}

export async function suggestPublicJobs(req, res) {
  try {
    const q = cleanText(req.query.q, 60);
    const suggestions = q.length >= 2 ? await suggestJobs(q, { limit: 8 }) : [];
    res.set("Cache-Control", "public, max-age=60");
    return res.json({ success: true, data: suggestions });
  } catch (error) { return errorResponse(res, error, "suggestPublicJobs"); }
}

export async function getPublicTaxonomy(_req, res) {
  try {
    const countries = activeJobCountries();
    const filter = { ...publicJobFilter(), country: { $in: countries } };
    const [locations, categories, tagCounts, skillCounts, countryCounts] = await Promise.all([
      Job.aggregate([{ $match: filter }, { $group: { _id: { slug: "$locationSlug", name: "$location", country: "$country" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Job.aggregate([{ $match: filter }, { $group: { _id: { slug: "$categorySlug", name: "$category" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Job.aggregate([{ $match: { ...filter, "tags.0": { $exists: true } } }, { $unwind: "$tags" }, { $group: { _id: "$tags", count: { $sum: 1 } } }]),
      Job.aggregate([{ $match: { ...filter, categorySlug: { $in: TECH_CATEGORY_SLUGS }, "skills.0": { $exists: true } } }, { $unwind: "$skills" }, { $group: { _id: "$skills", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Job.aggregate([{ $match: filter }, { $group: { _id: "$country", count: { $sum: 1 } } }]),
    ]);
    const tagTotals = new Map(tagCounts.map((item) => [item._id, item.count]));
    const perCountry = new Map(countryCounts.map((item) => [item._id, item.count]));
    return res.json({ success: true, data: {
      countries: GCC_COUNTRIES.filter((country) => countries.includes(country.code)).map((country) => ({ ...country, count: perCountry.get(country.code) || 0 })),
      locations: locations.map((item) => ({ ...item._id, count: item.count })),
      categories: categories.map((item) => ({ ...item._id, count: item.count })),
      techSkills: skillCounts.filter((item) => SKILL_CATALOG.some((skill) => skill.label === item._id)).slice(0, 14).map((item) => ({ id: SKILL_CATALOG.find((skill) => skill.label === item._id).id, label: item._id, count: item.count })),
      tags: JOB_TAGS.map((tag) => ({ id: tag.id, label: tag.label, count: tagTotals.get(tag.id) || 0 })),
      availableLocations: countries.flatMap((code) => GCC_LOCATIONS[code] || []),
      availableCategories: UAE_JOB_CATEGORIES,
      employmentTypes: EMPLOYMENT_TYPES,
      workModes: WORK_MODES,
      experienceLevels: EXPERIENCE_LEVELS,
    } });
  } catch (error) { return errorResponse(res, error, "getPublicTaxonomy"); }
}

export async function getPublicJob(req, res) {
  try {
    const job = await Job.findOne({ slug: req.params.slug, status: { $in: ["published", "expired"] } })
      .populate("company", "name slug logo website careersUrl description industry size headquarters verified active")
      .populate("source", "name type careersUrl");
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    const isExpired = job.status === "expired" || (job.expiresAt && job.expiresAt <= new Date());
    if (isExpired && job.status !== "expired") await Job.updateOne({ _id: job._id }, { $set: { status: "expired" } });
    await Job.updateOne({ _id: job._id }, { $inc: { views: 1 } });
    JobEvent.create({ event: "view", job: job._id, company: job.company?._id, category: job.category, location: job.location }).catch(() => {});
    const relatedActive = publicJobFilter();
    const activeWhere = { status: relatedActive.status, postedAt: relatedActive.postedAt, _id: { $ne: job._id } };
    // Similar jobs: score a pool of same-category or shared-skill jobs, then fall back to
    // plain category/company/location matches so the section is rarely empty.
    const skills = job.skills || [];
    const pool = await Job.find({ ...activeWhere, $and: [{ $or: relatedActive.$or }, { $or: [{ categorySlug: job.categorySlug }, ...(skills.length ? [{ skills: { $in: skills } }] : [])] }] })
      .select("title skills categorySlug experienceLevel locationSlug company postedAt").sort({ postedAt: -1 }).limit(300).lean();
    const rankedIds = rankSimilarJobs(job.toObject(), pool).map((item) => item._id);
    const loadRelated = (where, limit = 6) => Job.find(where).populate("company", "name slug logo verified").select(PUBLIC_LIST_SELECT).sort({ featured: -1, postedAt: -1 }).limit(limit);
    let related = rankedIds.length ? await loadRelated({ _id: { $in: rankedIds } }).then((rows) => rows.map((row) => row.toObject()).sort((x, y) => rankedIds.findIndex((id) => String(id) === String(x._id)) - rankedIds.findIndex((id) => String(id) === String(y._id)))) : [];
    if (related.length < 4) {
      const fallback = await loadRelated({ ...activeWhere, _id: { $nin: [job._id, ...related.map((item) => item._id)] }, $and: [{ $or: relatedActive.$or }, { $or: [{ categorySlug: job.categorySlug }, { company: job.company?._id }, { locationSlug: job.locationSlug }] }] }, 6);
      related = [...related, ...fallback.map((row) => row.toObject())].slice(0, 6);
    }
    const data = publicFields(job);
    data.status = isExpired ? "expired" : data.status;
    data.views = (data.views || 0) + 1;
    const learning = await buildJobLearning(data).catch(() => null);
    const salaryInsight = await salaryInsightFor(data).catch(() => null);
    return res.json({ success: true, data: { job: data, related, learning, salaryInsight } });
  } catch (error) { return errorResponse(res, error, "getPublicJob"); }
}

export async function getPublicCompany(req, res) {
  try {
    const company = await Company.findOne({ slug: req.params.slug, active: true }).lean();
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    const { page, limit, skip } = pageValues(req.query);
    const filter = { ...publicJobFilter(), company: company._id };
    const [jobs, total] = await Promise.all([
      Job.find(filter).populate("company", "name slug logo verified").select("-applicationUrl -normalizedApplicationUrl -sourceUrl -importedData -overrideFields -creationOrigin -importStatus -importQualityScore -importQualityBreakdown -duplicateCandidate -duplicateConfidence -sourceCompanyId -sourceProvider -sourceRemovedAt -lastImportChangedAt").sort({ featured: -1, postedAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);
    const indexableOpenJobs = await Job.countDocuments({ ...filter, isDemo: { $ne: true } });
    for (const key of ["normalizedName", "websiteDomain", "creationOrigin", "source", "sourceName", "sourceProvider", "providerIdentities", "overrideFields"]) delete company[key];
    const insights = await buildCompanyInsights(company._id).catch(() => null);
    return res.json({ success: true, data: { company, jobs, openJobs: total, indexableOpenJobs, insights }, pagination: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return errorResponse(res, error, "getPublicCompany"); }
}

export async function getJobsSitemap(_req, res) {
  try {
    const indexableFilter = { ...publicJobFilter(), isDemo: { $ne: true } };
    const companyIds = await Job.distinct("company", indexableFilter);
    const [jobs, companies, locations, categories, countryCounts] = await Promise.all([
      Job.find(indexableFilter).select("slug updatedAt").lean(),
      Company.find({ active: true, _id: { $in: companyIds } }).select("slug updatedAt").lean(),
      Job.distinct("locationSlug", indexableFilter),
      Job.distinct("categorySlug", indexableFilter),
      Job.aggregate([{ $match: indexableFilter }, { $group: { _id: "$country", count: { $sum: 1 } } }]),
    ]);
    // A country hub is only listed once it has enough jobs to be a useful page rather than a thin one.
    const MIN_COUNTRY_HUB_JOBS = 20;
    const countries = GCC_COUNTRIES.filter((country) => (countryCounts.find((row) => row._id === country.code)?.count || 0) >= MIN_COUNTRY_HUB_JOBS).map((country) => country.slug);
    return res.json({ success: true, data: { jobs, companies, locations, categories, countries } });
  } catch (error) { return errorResponse(res, error, "getJobsSitemap"); }
}

export async function toggleSavedJob(req, res) {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: "Job not found." });
    const job = await Job.findById(req.params.id).select("company category location status expiresAt");
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    const existing = await SavedJob.findOne({ user: req.user._id, job: job._id });
    if (existing) {
      await existing.deleteOne();
      JobEvent.create({ event: "unsave", user: req.user._id, job: job._id, company: job.company, category: job.category, location: job.location }).catch(() => {});
      return res.json({ success: true, data: { saved: false } });
    }
    await SavedJob.create({ user: req.user._id, job: job._id });
    JobEvent.create({ event: "save", user: req.user._id, job: job._id, company: job.company, category: job.category, location: job.location }).catch(() => {});
    return res.status(201).json({ success: true, data: { saved: true } });
  } catch (error) { return errorResponse(res, error, "toggleSavedJob"); }
}

export async function getMySavedJobs(req, res) {
  try {
    const { page, limit, skip } = pageValues(req.query);
    const [items, total] = await Promise.all([
      SavedJob.find({ user: req.user._id }).populate({ path: "job", populate: { path: "company", select: "name slug logo verified" }, select: "-applicationUrl -normalizedApplicationUrl -sourceUrl -importedData -overrideFields -creationOrigin -importStatus -importQualityScore -importQualityBreakdown -duplicateCandidate -duplicateConfidence -sourceCompanyId -sourceProvider -sourceRemovedAt -lastImportChangedAt" }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SavedJob.countDocuments({ user: req.user._id }),
    ]);
    return res.json({ success: true, data: items.filter((item) => item.job), pagination: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return errorResponse(res, error, "getMySavedJobs"); }
}

export async function getMyJobApplications(req, res) {
  try {
    const items = await JobApplication.find({ user: req.user._id }).populate({ path: "job", select: "title slug companyName companyLogo location status applicationType", populate: { path: "company", select: "name slug logo" } }).select("-redirectUrl -resume.storageKey").sort({ appliedAt: -1 }).limit(200).lean();
    return res.json({ success: true, data: items });
  } catch (error) { return errorResponse(res, error, "getMyJobApplications"); }
}

export const APPLICATION_STAGES = ["applied", "interviewing", "offer", "accepted", "rejected", "withdrawn"];

/** The applicant's own tracker: stage and a private note. Employer-side review status is untouched. */
export async function updateMyJobApplication(req, res) {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ success: false, message: "Application not found." });
    const set = {};
    if (req.body.stage !== undefined) {
      if (!APPLICATION_STAGES.includes(req.body.stage)) return res.status(400).json({ success: false, message: "Choose a valid stage." });
      set.stage = req.body.stage;
      set.stageUpdatedAt = new Date();
    }
    if (req.body.note !== undefined) set.note = cleanText(req.body.note, 2000);
    if (!Object.keys(set).length) return res.status(400).json({ success: false, message: "Nothing to update." });
    const updated = await JobApplication.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { $set: set }, { returnDocument: "after" }).select("stage stageUpdatedAt note");
    if (!updated) return res.status(404).json({ success: false, message: "Application not found." });
    return res.json({ success: true, data: updated });
  } catch (error) { return errorResponse(res, error, "updateMyJobApplication"); }
}

async function activeJobForApply(id) {
  if (!isId(id)) return null;
  return Job.findOne({ _id: id, ...publicJobFilter() });
}

export async function externalApply(req, res) {
  try {
    const job = await activeJobForApply(req.params.id);
    if (!job) return res.status(410).json({ success: false, message: "This position is no longer accepting applications." });
    if (job.applicationType !== "external" || !job.applicationUrl) return res.status(400).json({ success: false, message: "This job uses an internal application." });
    const redirectUrl = normalizeUrl(job.applicationUrl, { required: true });
    await Promise.all([
      // One tracker row per user and job, however many times the apply button is pressed.
      req.user?._id
        ? JobApplication.updateOne(
          { kind: "external_click", user: req.user._id, job: job._id },
          { $set: { sourceName: job.sourceName, redirectUrl, appliedAt: new Date() }, $setOnInsert: { stage: "applied" } },
          { upsert: true },
        )
        : Promise.resolve(),
      Job.updateOne({ _id: job._id }, { $inc: { applyClicks: 1 } }),
      JobEvent.create({ event: "external_redirect", user: req.user?._id, job: job._id, company: job.company, category: job.category, location: job.location }),
    ]);
    return res.json({ success: true, data: { redirectUrl }, message: "Continue on the company website. asif.to cannot confirm submission there." });
  } catch (error) { return errorResponse(res, error, "externalApply"); }
}

export async function internalApply(req, res) {
  try {
    const job = await activeJobForApply(req.params.id);
    if (!job) throw Object.assign(new Error("This position is no longer accepting applications."), { statusCode: 410 });
    if (job.applicationType !== "internal") throw Object.assign(new Error("This job does not accept direct applications."), { statusCode: 400 });
    if (await JobApplication.exists({ user: req.user._id, job: job._id, kind: "internal" })) {
      throw Object.assign(new Error("You have already applied to this job."), { statusCode: 409 });
    }
    if (!req.file) throw Object.assign(new Error("A CV is required."), { statusCode: 400 });
    await validateJobResume(req.file);
    const fullName = cleanText(req.body.fullName, 180);
    const email = cleanText(req.body.email, 254).toLowerCase();
    const phone = cleanText(req.body.phone, 40);
    if (!fullName || !/^\S+@\S+\.\S+$/.test(email) || !phone) throw Object.assign(new Error("Full name, a valid email, and phone number are required."), { statusCode: 400 });
    const application = await JobApplication.create({
      kind: "internal", user: req.user._id, job: job._id, fullName, email, phone,
      coverMessage: cleanText(req.body.coverMessage, 5000), appliedAt: new Date(),
      resume: { storageKey: req.file.filename, originalName: cleanText(req.file.originalname, 255), mimeType: req.file.mimetype, size: req.file.size },
    });
    await Promise.all([
      Job.updateOne({ _id: job._id }, { $inc: { applyClicks: 1, applicationCount: 1 } }),
      JobEvent.create({ event: "internal_application", user: req.user._id, job: job._id, company: job.company, category: job.category, location: job.location }),
    ]);
    return res.status(201).json({ success: true, data: { application: { _id: application._id, status: application.status, appliedAt: application.appliedAt } } });
  } catch (error) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    if (error?.code === 11000) error = Object.assign(new Error("You have already applied to this job."), { statusCode: 409 });
    return errorResponse(res, error, "internalApply");
  }
}

export async function recordJobEvent(req, res) {
  try {
    const allowed = ["search", "filter", "share", "apply_click"];
    if (!allowed.includes(req.body.event)) return res.status(400).json({ success: false, message: "Invalid event." });
    let job = null;
    if (req.params.id && isId(req.params.id)) job = await Job.findById(req.params.id).select("company category location").lean();
    await JobEvent.create({
      event: req.body.event, job: job?._id || null, company: job?.company || null, user: req.user?._id || null,
      category: cleanText(req.body.category || job?.category, 120), location: cleanText(req.body.location || job?.location, 160),
      query: cleanText(req.body.query, 300), metadata: { filters: cleanStringArray(req.body.filters, 20, 60) },
    });
    return res.status(202).json({ success: true });
  } catch (error) { return errorResponse(res, error, "recordJobEvent"); }
}

export async function adminDashboard(req, res) {
  try {
    await expireJobs();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [active, pending, addedToday, expired, featured, applications, externalClicks, activeSources, failedImports, topJobs, categories, locations, companies] = await Promise.all([
      Job.countDocuments(publicJobFilter()), Job.countDocuments({ status: "pending" }), Job.countDocuments({ createdAt: { $gte: today } }),
      Job.countDocuments({ status: "expired" }), Job.countDocuments({ ...publicJobFilter(), featured: true }),
      JobApplication.countDocuments({ kind: "internal" }), JobApplication.countDocuments({ kind: "external_click" }),
      JobSource.countDocuments({ enabled: true }), JobSource.countDocuments({ syncStatus: "failed" }),
      Job.find({ status: { $in: ["published", "expired"] } }).select("title slug companyName views applyClicks applicationCount").sort({ views: -1, applyClicks: -1 }).limit(8).lean(),
      JobEvent.aggregate([{ $match: { occurredAt: { $gte: new Date(Date.now() - 30 * 86_400_000) }, category: { $ne: "" } } }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
      JobEvent.aggregate([{ $match: { occurredAt: { $gte: new Date(Date.now() - 30 * 86_400_000) }, location: { $ne: "" } } }, { $group: { _id: "$location", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
      Job.aggregate([{ $match: { status: { $in: ["published", "expired"] } } }, { $group: { _id: "$companyName", views: { $sum: "$views" }, clicks: { $sum: "$applyClicks" } } }, { $sort: { views: -1 } }, { $limit: 8 }]),
    ]);
    return res.json({ success: true, data: { metrics: { active, pending, addedToday, expired, featured, applications, externalClicks, activeSources, failedImports }, topJobs, categories, locations, companies } });
  } catch (error) { return errorResponse(res, error, "adminDashboard"); }
}

export async function adminListJobs(req, res) {
  try {
    const { page, limit, skip } = pageValues(req.query);
    const filter = {};
    if (req.query.search) filter.$or = ["title", "companyName", "location", "category", "sourceName"].map((key) => ({ [key]: new RegExp(escapeRegex(cleanText(req.query.search, 200)), "i") }));
    if (JOB_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (CREATION_ORIGINS.includes(req.query.origin)) filter.creationOrigin = req.query.origin;
    if (IMPORT_STATUSES.includes(req.query.importStatus)) filter.importStatus = req.query.importStatus;
    if (req.query.source && isId(req.query.source)) filter.source = req.query.source;
    if (req.query.location) filter.locationSlug = slugify(req.query.location);
    if (req.query.category) filter.categorySlug = slugify(req.query.category);
    if (req.query.featured === "true") filter.featured = true;
    const allowedSort = { newest: { createdAt: -1 }, posted: { postedAt: -1 }, expiry: { expiresAt: 1 }, views: { views: -1 }, clicks: { applyClicks: -1 } };
    const sort = allowedSort[req.query.sort] || allowedSort.newest;
    const [jobs, total] = await Promise.all([
      Job.find(filter).populate("company", "name slug logo verified").populate("source", "name type syncStatus").sort(sort).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);
    return res.json({ success: true, data: jobs, pagination: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return errorResponse(res, error, "adminListJobs"); }
}

export async function adminGetJob(req, res) {
  try {
    const job = isId(req.params.id) ? await Job.findById(req.params.id).populate("company").populate("source") : null;
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    return res.json({ success: true, data: job });
  } catch (error) { return errorResponse(res, error, "adminGetJob"); }
}

export async function adminCreateJob(req, res) {
  try {
    const payload = await buildJobPayload(req.body, { userId: req.user._id });
    const duplicate = await Job.findOne({
      $or: [
        ...(payload.normalizedApplicationUrl ? [{ normalizedApplicationUrl: payload.normalizedApplicationUrl }] : []),
        { fingerprint: payload.fingerprint, status: { $nin: ["rejected", "archived"] } },
      ],
    }).select("_id title");
    if (duplicate) throw Object.assign(new Error(`A matching job already exists: ${duplicate.title}`), { statusCode: 409 });
    const requestedSlug = cleanText(req.body.slug, 220) || `${payload.title}-${payload.companyName}-${payload.location}`;
    const job = await Job.create({ ...payload, creationOrigin: "admin_created", slug: await uniqueSlug(Job, requestedSlug), createdBy: req.user._id, updatedBy: req.user._id });
    await logActivity({ actor: req.user, action: "job.created", entityType: "job", entityId: job._id, entityTitle: job.title, description: "created a job", url: `/jobs/${job._id}/edit` });
    return res.status(201).json({ success: true, data: job });
  } catch (error) { return errorResponse(res, error, "adminCreateJob"); }
}

export async function adminUpdateJob(req, res) {
  try {
    const job = isId(req.params.id) ? await Job.findById(req.params.id) : null;
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    const wasPublished = job.status === "published";
    const payload = await buildJobPayload(req.body, { existing: job, userId: req.user._id });
    if (req.body.slug !== undefined) payload.slug = await uniqueSlug(Job, cleanText(req.body.slug, 220) || payload.title, job._id);
    const editableFields = Object.keys(payload);
    const equivalent = (left, right) => JSON.stringify(left instanceof Date ? left.toISOString() : left ?? null) === JSON.stringify(right instanceof Date ? right.toISOString() : right ?? null);
    const touchedFields = editableFields.filter((key) => (Object.prototype.hasOwnProperty.call(req.body, key) || (key === "company" && (req.body.companyId || req.body.companyName))) && !equivalent(job[key], payload[key]));
    if (job.importedAt) payload.overrideFields = [...new Set([...(job.overrideFields || []), ...touchedFields])];
    if (job.importedAt && touchedFields.includes("description")) payload.overrideFields = [...new Set([...(payload.overrideFields || []), "descriptionHtml"])];
    payload.updatedBy = req.user._id;
    Object.assign(job, payload);
    await job.save();
    await logActivity({ actor: req.user, action: "job.updated", entityType: "job", entityId: job._id, entityTitle: job.title, description: "updated a job", metadata: { fields: touchedFields }, url: `/jobs/${job._id}/edit` });
    return res.json({ success: true, data: job });
  } catch (error) { return errorResponse(res, error, "adminUpdateJob"); }
}

export async function adminBulkJobs(req, res) {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.filter(isId).slice(0, 200) : [];
    const action = req.body.action;
    if (!ids.length) return res.status(400).json({ success: false, message: "Select at least one job." });
    const updates = {
      publish: { status: "published" }, unpublish: { status: "draft" }, hide: { status: "hidden" }, approve: { status: "published" }, reject: { status: "rejected" },
      feature: { featured: true }, unfeature: { featured: false }, expire: { status: "expired", expiresAt: new Date() }, archive: { status: "archived" },
    };
    if (!updates[action]) return res.status(400).json({ success: false, message: "Invalid bulk action." });
    const overrideField = ["feature", "unfeature"].includes(action) ? "featured" : "status";
    const result = await Job.updateMany({ _id: { $in: ids } }, { $set: { ...updates[action], updatedBy: req.user._id }, $addToSet: { overrideFields: overrideField } });
    return res.json({ success: true, data: { modified: result.modifiedCount } });
  } catch (error) { return errorResponse(res, error, "adminBulkJobs"); }
}

export async function adminDeleteJob(req, res) {
  try {
    const job = isId(req.params.id) ? await Job.findById(req.params.id) : null;
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    await suppressDeletedJob(job);
    const applications = await JobApplication.find({ job: job._id, kind: "internal" }).select("resume.storageKey").lean();
    await Promise.all(applications.map((item) => item.resume?.storageKey ? fs.unlink(getPrivateJobResumePath(item.resume.storageKey)).catch(() => {}) : null));
    await Promise.all([JobApplication.deleteMany({ job: job._id }), SavedJob.deleteMany({ job: job._id }), JobEvent.deleteMany({ job: job._id }), job.deleteOne()]);
    await logActivity({ actor: req.user, action: "job.deleted", entityType: "job", entityId: job._id, entityTitle: job.title, description: "deleted a job", severity: "warning", url: "/jobs" });
    return res.json({ success: true, message: "Job and its associated records were deleted." });
  } catch (error) { return errorResponse(res, error, "adminDeleteJob"); }
}

export async function adminListCompanies(req, res) {
  try {
    const { page, limit, skip } = pageValues(req.query, 50);
    const filter = req.query.search ? { name: new RegExp(escapeRegex(cleanText(req.query.search, 180)), "i") } : {};
    const [companies, total, counts] = await Promise.all([
      Company.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(), Company.countDocuments(filter),
      Job.aggregate([{ $match: publicJobFilter() }, { $group: { _id: "$company", openJobs: { $sum: 1 } } }]),
    ]);
    const map = new Map(counts.map((item) => [String(item._id), item.openJobs]));
    return res.json({ success: true, data: companies.map((item) => ({ ...item, openJobs: map.get(String(item._id)) || 0 })), pagination: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return errorResponse(res, error, "adminListCompanies"); }
}

function companyPayload(body) {
  const website = body.website ? normalizeUrl(body.website) : "";
  return {
    name: cleanText(body.name, 180), normalizedName: normalizeCompanyName(body.name), logo: body.logo ? normalizeUrl(body.logo) : "", website,
    websiteDomain: website ? new URL(website).hostname.toLowerCase().replace(/^www\./, "") : "",
    careersUrl: body.careersUrl ? normalizeUrl(body.careersUrl) : "", description: cleanText(body.description, 5000),
    industry: cleanText(body.industry, 120), size: cleanText(body.size, 80), headquarters: cleanText(body.headquarters, 180),
    verified: asBoolean(body.verified), active: body.active === undefined ? true : asBoolean(body.active),
  };
}

export async function adminCreateCompany(req, res) {
  try {
    const payload = companyPayload(req.body);
    if (!payload.name) return res.status(400).json({ success: false, message: "Company name is required." });
    const company = await Company.create({ ...payload, creationOrigin: "admin_created", slug: await uniqueSlug(Company, req.body.slug || payload.name) });
    return res.status(201).json({ success: true, data: company });
  } catch (error) { return errorResponse(res, error, "adminCreateCompany"); }
}

export async function adminUpdateCompany(req, res) {
  try {
    const company = isId(req.params.id) ? await Company.findById(req.params.id) : null;
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    const payload = companyPayload({ ...company.toObject(), ...req.body });
    payload.slug = await uniqueSlug(Company, req.body.slug || company.slug || payload.name, company._id);
    const touchedFields = Object.keys(req.body).filter((key) => Object.prototype.hasOwnProperty.call(payload, key) && JSON.stringify(company[key] ?? null) !== JSON.stringify(payload[key] ?? null));
    if (company.creationOrigin !== "admin_created") payload.overrideFields = [...new Set([...(company.overrideFields || []), ...touchedFields])];
    Object.assign(company, payload); await company.save();
    await Job.updateMany({ company: company._id }, { $set: { companyName: company.name, ...(company.logo ? { companyLogo: company.logo } : {}) } });
    return res.json({ success: true, data: company });
  } catch (error) { return errorResponse(res, error, "adminUpdateCompany"); }
}

export async function adminGetCompany(req, res) {
  try {
    const company = isId(req.params.id) ? await Company.findById(req.params.id).lean() : null;
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    return res.json({ success: true, data: company });
  } catch (error) { return errorResponse(res, error, "adminGetCompany"); }
}

export async function adminListSources(req, res) {
  try {
    const sources = await JobSource.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: sources.map((source) => ({ ...source, credentialConfigured: Boolean(source.credentialEnvKey && process.env[source.credentialEnvKey]) })) });
  } catch (error) { return errorResponse(res, error, "adminListSources"); }
}

export async function adminGetSource(req, res) {
  try {
    const source = isId(req.params.id) ? await JobSource.findById(req.params.id).lean() : null;
    if (!source) return res.status(404).json({ success: false, message: "Source not found." });
    return res.json({ success: true, data: { ...source, credentialConfigured: Boolean(source.credentialEnvKey && process.env[source.credentialEnvKey]) } });
  } catch (error) { return errorResponse(res, error, "adminGetSource"); }
}

export async function adminListSourceLogs(req, res) {
  try {
    const filter = isId(req.params.id) ? { source: req.params.id } : {};
    const logs = await JobSyncLog.find(filter).sort({ startedAt: -1 }).limit(50).lean();
    return res.json({ success: true, data: logs });
  } catch (error) { return errorResponse(res, error, "adminListSourceLogs"); }
}

function sourcePayload(body, existing = {}) {
  const type = SOURCE_TYPES.includes(body.type) ? body.type : existing.type || "manual";
  const rawEndpoint = body.endpointUrl === undefined ? existing.endpointUrl : body.endpointUrl;
  const endpointUrl = rawEndpoint ? assertSafeRemoteUrl(rawEndpoint) : "";
  // ATS types are addressed by an organization id; the id-only ones build their own endpoint.
  const idBased = ["greenhouse", "lever", "smartrecruiters", "workable", "ashby", "recruitee", "pinpoint", "teamtailor", "workday"].includes(type);
  const providerOrganizationId = cleanText(body.providerOrganizationId ?? existing.providerOrganizationId, 300);
  if (type !== "manual" && !endpointUrl && !idBased) {
    throw Object.assign(new Error(type === "jsonld" ? "A sitemap or careers page URL is required for a career site crawler." : "An endpoint URL is required for this source type."), { statusCode: 400 });
  }
  if (idBased && !providerOrganizationId && !(endpointUrl && type !== "workday")) {
    throw Object.assign(new Error("A provider organization ID or custom endpoint is required for this ATS source."), { statusCode: 400 });
  }
  if (type === "workday") {
    try { parseWorkdayId(providerOrganizationId); } catch (error) { throw Object.assign(error, { statusCode: 400 }); }
  }
  return {
    name: cleanText(body.name ?? existing.name, 160), type,
    providerOrganizationId,
    providerRegion: ["global", "eu"].includes(body.providerRegion) ? body.providerRegion : existing.providerRegion || "global",
    baseUrl: (body.baseUrl === undefined ? existing.baseUrl : body.baseUrl) ? normalizeUrl(body.baseUrl === undefined ? existing.baseUrl : body.baseUrl) : "",
    careersUrl: (body.careersUrl === undefined ? existing.careersUrl : body.careersUrl) ? normalizeUrl(body.careersUrl === undefined ? existing.careersUrl : body.careersUrl) : "",
    endpointUrl, jobsPath: cleanText(body.jobsPath ?? existing.jobsPath, 200), fieldMapping: body.fieldMapping && typeof body.fieldMapping === "object" ? body.fieldMapping : existing.fieldMapping || {},
    credentialEnvKey: cleanText(body.credentialEnvKey ?? existing.credentialEnvKey, 100).replace(/[^A-Z0-9_]/gi, ""),
    enabled: body.enabled === undefined ? existing.enabled ?? true : asBoolean(body.enabled),
    autoPublish: body.autoPublish === undefined ? existing.autoPublish ?? false : asBoolean(body.autoPublish),
    trusted: body.trusted === undefined ? existing.trusted ?? false : asBoolean(body.trusted),
    qualityThreshold: Math.min(100, Math.max(50, Number(body.qualityThreshold ?? existing.qualityThreshold ?? 90))),
    syncIntervalHours: Math.min(168, Math.max(6, Number(body.syncIntervalHours ?? existing.syncIntervalHours ?? 12))),
    syncFrequency: ["manual", "hourly", "daily", "weekly"].includes(body.syncFrequency) ? body.syncFrequency : existing.syncFrequency || "manual",
  };
}

export async function adminCreateSource(req, res) {
  try {
    const payload = sourcePayload(req.body);
    if (!payload.name) return res.status(400).json({ success: false, message: "Source name is required." });
    const wantsEnabled = payload.enabled && payload.type !== "manual";
    const source = await JobSource.create({ ...payload, enabled: wantsEnabled ? false : payload.enabled, slug: await uniqueSlug(JobSource, req.body.slug || payload.name), createdBy: req.user._id, updatedBy: req.user._id });
    if (wantsEnabled) await verifyAndPersistJobSource(source, { enableWhenVerified: true });
    return res.status(201).json({ success: true, data: await JobSource.findById(source._id) });
  } catch (error) { return errorResponse(res, error, "adminCreateSource"); }
}

export async function adminUpdateSource(req, res) {
  try {
    const source = isId(req.params.id) ? await JobSource.findById(req.params.id) : null;
    if (!source) return res.status(404).json({ success: false, message: "Source not found." });
    const payload = sourcePayload(req.body, source.toObject());
    payload.slug = await uniqueSlug(JobSource, req.body.slug || source.slug || payload.name, source._id);
    const providerChanged = payload.type !== source.type || payload.providerOrganizationId !== source.providerOrganizationId || payload.endpointUrl !== source.endpointUrl;
    const shouldVerify = payload.enabled && payload.type !== "manual" && (!source.enabled || providerChanged);
    Object.assign(source, payload, { enabled: shouldVerify ? false : payload.enabled, updatedBy: req.user._id }); await source.save();
    if (shouldVerify) await verifyAndPersistJobSource(source, { enableWhenVerified: true });
    return res.json({ success: true, data: await JobSource.findById(source._id) });
  } catch (error) { return errorResponse(res, error, "adminUpdateSource"); }
}

export async function adminTestSource(req, res) {
  try {
    const source = isId(req.params.id) ? await JobSource.findById(req.params.id) : null;
    if (!source) return res.status(404).json({ success: false, message: "Job source not found." });
    const result = await verifyAndPersistJobSource(source);
    return res.json({ success: true, data: { ...result, source: await JobSource.findById(source._id) } });
  } catch (error) { return errorResponse(res, error, "adminTestSource"); }
}

export async function adminSyncSource(req, res) {
  try {
    const result = await syncJobSource(req.params.id, { trigger: "manual" });
    await logActivity({ actor: req.user, action: "job_source.synced", entityType: "job_source", entityId: req.params.id, entityTitle: "Job source", description: "synchronized a job source", metadata: result, url: "/jobs/sources" });
    return res.json({ success: true, data: { ...result, source: await JobSource.findById(req.params.id) } });
  } catch (error) { return errorResponse(res, error, "adminSyncSource"); }
}

export async function adminListApplications(req, res) {
  try {
    const { page, limit, skip } = pageValues(req.query);
    const filter = {};
    if (["internal", "external_click"].includes(req.query.kind)) filter.kind = req.query.kind;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.job && isId(req.query.job)) filter.job = req.query.job;
    const [items, total] = await Promise.all([
      JobApplication.find(filter).populate("user", "fullName username email avatar").populate("job", "title slug companyName location applicationType").sort({ appliedAt: -1 }).skip(skip).limit(limit).lean(),
      JobApplication.countDocuments(filter),
    ]);
    const data = items.map((item) => ({ ...item, redirectUrl: undefined, resume: item.resume?.storageKey ? { ...item.resume, storageKey: undefined, downloadUrl: `/jobs/admin/applications/${item._id}/resume` } : item.resume }));
    return res.json({ success: true, data, pagination: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return errorResponse(res, error, "adminListApplications"); }
}

export async function adminUpdateApplication(req, res) {
  try {
    const application = isId(req.params.id) ? await JobApplication.findOne({ _id: req.params.id, kind: "internal" }) : null;
    if (!application) return res.status(404).json({ success: false, message: "Application not found." });
    if (!["submitted", "reviewed", "shortlisted", "rejected", "hired"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid application status." });
    application.status = req.body.status; application.reviewedAt = new Date(); application.reviewedBy = req.user._id; await application.save();
    return res.json({ success: true, data: application });
  } catch (error) { return errorResponse(res, error, "adminUpdateApplication"); }
}

export async function adminDownloadResume(req, res) {
  try {
    const application = isId(req.params.id) ? await JobApplication.findOne({ _id: req.params.id, kind: "internal" }) : null;
    if (!application?.resume?.storageKey) return res.status(404).json({ success: false, message: "CV not found." });
    const filePath = getPrivateJobResumePath(application.resume.storageKey);
    await fs.access(filePath);
    res.setHeader("Content-Type", application.resume.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${String(application.resume.originalName || "resume").replace(/["\\\r\n]/g, "_")}"`);
    return res.sendFile(filePath);
  } catch (error) { if (error.code === "ENOENT") error.statusCode = 404; return errorResponse(res, error, "adminDownloadResume"); }
}
