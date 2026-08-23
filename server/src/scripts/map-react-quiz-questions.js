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

const STOP = new Set("a an and are as at be been but by can do does for from how if in into is it of on or should that the this to use used using what when where which why with you your javascript react reactjs course chapter question answer example".split(" "));

function norm(v = "") {
  return String(v).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}
function tokens(v = "") {
  return Array.from(new Set(norm(v).split(" ").filter((t) => t.length >= 2 && !STOP.has(t))));
}
function qText(q) {
  return [q.question, q.explanation, q.flashcardAnswer, q.tag, ...(q.tags || []), ...(q.keywords || []), ...(q.options || [])].filter(Boolean).join(" ");
}
function cText(c) {
  return [c.title, c.slug, c.summary, ...(c.keywords || [])].filter(Boolean).join(" ");
}
function catText(cat) {
  return [cat.name, cat.slug, cat.description, ...(cat.keywords || [])].filter(Boolean).join(" ");
}

function computeSimilarity(textA, textB) {
  const normA = norm(textA);
  const normB = norm(textB);
  const tokensA = tokens(textA);
  const tokensB = tokens(textB);

  if (!tokensA.length || !tokensB.length) return 0;

  let matches = 0;
  tokensB.forEach((t) => {
    if (tokensA.includes(t)) matches++;
  });

  let score = (matches / Math.max(tokensB.length, 1)) * 70;

  // Title / Substring match bonus
  tokensB.forEach((t) => {
    if (t.length >= 4 && normA.includes(t)) score += 10;
  });

  return Math.min(100, Math.round(score));
}

async function main() {
  await connectDB();
  console.log("\n=======================================================");
  console.log("Categorizing ReactJS Quiz Questions");
  console.log("=======================================================\n");

  const course = await Course.findOne({
    $or: [{ slug: "reactjs" }, { slug: "react-js" }, { slug: "react" }, { techId: "reactjs" }, { title: /react/i }],
  }).sort({ createdAt: 1 });

  if (!course) {
    console.error("React course not found!");
    process.exit(1);
  }

  console.log(`Target Course: ${course.title} [ID: ${course._id}]`);

  const chapters = await Chapter.find({ course: course._id }).sort({ order: 1 }).lean();
  const categories = await TopicCategory.find({ course: course._id }).sort({ order: 1 }).lean();

  console.log(`Found ${chapters.length} chapters and ${categories.length} topic categories.\n`);

  // Fetch only QUIZ questions (excluding interview type)
  const questions = await Question.find({
    type: "quiz",
    courses: course._id,
  });

  console.log(`Found ${questions.length} React quiz questions to categorize.\n`);

  let updatedCount = 0;

  for (const q of questions) {
    const text = qText(q);

    // 1. Find best matching chapter
    let bestChapter = null;
    let bestChapterScore = -1;

    // First check tag pattern if seeded via tag e.g. "course-flow-test:chapter-slug:..."
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

    // 2. Find best matching category
    let bestCategory = null;
    let bestCategoryScore = -1;

    // Check if category is linked to chapter
    if (bestChapter) {
      bestCategory = categories.find((cat) =>
        (cat.featuredChapters || []).some((id) => String(id) === String(bestChapter._id))
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

    // Fallbacks if score is 0
    if (!bestChapter && chapters.length > 0) {
      bestChapter = chapters[0];
    }
    if (!bestCategory && categories.length > 0) {
      bestCategory = categories[0];
    }

    // Update question learning mappings
    const mapping = {
      course: course._id,
      chapter: bestChapter?._id || null,
      category: bestCategory?._id || null,
      source: "auto",
      confidence: 100,
      mappedAt: new Date(),
    };

    // Filter out existing mapping for this course and append updated mapping
    const existingMappings = (q.learningMappings || []).filter(
      (m) => String(m.course?._id || m.course) !== String(course._id)
    );

    existingMappings.push(mapping);
    q.learningMappings = existingMappings;

    await q.save();
    updatedCount++;

    console.log(
      `[${updatedCount}/${questions.length}] ${q.question.slice(0, 50)}...`
    );
    console.log(
      `   -> Chapter: ${bestChapter?.title || "None"} | Category: ${bestCategory?.name || "None"}\n`
    );
  }

  console.log("=======================================================");
  console.log(`Successfully categorized all ${updatedCount} ReactJS quiz questions!`);
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
