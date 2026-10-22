/**
 * Connects a job to the asif.to learning content that teaches its skills:
 * courses, a practice quiz and interview questions. Only published content is
 * ever linked, so a mapping to an unpublished course silently disappears.
 */
import Course from "../../models/Course.js";
import TopicCategory from "../../models/TopicCategory.js";
import Question from "../../models/Question.js";
import { slugify } from "../../utils/slugify.js";
import { isThinInterviewCategory } from "../../utils/interviewCategoryQuality.js";
import { extractSkills } from "./jobExtraction.service.js";
import { SKILL_CATALOG, findSkillByLabel } from "./skillCatalog.js";

const CATALOG_ORDER = new Map(SKILL_CATALOG.map((skill, index) => [skill.id, index]));

const MAX_COURSES = 3;
const MAX_CAREER_GUIDES = 3;
const CACHE_MS = 10 * 60_000;
const cache = { at: 0, courses: new Map(), interview: new Map(), career: new Map() };

/** Skills for a job: stored skills first, then anything its title or text mentions. */
export function skillsForJob(job = {}) {
  const found = new Map();
  for (const label of job.skills || []) {
    const skill = findSkillByLabel(label);
    if (skill) found.set(skill.id, skill);
  }
  for (const skill of extractSkills(`${job.title || ""}\n${job.description || ""}`)) found.set(skill.id, skill);
  return [...found.values()].sort((a, b) => CATALOG_ORDER.get(a.id) - CATALOG_ORDER.get(b.id));
}

function resetCache(stamp = false) {
  cache.at = stamp ? Date.now() : 0;
  cache.courses.clear(); cache.interview.clear(); cache.career.clear();
}

/**
 * Career/role interview guides (TopicCategory track "career") that prepare for a job
 * category. Only guides that pass the indexing quality gate are linked, so a job never
 * points at an empty or half-written guide.
 */
export async function careerGuidesForJobCategory(categorySlug, { CategoryModel = TopicCategory, QuestionModel = Question } = {}) {
  const slug = slugify(categorySlug);
  if (!slug) return [];
  if (Date.now() - cache.at > CACHE_MS) resetCache(true);
  if (cache.career.has(slug)) return cache.career.get(slug);
  const categories = await CategoryModel.find({ track: "career", status: "published", noindex: { $ne: true }, jobCategorySlugs: slug })
    .sort({ order: 1 }).select("slug name description").lean();
  let guides = [];
  if (categories.length) {
    const counts = await QuestionModel.aggregate([
      { $match: { type: "interview", status: { $ne: "draft" }, category: { $in: categories.map((category) => category._id) } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countById = new Map(counts.map((row) => [String(row._id), row.count]));
    guides = categories
      .map((category) => ({ category, questionCount: countById.get(String(category._id)) || 0 }))
      .filter(({ category, questionCount }) => !isThinInterviewCategory({ ...category, track: "career" }, questionCount))
      .slice(0, MAX_CAREER_GUIDES)
      .map(({ category, questionCount }) => ({
        slug: category.slug, name: category.name, description: category.description || "", questionCount,
        href: `/interview-questions/${category.slug}`,
      }));
  }
  cache.career.set(slug, guides);
  return guides;
}

async function loadCatalogContent(slugs, { CourseModel, CategoryModel }) {
  if (Date.now() - cache.at > CACHE_MS) resetCache(true);
  const toLoad = slugs.filter((slug) => !cache.courses.has(slug));
  if (!toLoad.length) return;
  const courses = await CourseModel.find({ slug: { $in: toLoad }, status: "published" }).select("slug title subtitle").lean();
  const found = new Set(courses.map((course) => course.slug));
  for (const course of courses) cache.courses.set(course.slug, course);
  for (const slug of toLoad) if (!found.has(slug)) cache.courses.set(slug, null); // remember "not published"
  if (!courses.length) return;
  const categories = await CategoryModel.find({ course: { $in: courses.map((course) => course._id) }, status: "published" }).sort({ order: 1 }).select("slug name course").lean();
  for (const category of categories) {
    const owner = courses.find((course) => String(course._id) === String(category.course));
    if (owner && !cache.interview.has(owner.slug)) cache.interview.set(owner.slug, category);
  }
}

/**
 * @returns {Promise<{skills: Array, items: Array}>} items are the learning cards to show.
 */
export async function buildJobLearning(job, { CourseModel = Course, CategoryModel = TopicCategory, QuestionModel = Question } = {}) {
  const skills = skillsForJob(job);
  const taught = skills.filter((skill) => skill.course);
  const slugs = [...new Set(taught.map((skill) => skill.course))].slice(0, MAX_COURSES + 2);
  const skillSummary = skills.map(({ id, label, course }) => ({ id, label, hasCourse: Boolean(course) }));
  // Jobs with no taught skill (hospitality, sales, construction...) get role interview guides instead.
  const careerGuidesFor = () => careerGuidesForJobCategory(job?.categorySlug || job?.category, { CategoryModel, QuestionModel });
  if (!slugs.length) return { skills: skillSummary, items: [], careerGuides: await careerGuidesFor() };
  await loadCatalogContent(slugs, { CourseModel, CategoryModel });
  const items = [];
  for (const slug of slugs) {
    const course = cache.courses.get(slug);
    if (!course) continue;
    const category = cache.interview.get(slug);
    items.push({
      skills: taught.filter((skill) => skill.course === slug).map((skill) => skill.label),
      course: { slug, title: course.title, subtitle: course.subtitle || "", href: `/courses/${slug}` },
      quizHref: `/quiz?course=${encodeURIComponent(slug)}`,
      interviewHref: category ? `/${slug}/interview-questions/${category.slug}` : "/interview-questions",
    });
    if (items.length === MAX_COURSES) break;
  }
  return { skills: skillSummary, items, careerGuides: items.length ? [] : await careerGuidesFor() };
}

export const _resetJobLearningCache = () => resetCache();
