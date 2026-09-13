import Article from "../models/Article.js";
import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import CourseTopic from "../models/CourseTopic.js";
import TopicCategory from "../models/TopicCategory.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import { hasPermission } from "../utils/permissions.js";
import { publicJobFilter } from "../utils/jobValidation.js";

const CACHE_MS = 60_000;
let cachedIndex = null;
let cachedAt = 0;

const plainText = (value = "") => String(value)
  .replace(/```[\s\S]*?```/g, " ")
  .replace(/<[^>]+>|[#*_>`~\[\]()!-]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const headings = (value = "") => [...String(value).matchAll(/^#{1,4}\s+(.+)$/gm)]
  .map((match) => plainText(match[1])).filter(Boolean).slice(0, 12);

export const getSearchIndex = (req, res) => buildSearchIndex(req, res, false);
export const getAdminSearchIndex = (req, res) => buildSearchIndex(req, res, true);

async function buildSearchIndex(req, res, admin) {
  try {
    if (!admin && cachedIndex && Date.now() - cachedAt < CACHE_MS)
      return res.json({ success: true, data: cachedIndex });

    const allowed = (permission) => !admin || hasPermission(req.user, permission);
    const published = admin ? {} : { status: "published" };
    const articleAccess = !admin || hasPermission(req.user, "articles.edit_all") || hasPermission(req.user, "articles.edit_own");
    const articleFilter = admin && !hasPermission(req.user, "articles.edit_all")
      ? { author: req.user._id } : published;
    const [courses, chapters, topics, articles, categories, questions, users, jobs, companies] = await Promise.all([
      allowed("courses.view") ? Course.find(published).select("title slug subtitle keywords techId order updatedAt").lean() : [],
      allowed("courses.view") ? Chapter.find(published).select("title slug summary keywords content course order updatedAt").populate("course", "title slug techId status").lean() : [],
      allowed("topics.view") ? CourseTopic.find(published).select("title slug excerpt keywords content type course category order updatedAt").populate("course", "title slug techId status").populate("category", "name slug").lean() : [],
      Article.find({ isUserGenerated: { $ne: true }, ...(!admin ? { visibility: { $nin: ["private", "unlisted"] } } : {}), $or: [
        ...(articleAccess ? [{ ...articleFilter, type: { $in: ["article", null] } }] : []),
        ...(allowed("cheatsheets.view") ? [{ ...published, type: "cheatsheet" }] : []),
        { _id: null },
      ] }).select("title slug content seoDescription keywords type techId order topic updatedAt").populate("topic", "name").lean(),
      allowed("topics.view") ? TopicCategory.find(admin ? {} : { status: { $ne: "draft" }, noindex: { $ne: true } }).select("name slug description seoTitle seoDescription keywords updatedAt course").populate("course", "title slug status").lean() : [],
      allowed("interview_questions.view") ? Question.find({ type: "interview", ...(!admin ? { status: { $ne: "draft" } } : {}) }).select("question slug answer tags difficulty category course updatedAt").populate("category", "name slug").populate("course", "title slug techId status").lean() : [],
      allowed("users.view") ? User.find(admin ? { deletedAt: null } : {
        deletedAt: null, status: "active", "settings.profileVisibility": { $ne: "private" },
      }).select(admin ? "fullName username email role status updatedAt" : "fullName username bio expertise updatedAt").lean() : [],
      allowed("jobs.view") ? Job.find(admin ? {} : publicJobFilter()).select("title slug companyName location category employmentType updatedAt").lean() : [],
      allowed("jobs.view") ? Company.find(admin ? {} : { active: true }).select("name slug description industry headquarters updatedAt").lean() : [],
    ]);

    const items = [];
    courses.forEach((item) => items.push({
      id: `course:${item._id}`, type: "course", title: item.title, url: `/courses/${item.slug}`,
      adminUrl: `/courses/${item._id}`,
      description: item.subtitle, keywords: item.keywords, course: item.title, technology: item.techId,
      priority: 12, updatedAt: item.updatedAt,
    }));
    chapters.filter((item) => item.course && (admin || item.course.status === "published")).forEach((item) => items.push({
      id: `chapter:${item._id}`, type: "chapter", title: item.title,
      url: `/courses/${item.course.slug}/${item.slug}`, description: item.summary,
      adminUrl: `/courses/${item.course._id}/chapters/${item._id}`,
      keywords: item.keywords, headings: headings((item.content || []).join("\n")),
      content: plainText((item.content || []).join(" ")).slice(0, 700),
      course: item.course.title, category: "Chapter", technology: item.course.techId, priority: 10,
      updatedAt: item.updatedAt,
    }));
    topics.filter((item) => item.course && (admin || item.course.status === "published")).forEach((item) => {
      const categorySlug = item.category?.slug && item.category.slug !== item.slug ? `/${item.category.slug}` : "";
      items.push({ id: `topic:${item._id}`, type: item.type === "interview" ? "question" : "topic", title: item.title,
        url: `/${item.course.slug}${categorySlug}/${item.slug}`, description: item.excerpt,
        adminUrl: `/topics/${item._id}/edit`,
        keywords: item.keywords, headings: headings(item.content), content: plainText(item.content).slice(0, 700),
        course: item.course.title, category: item.category?.name || "Topic", technology: item.course.techId, priority: 11,
        updatedAt: item.updatedAt });
    });
    articles.forEach((item) => items.push({
      id: `${item.type || "article"}:${item._id}`, type: item.type || "article", title: item.title,
      url: item.type === "cheatsheet" ? `/cheatsheets/${item.slug}` : `/articles/${item.slug}`,
      adminUrl: item.type === "cheatsheet" ? `/cheatsheets/${item._id}/edit` : `/articles/edit/${item._id}`,
      description: item.seoDescription || plainText(item.content).slice(0, 180), keywords: item.keywords,
      headings: headings(item.content), content: plainText(item.content).slice(0, 700),
      category: (item.topic || []).map((topic) => topic.name).filter(Boolean).join(" · "), technology: item.techId, priority: item.type === "cheatsheet" ? 8 : 6,
      updatedAt: item.updatedAt,
    }));
    categories.filter((item) => admin || !item.course || item.course.status === "published").forEach((item) => {
      const courseSlug = item.course?.slug;
      const url = courseSlug ? `/${courseSlug}/interview-questions/${item.slug}` : `/interview-questions/${item.slug}`;
      items.push({
        id: `interview-category:${item._id}`, type: "interview-category", title: item.seoTitle || `${item.name} Interview Questions and Answers`,
        url, description: item.seoDescription || item.description || `Interview preparation guide for ${item.name}`,
        adminUrl: `/categories`, keywords: item.keywords, priority: 9, updatedAt: item.updatedAt,
      });
    });
    questions.filter((item) => admin || !item.course || item.course.status === "published").forEach((item) => {
      const courseSlug = item.course?.slug;
      const catSlug = item.category?.slug || "fundamentals";
      const url =
        courseSlug && item.slug
          ? `/${courseSlug}/interview-questions/${item.slug}`
          : `/interview-questions/${catSlug}`;
      items.push({
        id: `question:${item._id}`, type: "question", title: item.question,
        url, description: plainText(item.answer).slice(0, 180),
        adminUrl: `/interview-questions/${item._id}/edit`,
        keywords: item.tags, content: plainText(item.answer).slice(0, 500), course: item.course?.title || item.category?.name,
        category: `${item.difficulty || ""} Interview Question`.trim(), technology: courseSlug || catSlug, priority: 5,
        updatedAt: item.updatedAt,
      });
    });

    users.filter((item) => item.username).forEach((item) => items.push({
      id: `user:${item._id}`, type: "user", title: item.fullName || item.username,
      url: `/${encodeURIComponent(item.username)}`, adminUrl: `/users/${item._id}`,
      description: admin ? `@${item.username} · ${item.email || ""} · ${item.status}` : `@${item.username} ${plainText(item.bio).slice(0, 160)}`,
      keywords: [item.username, ...(admin ? [item.email, item.role].filter(Boolean) : item.expertise || [])],
      category: "User", priority: 10, updatedAt: item.updatedAt,
    }));
    jobs.forEach((item) => items.push({
      id: `job:${item._id}`, type: "job", title: item.title,
      url: `/jobs/${item.slug}`, adminUrl: `/jobs/${item._id}/edit`,
      description: [item.companyName, item.location, item.employmentType].filter(Boolean).join(" · "),
      keywords: [item.companyName, item.location, item.category].filter(Boolean),
      category: item.category, priority: 8, updatedAt: item.updatedAt,
    }));
    companies.forEach((item) => items.push({
      id: `company:${item._id}`, type: "company", title: item.name,
      url: `/jobs/company/${item.slug}`, adminUrl: `/jobs/companies/${item._id}/edit`,
      description: plainText(item.description).slice(0, 180),
      keywords: [item.industry, item.headquarters].filter(Boolean), category: item.industry,
      priority: 7, updatedAt: item.updatedAt,
    }));

    // Never cache permission-scoped admin data in the shared public index.
    const data = { items: admin ? items : items.map(({ adminUrl, ...item }) => item), generatedAt: new Date().toISOString() };
    if (!admin) {
      cachedIndex = data;
      cachedAt = Date.now();
    }
    res.set("Cache-Control", admin ? "private, no-store" : "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data });
  } catch (error) {
    console.error("[SEARCH] index error:", error);
    res.status(500).json({ success: false, message: "Could not build the search index." });
  }
}
