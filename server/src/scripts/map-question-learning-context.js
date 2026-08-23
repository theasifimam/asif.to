import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../configs/db.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import TopicCategory from "../models/TopicCategory.js";
import Question from "../models/Question.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const COURSE = args.find((x) => x.startsWith("--course="))?.split("=")[1] || "";
const CHAPTER_THRESHOLD = Number(args.find((x) => x.startsWith("--chapter-threshold="))?.split("=")[1] || 68);
const CATEGORY_THRESHOLD = Number(args.find((x) => x.startsWith("--category-threshold="))?.split("=")[1] || 62);
const MARGIN = Number(args.find((x) => x.startsWith("--margin="))?.split("=")[1] || 10);
const REVIEW = path.resolve(__dirname, "./data/question-learning-mapping-review.json");

const STOP = new Set("a an and are as at be been but by can do does for from how if in into is it of on or should that the this to use used using what when where which why with you your javascript react reactjs nextjs nodejs mongodb course chapter question answer example".split(" "));
const IMPORTANT = new Set("jsx props prop state usestate useeffect useref usememo usecallback context reducer usereducer hook hooks component components event events form forms list lists key keys route routing router middleware caching cache server client rendering ssr ssg isr closure closures promise promises async await prototype prototypes array arrays object objects scope hoisting fetch http security testing deployment metadata seo authentication authorization cookies session sessions database".split(" "));

function norm(v = "") {
  return String(v).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}
