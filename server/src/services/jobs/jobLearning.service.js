/**
 * Connects a job to the asif.to learning content that teaches its skills:
 * courses, a practice quiz and interview questions. Only published content is
 * ever linked, so a mapping to an unpublished course silently disappears.
 */
import Course from "../../models/Course.js";
import TopicCategory from "../../models/TopicCategory.js";
import { extractSkills } from "./jobExtraction.service.js";
import { SKILL_CATALOG, findSkillByLabel } from "./skillCatalog.js";

const CATALOG_ORDER = new Map(SKILL_CATALOG.map((skill, index) => [skill.id, index]));

const MAX_COURSES = 3;
const CACHE_MS = 10 * 60_000;
const cache = { at: 0, courses: new Map(), interview: new Map() };

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

async function loadCatalogContent(slugs, { CourseModel, CategoryModel }) {
  if (Date.now() - cache.at > CACHE_MS) { cache.courses.clear(); cache.interview.clear(); cache.at = Date.now(); }
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
export async function buildJobLearning(job, { CourseModel = Course, CategoryModel = TopicCategory } = {}) {
  const skills = skillsForJob(job);
  const taught = skills.filter((skill) => skill.course);
  const slugs = [...new Set(taught.map((skill) => skill.course))].slice(0, MAX_COURSES + 2);
  if (!slugs.length) return { skills: skills.map(({ id, label, course }) => ({ id, label, hasCourse: Boolean(course) })), items: [] };
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
  return { skills: skills.map(({ id, label, course }) => ({ id, label, hasCourse: Boolean(course) })), items };
}

export const _resetJobLearningCache = () => { cache.at = 0; cache.courses.clear(); cache.interview.clear(); };
