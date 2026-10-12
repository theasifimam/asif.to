/**
 * Job insight endpoints: skill match, "my skills", salary statistics and company hiring insights.
 * Kept apart from job.controller.js, which owns listing, detail and applications.
 */
import Company from "../models/Company.js";
import CourseProgress from "../models/CourseProgress.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { computeJobMatch, declaredSkillIds, mergeDeclaredSkills, skillPickerOptions } from "../services/jobs/jobMatch.service.js";
import { MIN_SAMPLE, MIN_SUBGROUP, summarizeBy, summarizeSalaries } from "../services/jobs/salaryInsights.service.js";
import { SKILL_BY_ID } from "../services/jobs/skillCatalog.js";
import { cleanText, publicJobFilter } from "../utils/jobValidation.js";

const fail = (res, error, context) => {
  console.error(`[JOBS] ${context}:`, error);
  return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "Internal server error" });
};

// ── Skill match ──────────────────────────────────────────────────────────────

async function personSkills(userId) {
  const [user, progress] = await Promise.all([
    User.findById(userId).select("expertise").lean(),
    CourseProgress.find({ user: userId }).populate("course", "slug").select("course overallProgress").lean(),
  ]);
  const courseProgress = {};
  for (const item of progress) if (item.course?.slug) courseProgress[item.course.slug] = item.overallProgress || 0;
  return { declared: declaredSkillIds(user?.expertise || []), courseProgress };
}

export async function getJobMatch(req, res) {
  try {
    const job = await Job.findOne({ slug: req.params.slug, ...publicJobFilter() }).select("title description skills").lean();
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    const person = await personSkills(req.user._id);
    const match = computeJobMatch(job, person);
    if (!match.applicable) return res.json({ success: true, data: { applicable: false } });
    const skills = match.skills.map((skill) => ({ ...skill, courseHref: skill.course ? `/courses/${skill.course}` : null }));
    return res.json({ success: true, data: { ...match, skills, picker: skillPickerOptions(person.declared) } });
  } catch (error) { return fail(res, error, "getJobMatch"); }
}

export async function getMySkills(req, res) {
  try {
    const person = await personSkills(req.user._id);
    return res.json({ success: true, data: skillPickerOptions(person.declared) });
  } catch (error) { return fail(res, error, "getMySkills"); }
}

export async function updateMySkills(req, res) {
  try {
    const ids = Array.isArray(req.body.skills) ? req.body.skills.filter((id) => typeof id === "string").slice(0, 40) : null;
    if (!ids || ids.some((id) => !SKILL_BY_ID.has(id))) return res.status(400).json({ success: false, message: "Choose skills from the list." });
    const user = await User.findById(req.user._id).select("expertise");
    user.expertise = mergeDeclaredSkills(user.expertise || [], ids);
    await user.save({ validateModifiedOnly: true });
    return res.json({ success: true, data: skillPickerOptions(declaredSkillIds(user.expertise)) });
  } catch (error) { return fail(res, error, "updateMySkills"); }
}

// ── Salary statistics ────────────────────────────────────────────────────────

const SALARY_TTL_MS = 10 * 60_000;
const salaryCache = { at: 0, rows: null };

/** Every live job that states a monthly or yearly salary, with only the fields statistics need. */
export async function loadSalaryRows() {
  if (salaryCache.rows && Date.now() - salaryCache.at < SALARY_TTL_MS) return salaryCache.rows;
  salaryCache.rows = await Job.find({ ...publicJobFilter(), country: "AE", salaryVisible: true, salaryPeriod: { $in: ["month", "year"] }, isDemo: { $ne: true } })
    .select("title slug companyName category categorySlug location locationSlug experienceLevel salaryVisible minimumSalary maximumSalary salaryPeriod salarySource postedAt").lean();
  salaryCache.at = Date.now();
  return salaryCache.rows;
}
export const _resetSalaryCache = () => { salaryCache.at = 0; salaryCache.rows = null; };

