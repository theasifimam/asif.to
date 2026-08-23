import mongoose from "mongoose";
import dotenv from "dotenv";
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

const TARGET_TECH_IDS = [
  "typescript",
  "html",
  "nextjs",
  "nodejs",
  "mongodb",
  "tailwindcss",
  "css",
];

const STOP = new Set(
  "a an and are as at be been but by can do does for from how if in into is it of on or should that the this to use used using what when where which why with you your course chapter question answer example".split(" ")
);

function norm(v = "") {
  return String(v)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(v = "") {
  return Array.from(
    new Set(norm(v).split(" ").filter((t) => t.length >= 2 && !STOP.has(t)))
  );
}

function qText(q) {
  return [
    q.question,
    q.explanation,
    q.flashcardAnswer,
    q.tag,
    ...(q.tags || []),
    ...(q.keywords || []),
    ...(q.options || []),
  ]
    .filter(Boolean)
    .join(" ");
}

function cText(c) {
  return [c.title, c.slug, c.summary, ...(c.keywords || [])]
    .filter(Boolean)
    .join(" ");
}

function catText(cat) {
  return [cat.name, cat.slug, cat.description, ...(cat.keywords || [])]
    .filter(Boolean)
    .join(" ");
}

function computeSimilarity(textA, textB) {
  const normA = norm(textA);
  const tokensA = tokens(textA);
  const tokensB = tokens(textB);

  if (!tokensA.length || !tokensB.length) return 0;

  let matches = 0;
  tokensB.forEach((t) => {
    if (tokensA.includes(t)) matches++;
  });

  let score = (matches / Math.max(tokensB.length, 1)) * 70;

  tokensB.forEach((t) => {
    if (t.length >= 4 && normA.includes(t)) score += 10;
  });

  return Math.min(100, Math.round(score));
}

async function processCourse(techId) {
  const course = await Course.findOne({
    $or: [
      { slug: techId },
      { techId: techId },
      { slug: `${techId}-mastery` },
      { slug: `css-mastery` },
    ],
  }).sort({ createdAt: 1 });

  if (!course) {
    console.log(`⚠️ Course matching "${techId}" not found. Skipping.`);
    return { techId, updatedCount: 0, status: "not_found" };
  }

  console.log(`\n-------------------------------------------------------`);
  console.log(`Processing: ${course.title} [techId: ${course.techId}]`);
  console.log(`-------------------------------------------------------`);

  const chapters = await Chapter.find({ course: course._id })
    .sort({ order: 1 })
    .lean();
  const categories = await TopicCategory.find({ course: course._id })
    .sort({ order: 1 })
    .lean();

  console.log(
    `Found ${chapters.length} chapters and ${categories.length} topic categories.`
  );

  const questions = await Question.find({
    type: "quiz",
    courses: course._id,
  });

  console.log(`Found ${questions.length} quiz questions to categorize.\n`);

  if (!questions.length) {
    console.log(`No quiz questions found for ${course.title}.`);
    return { techId, title: course.title, updatedCount: 0, totalQuestions: 0 };
  }

  let updatedCount = 0;

  for (const q of questions) {
    const text = qText(q);

    // 1. Match Chapter
    let bestChapter = null;
    let bestChapterScore = -1;

    if (q.tag && q.tag.includes(":")) {
      const parts = q.tag.split(":");
      if (parts.length >= 2) {
        const slugPart = parts[1];
        const matchBySlug = chapters.find((c) => c.slug === slugPart);
        if (matchBySlug) {
          bestChapter = matchBySlug;
          bestChapterScore = 100;
        }
      }
    }

    if (!bestChapter) {
      for (const ch of chapters) {
        const score = computeSimilarity(text, cText(ch));
        if (score > bestChapterScore) {
          bestChapterScore = score;
          bestChapter = ch;
        }
      }
    }

    // 2. Match Category
    let bestCategory = null;
    let bestCategoryScore = -1;

    if (bestChapter) {
      bestCategory = categories.find((cat) =>
        (cat.featuredChapters || []).some(
          (id) => String(id) === String(bestChapter._id)
        )
      );
    }

    if (!bestCategory) {
      for (const cat of categories) {
        const score = computeSimilarity(text, catText(cat));
        if (score > bestCategoryScore) {
          bestCategoryScore = score;
          bestCategory = cat;
        }
      }
    }

    // Fallback if 0 score
    if (!bestChapter && chapters.length > 0) {
      bestChapter = chapters[0];
    }
    if (!bestCategory && categories.length > 0) {
      bestCategory = categories[0];
    }

    const mapping = {
      course: course._id,
      chapter: bestChapter?._id || null,
      category: bestCategory?._id || null,
      source: "auto",
      confidence: 100,
      mappedAt: new Date(),
    };

    const existingMappings = (q.learningMappings || []).filter(
      (m) => String(m.course?._id || m.course) !== String(course._id)
    );

    existingMappings.push(mapping);
    q.learningMappings = existingMappings;

    await q.save();
    updatedCount++;
  }

  console.log(
    `✅ Successfully categorized all ${updatedCount} quiz questions for ${course.title}!`
  );

  return { techId, title: course.title, updatedCount, totalQuestions: questions.length };
}

async function main() {
  await connectDB();
  console.log("\n=======================================================");
  console.log("Batch Categorizing Quiz Questions for All Target Courses");
  console.log("=======================================================");

  const summary = [];

  for (const techId of TARGET_TECH_IDS) {
    const res = await processCourse(techId);
    summary.push(res);
  }

  console.log("\n=======================================================");
  console.log("BATCH CATEGORIZATION SUMMARY:");
  console.log("=======================================================");
  console.table(summary);
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