function singular(t) {
  if (t.length > 4 && t.endsWith("ies")) return `${t.slice(0, -3)}y`;
  if (t.length > 4 && t.endsWith("s")) return t.slice(0, -1);
  return t;
}
function tokens(v = "") {
  return Array.from(new Set(norm(v).split(" ").map(singular).filter((t) => t.length >= 2 && !STOP.has(t))));
}
function qText(q) {
  return [q.question, q.explanation, q.flashcardAnswer, q.tag, ...(q.tags || []), ...(q.keywords || []), ...(q.options || [])].filter(Boolean).join(" ");
}
function cText(c) { return [c.title, c.slug, c.summary, ...(c.keywords || [])].filter(Boolean).join(" "); }
function gText(c) { return [c.name, c.slug, c.description, ...(c.keywords || [])].filter(Boolean).join(" "); }
function idf(candidates, builder) {
  const docs = candidates.map((c) => new Set(tokens(builder(c))));
  const df = new Map();
  docs.forEach((doc) => doc.forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  return (t) => Math.log((docs.length + 1) / ((df.get(t) || 0) + 1)) + 1;
}
function score(source, candidate, builder, weight) {
  const sourceNorm = norm(source);
  const sourceTokens = new Set(tokens(source));
  const candidateTokens = tokens(builder(candidate));
  if (!candidateTokens.length) return 0;
  let total = 0, hit = 0, strong = 0;
  candidateTokens.forEach((t) => {
    const w = weight(t) * (IMPORTANT.has(t) ? 2.2 : 1);
    total += w;
    if (sourceTokens.has(t)) { hit += w; if (IMPORTANT.has(t)) strong += 1; }
  });
  let result = total ? (hit / total) * 76 : 0;
  const title = norm(candidate.title || candidate.name || "");
  const slug = norm(String(candidate.slug || "").replace(/-/g, " "));
  if (title.length >= 4 && sourceNorm.includes(title)) result += 24;
  else if (slug.length >= 4 && sourceNorm.includes(slug)) result += 18;
  if (strong) result += Math.min(14, strong * 7);
  return Math.min(100, Math.round(result));
}
function rank(source, candidates, builder) {
  const weight = idf(candidates, builder);
  return candidates.map((item) => ({ item, score: score(source, item, builder, weight) })).sort((a, b) => b.score - a.score);
}
function confident(ranked, threshold) {
  return ranked.length && ranked[0].score >= threshold && ranked[0].score - (ranked[1]?.score || 0) >= MARGIN;
}
function slim(entry, field) {
  return entry ? { id: String(entry.item._id), label: entry.item[field], slug: entry.item.slug, score: entry.score } : null;
}
function existingFor(q, courseId) {
  return (q.learningMappings || []).find((m) => String(m.course?._id || m.course) === String(courseId));
}

async function coursesToProcess() {
  if (!COURSE) return Course.find({}).select("_id title slug techId").lean();
  const query = mongoose.isValidObjectId(COURSE)
    ? { _id: COURSE }
    : { $or: [{ slug: COURSE }, { techId: COURSE }, { title: new RegExp(COURSE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }] };
  const found = await Course.find(query).select("_id title slug techId").lean();
  if (!found.length) throw new Error(`No course matched ${COURSE}`);
  return found;
}

async function run() {
  await connectDB();
  const review = [];
  const stats = { scanned: 0, applied: 0, manualKept: 0, ambiguous: 0, courseOnly: 0 };
  for (const course of await coursesToProcess()) {
    const chapters = await Chapter.find({ course: course._id }).select("_id title slug summary keywords order learningActivities relatedQuestions").sort({ order: 1 }).lean();
    const categories = await TopicCategory.find({ course: course._id }).select("_id name slug description keywords featuredChapters order").sort({ order: 1 }).lean();
    const legacy = new Map();
    chapters.forEach((ch) => [...(ch.learningActivities?.revisionQuestions || []), ...(ch.learningActivities?.practiceQuestions || []), ...(ch.relatedQuestions || [])].forEach((id) => { if (id && !legacy.has(String(id))) legacy.set(String(id), ch); }));
    const questions = await Question.find({ type: "quiz", courses: course._id }).lean();
    console.log(`${course.title}: ${questions.length} questions`);
    for (const q of questions) {
      stats.scanned++;
      const existing = existingFor(q, course._id);
      if (existing?.source === "manual") { stats.manualKept++; continue; }
      const source = qText(q);
      const cr = rank(source, chapters, cText);
      const gr = rank(source, categories, gText);
      const legacyChapter = legacy.get(String(q._id));
      const chapter = legacyChapter || (confident(cr, CHAPTER_THRESHOLD) ? cr[0].item : null);
      let category = null;
      if (chapter) category = categories.find((g) => (g.featuredChapters || []).some((id) => String(id) === String(chapter._id))) || null;
      if (!category && confident(gr, CATEGORY_THRESHOLD)) category = gr[0].item;
      const chapterScore = legacyChapter ? 100 : (chapter ? cr[0].score : 0);
      const categoryScore = category ? (gr.find((r) => String(r.item._id) === String(category._id))?.score || 100) : 0;
      if (!chapter && !category) {
        stats.courseOnly++; stats.ambiguous++;
        review.push({ questionId: String(q._id), question: q.question, course: { id: String(course._id), title: course.title, slug: course.slug }, reason: "No high-confidence match", chapterCandidates: cr.slice(0,3).map((e) => slim(e,"title")), categoryCandidates: gr.slice(0,3).map((e) => slim(e,"name")) });
        continue;
      }
      if (!chapter) {
        stats.ambiguous++;
        review.push({ questionId: String(q._id), question: q.question, course: { id: String(course._id), title: course.title, slug: course.slug }, reason: "Category matched; chapter needs review", category: category ? { id: String(category._id), name: category.name, score: categoryScore } : null, chapterCandidates: cr.slice(0,3).map((e) => slim(e,"title")) });
      }
      const mapping = { course: course._id, chapter: chapter?._id || null, category: category?._id || null, source: legacyChapter ? "legacy" : "auto", confidence: Math.round(chapter ? (category ? chapterScore * .75 + categoryScore * .25 : chapterScore) : categoryScore), mappedAt: new Date() };
      if (APPLY) {
        const next = (q.learningMappings || []).filter((m) => String(m.course?._id || m.course) !== String(course._id));
        next.push(mapping);
        await Question.updateOne({ _id: q._id }, { $set: { learningMappings: next } });
      }
      stats.applied++;
    }
  }
  fs.mkdirSync(path.dirname(REVIEW), { recursive: true });
  fs.writeFileSync(REVIEW, JSON.stringify({ generatedAt: new Date().toISOString(), mode: APPLY ? "apply" : "dry-run", thresholds: { chapter: CHAPTER_THRESHOLD, category: CATEGORY_THRESHOLD, margin: MARGIN }, stats, review }, null, 2));
  console.log(stats);
  console.log(`Review: ${REVIEW}`);
  if (!APPLY) console.log("No DB changes made. Review JSON, then rerun with --apply.");
  await mongoose.disconnect();
}
run().catch(async (err) => { console.error(err); try { await mongoose.disconnect(); } catch {} process.exit(1); });