export async function getSalaryOverview(_req, res) {
  try {
    const rows = await loadSalaryRows();
    res.set("Cache-Control", "public, max-age=300");
    return res.json({ success: true, data: {
      postingsWithSalary: rows.length,
      minimumSample: MIN_SAMPLE,
      overall: summarizeSalaries(rows),
      categories: summarizeBy(rows, (job) => ({ id: job.categorySlug, name: job.category })),
      locations: summarizeBy(rows, (job) => ({ id: job.locationSlug, name: job.location })),
    } });
  } catch (error) { return fail(res, error, "getSalaryOverview"); }
}

export async function getSalaryCategory(req, res) {
  try {
    const rows = (await loadSalaryRows()).filter((job) => job.categorySlug === req.params.category);
    const summary = summarizeSalaries(rows);
    res.set("Cache-Control", "public, max-age=300");
    if (!summary) return res.json({ success: true, data: { available: false, postings: rows.length, minimumSample: MIN_SAMPLE, categoryName: rows[0]?.category || null } });
    const recent = [...rows].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)).slice(0, 8)
      .map((job) => ({ title: job.title, slug: job.slug, companyName: job.companyName, location: job.location, minimumSalary: job.minimumSalary, maximumSalary: job.maximumSalary, salaryPeriod: job.salaryPeriod, salaryVisible: true, salarySource: job.salarySource }));
    return res.json({ success: true, data: {
      available: true, categoryName: rows[0].category, categorySlug: req.params.category, minimumSample: MIN_SAMPLE, ...summary,
      byExperience: summarizeBy(rows, (job) => (job.experienceLevel && job.experienceLevel !== "not-specified" ? { id: job.experienceLevel, name: job.experienceLevel } : null), MIN_SUBGROUP),
      byLocation: summarizeBy(rows, (job) => ({ id: job.locationSlug, name: job.location }), MIN_SUBGROUP),
      recent,
    } });
  } catch (error) { return fail(res, error, "getSalaryCategory"); }
}

/** A one-line "typical pay for this category" for a job page, or null when there is too little data. */
export async function salaryInsightFor(job) {
  const summary = summarizeSalaries((await loadSalaryRows()).filter((row) => row.categorySlug === job.categorySlug));
  return summary ? { categorySlug: job.categorySlug, categoryName: job.category, ...summary } : null;
}

// ── Company hiring insights ──────────────────────────────────────────────────

const WEEK_MS = 7 * 86_400_000;
const MIN_TREND_POSTINGS = 5;

/** Weekly counts of newly listed jobs for the last `weeks` weeks, oldest first. */
export function weeklyCounts(dates, weeks = 8, now = Date.now()) {
  const counts = new Array(weeks).fill(0);
  for (const date of dates) {
    const ago = Math.floor((now - new Date(date).getTime()) / WEEK_MS);
    if (ago >= 0 && ago < weeks) counts[weeks - 1 - ago] += 1;
  }
  return counts;
}

export async function buildCompanyInsights(companyId) {
  const rows = await Job.find({ ...publicJobFilter(), company: companyId, isDemo: { $ne: true } })
    .select("category categorySlug location locationSlug postedAt postedAtSource salaryVisible minimumSalary maximumSalary salaryPeriod").lean();
  const dated = rows.filter((row) => row.postedAtSource === "provider");
  const top = (keyOf) => {
    const counts = new Map();
    for (const row of rows) { const key = keyOf(row); if (key) counts.set(key.id, { ...key, count: (counts.get(key.id)?.count || 0) + 1 }); }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  };
  return {
    openRoles: rows.length,
    newLastWeek: rows.filter((row) => Date.now() - new Date(row.postedAt).getTime() < WEEK_MS).length,
    // Only dates the employer published: "first seen" dates cluster on the day we imported a company's board.
    weekly: dated.length >= MIN_TREND_POSTINGS ? weeklyCounts(dated.map((row) => row.postedAt)) : null,
    topCategories: top((row) => (row.category ? { id: row.categorySlug, name: row.category } : null)),
    topLocations: top((row) => (row.location ? { id: row.locationSlug, name: row.location } : null)),
    salary: summarizeSalaries(rows.filter((row) => ["month", "year"].includes(row.salaryPeriod)), MIN_SUBGROUP),
  };
}

export async function companyIdForSlug(slug) {
  const company = await Company.findOne({ slug: cleanText(slug, 200), active: true }).select("_id").lean();
  return company?._id || null;
}
