import Article from "../models/Article.js";
import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import CourseTopic from "../models/CourseTopic.js";
import Question from "../models/Question.js";

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

export async function getSearchIndex(_req, res) {
  try {
    if (cachedIndex && Date.now() - cachedAt < CACHE_MS)
      return res.json({ success: true, data: cachedIndex });

    const [courses, chapters, topics, articles, questions] = await Promise.all([
      Course.find({ status: "published" }).select("title slug subtitle keywords techId order updatedAt").lean(),
      Chapter.find({ status: "published" }).select("title slug summary keywords content course order updatedAt").populate("course", "title slug techId").lean(),
      CourseTopic.find({ status: "published" }).select("title slug excerpt keywords content type course category order updatedAt").populate("course", "title slug techId").populate("category", "name slug").lean(),
      Article.find({ status: "published" }).select("title slug content seoDescription keywords type techId order topic updatedAt").populate("topic", "name").lean(),
      Question.find({ type: "interview", status: "published" }).select("question slug answer tags difficulty course updatedAt").populate("course", "title slug techId status").lean(),
    ]);

    const items = [];
    courses.forEach((item) => items.push({
      id: `course:${item._id}`, type: "course", title: item.title, url: `/courses/${item.slug}`,
      adminUrl: `/courses/${item._id}`,
      description: item.subtitle, keywords: item.keywords, course: item.title, technology: item.techId,
      priority: 12, updatedAt: item.updatedAt,
    }));
    chapters.filter((item) => item.course).forEach((item) => items.push({
      id: `chapter:${item._id}`, type: "chapter", title: item.title,
      url: `/courses/${item.course.slug}/${item.slug}`, description: item.summary,
      adminUrl: `/courses/${item.course._id}/chapters/${item._id}`,
      keywords: item.keywords, headings: headings((item.content || []).join("\n")),
      content: plainText((item.content || []).join(" ")).slice(0, 700),
      course: item.course.title, category: "Chapter", technology: item.course.techId, priority: 10,
      updatedAt: item.updatedAt,
    }));
    topics.filter((item) => item.course).forEach((item) => {
      const categorySlug = item.category?.slug && item.category.slug !== item.slug ? `/${item.category.slug}` : "";
      items.push({ id: `topic:${item._id}`, type: item.type === "interview" ? "question" : "topic", title: item.title,
        url: `/${item.course.slug}${categorySlug}/${item.slug}`, description: item.excerpt,
        adminUrl: `/topics/${item._id}/edit`,
        keywords: item.keywords, headings: headings(item.content), content: plainText(item.content).slice(0, 700),
        course: item.course.title, category: item.category?.name || "Topic", technology: item.course.techId, priority: 11,
        updatedAt: item.updatedAt });
    });
    articles.forEach((item) => items.push({
      id: `${item.type}:${item._id}`, type: item.type, title: item.title,
      url: item.type === "cheatsheet" ? `/cheatsheets/${item.slug}` : `/articles/${item.slug}`,
      adminUrl: item.type === "cheatsheet" ? `/cheatsheets/${item._id}/edit` : `/articles/edit/${item._id}`,
      description: item.seoDescription || plainText(item.content).slice(0, 180), keywords: item.keywords,
      headings: headings(item.content), content: plainText(item.content).slice(0, 700),
      category: (item.topic || []).map((topic) => topic.name).filter(Boolean).join(" · "), technology: item.techId, priority: item.type === "cheatsheet" ? 8 : 6,
      updatedAt: item.updatedAt,
    }));
    questions.filter((item) => item.course?.status === "published").forEach((item) => items.push({
      id: `question:${item._id}`, type: "question", title: item.question,
      url: `/${item.course.slug}/interview-questions/${item.slug}`, description: plainText(item.answer).slice(0, 180),
      adminUrl: `/interview-questions/${item._id}/edit`,
      keywords: item.tags, content: plainText(item.answer).slice(0, 500), course: item.course.title,
      category: `${item.difficulty || ""} Interview Question`.trim(), technology: item.course.techId, priority: 5,
      updatedAt: item.updatedAt,
    }));

    cachedIndex = { items, generatedAt: new Date().toISOString() };
    cachedAt = Date.now();
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data: cachedIndex });
  } catch (error) {
    console.error("[SEARCH] index error:", error);
    res.status(500).json({ success: false, message: "Could not build the search index." });
  }
}
