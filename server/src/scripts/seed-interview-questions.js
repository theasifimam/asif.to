import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../configs/db.js";
import Question from "../models/Question.js";
import Course from "../models/Course.js";
import TopicCategory from "../models/TopicCategory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function slugify(value = "") {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);
}

function parseList(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
}

function computeCanonicalUrl(courseSlug, categorySlug, questionSlug, customUrl = "") {
  if (customUrl && /^https?:\/\//i.test(customUrl)) {
    return customUrl.trim();
  }

  const siteBase = "https://asif.to";
  let basePath = "";
  if (courseSlug && categorySlug) {
    basePath = `/${courseSlug}/interview-questions/${categorySlug}`;
  } else if (courseSlug) {
    basePath = `/${courseSlug}/interview-questions`;
  } else if (categorySlug) {
    basePath = `/interview-questions/${categorySlug}`;
  } else {
    basePath = `/interview-questions`;
  }

  return `${siteBase}${basePath}/${questionSlug}`;
}

/**
 * Normalizes input JSON into a flat array of interview question items with resolved courseSlug & categorySlug.
 */
function normalizePayload(rawData) {
  const items = [];

  const processBlock = (block, parentCourseSlug = "", parentCategorySlug = "") => {
    if (!block || typeof block !== "object") return;

    const courseSlug = block.courseSlug || parentCourseSlug || "";
    const categorySlug = block.categorySlug || parentCategorySlug || "";

    if (Array.isArray(block.questions)) {
      for (const q of block.questions) {
        items.push({
          ...q,
          courseSlug: q.courseSlug || courseSlug,
          categorySlug: q.categorySlug || categorySlug,
        });
      }
    } else if (block.question && (block.answer || block.explanation)) {
      items.push({
        ...block,
        courseSlug,
        categorySlug,
      });
    }
  };

  if (Array.isArray(rawData)) {
    for (const entry of rawData) {
      processBlock(entry);
    }
  } else if (typeof rawData === "object" && rawData !== null) {
    if (Array.isArray(rawData.questions)) {
      processBlock(rawData);
    } else {
      processBlock(rawData);
    }
  }

  return items;
}

// Memory caches to avoid querying MongoDB repeatedly
const courseCache = new Map();
const categoryCache = new Map();

async function getCourseBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  if (courseCache.has(cleanSlug)) return courseCache.get(cleanSlug);

  const course = await Course.findOne({ slug: cleanSlug });
  courseCache.set(cleanSlug, course);
  return course;
}

async function getCategoryBySlug(slug, courseId = null, autoCreate = false, courseDoc = null) {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  const cacheKey = `${cleanSlug}_${courseId ? courseId.toString() : "global"}`;

  if (categoryCache.has(cacheKey)) return categoryCache.get(cacheKey);

  // 1. Try finding category matching slug and course
  let category = null;
  if (courseId) {
    category = await TopicCategory.findOne({ slug: cleanSlug, course: courseId });
  }

  // 2. Try finding category by slug globally
  if (!category) {
    category = await TopicCategory.findOne({ slug: cleanSlug });
  }

  // 3. Optional auto-creation if requested
  if (!category && autoCreate) {
    const formattedName = cleanSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    category = await TopicCategory.create({
      name: formattedName,
      slug: cleanSlug,
      course: courseId || null,
      description: `Interview questions for ${formattedName}`,
      status: "published",
    });
    console.log(`✨ Created missing category: "${formattedName}" (${cleanSlug})`);
  }

  categoryCache.set(cacheKey, category);
  return category;
}

async function seedInterviewQuestions({
  filePath,
  isDryRun = false,
  skipDuplicates = false,
  autoCreateCategory = false,
  validateOnly = false,
}) {
  console.log("=================================================");
  console.log("🚀 Interview Questions Seeder");
  console.log(`📄 Input File: ${filePath}`);
  console.log(`⚙️  Options: validateOnly=${validateOnly}, dryRun=${isDryRun}, skipDuplicates=${skipDuplicates}, autoCreateCategory=${autoCreateCategory}`);
  console.log("=================================================\n");

  if (!fs.existsSync(filePath)) {
    throw new Error(`Input JSON file not found at: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  let rawData;
  try {
    rawData = JSON.parse(fileContent);
  } catch (err) {
    throw new Error(`Failed to parse JSON file: ${err.message}`);
  }

  const items = normalizePayload(rawData);
  if (!items.length) {
    console.warn("⚠️ No interview questions found in the JSON file.");
    return;
  }

  console.log(`📊 Found ${items.length} question(s) to process.\n`);

  if (validateOnly) {
    console.log("🔍 Running offline schema and syntax validation...");
    let validCount = 0;
    const errors = [];

    items.forEach((item, idx) => {
      const issues = [];
      if (!item.question || !item.question.trim()) issues.push("Missing question text");
      if (!item.answer && !item.explanation) issues.push("Missing answer/explanation");
      if (!item.courseSlug && !item.categorySlug) issues.push("Missing courseSlug or categorySlug");
      if (item.difficulty && !["easy", "medium", "hard"].includes(item.difficulty.toLowerCase())) {
        issues.push(`Invalid difficulty: "${item.difficulty}" (must be easy, medium, or hard)`);
      }
      if (
        item.questionType &&
        !["conceptual", "coding", "behavioral", "scenario", "debugging"].includes(item.questionType.toLowerCase())
      ) {
        issues.push(`Invalid questionType: "${item.questionType}"`);
      }

      if (issues.length > 0) {
        errors.push({ index: idx + 1, question: item.question || "(unnamed)", issues });
      } else {
        validCount++;
      }
    });

    console.log(`✅ Valid Questions: ${validCount}/${items.length}`);
    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} item(s) with validation issues:`);
      errors.forEach((e) => console.log(`  - [#${e.index}] ${e.question}: ${e.issues.join(", ")}`));
    } else {
      console.log("🎉 All questions passed offline schema validation!");
    }
    return;
  }

  await connectDB();

  const stats = {
    total: items.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const indexStr = `[#${i + 1}]`;

    try {
      if (!item.question || !item.question.trim()) {
        throw new Error("Question text is required.");
      }

      const answer = item.answer || item.explanation || "";
      if (!answer.trim()) {
        throw new Error("Answer is required for interview questions.");
      }

      // 1. Resolve Course
      let courseDoc = null;
      if (item.courseSlug) {
        courseDoc = await getCourseBySlug(item.courseSlug);
        if (!courseDoc) {
          throw new Error(`Course with slug "${item.courseSlug}" not found in database.`);
        }
      }

      // 2. Resolve Category
      let categoryDoc = null;
      if (item.categorySlug) {
        categoryDoc = await getCategoryBySlug(
          item.categorySlug,
          courseDoc ? courseDoc._id : null,
          autoCreateCategory,
          courseDoc,
        );
        if (!categoryDoc) {
          throw new Error(
            `Category with slug "${item.categorySlug}" not found in database (use --create-category to auto-create).`
          );
        }
      }

      if (!courseDoc && !categoryDoc) {
        throw new Error("At least one of courseSlug or categorySlug is required for an interview question.");
      }

      // 3. Prepare fields
      const questionSlug = slugify(item.slug || item.question);
      if (!questionSlug) {
        throw new Error("Could not generate valid slug for question.");
      }

      const tags = parseList(item.tags).map((t) => t.toLowerCase());
      const keywords = parseList(item.keywords);
      const followUps = parseList(item.followUps);

      const canonicalUrl = computeCanonicalUrl(
        courseDoc?.slug,
        categoryDoc?.slug,
        questionSlug,
        item.canonicalUrl,
      );

      const questionData = {
        type: "interview",
        course: courseDoc ? courseDoc._id : null,
        category: categoryDoc ? categoryDoc._id : null,
        question: item.question.trim(),
        slug: questionSlug,
        answer: answer.trim(),
        difficulty: ["easy", "medium", "hard"].includes(item.difficulty?.toLowerCase())
          ? item.difficulty.toLowerCase()
          : "medium",
        questionType: [
          "conceptual",
          "coding",
          "behavioral",
          "scenario",
          "debugging",
        ].includes(item.questionType?.toLowerCase())
          ? item.questionType.toLowerCase()
          : "conceptual",
        tags,
        codeExample: item.codeExample || "",
        expectedOutput: item.expectedOutput || "",
        followUps,
        seoTitle: item.seoTitle ? String(item.seoTitle).trim().slice(0, 70) : "",
        seoDescription: item.seoDescription ? String(item.seoDescription).trim().slice(0, 170) : "",
        keywords,
        canonicalUrl,
        ogImage: item.ogImage || "",
        order: typeof item.order === "number" ? item.order : i + 1,
        status: item.status === "draft" ? "draft" : "published",
      };

      // 4. Check for existing question
      const query = {
        type: "interview",
        slug: questionSlug,
        ...(courseDoc ? { course: courseDoc._id } : {}),
      };

      const existingQuestion = await Question.findOne(query);

      if (existingQuestion) {
        if (skipDuplicates) {
          console.log(`⏩ ${indexStr} Skipped (already exists): "${item.question.slice(0, 50)}..."`);
          stats.skipped++;
          continue;
        }

        if (isDryRun) {
          console.log(`🔍 [DRY-RUN] Would UPDATE existing question: "${item.question.slice(0, 50)}..." (slug: ${questionSlug})`);
          stats.updated++;
        } else {
          Object.assign(existingQuestion, questionData);
          await existingQuestion.save();
          console.log(`🔄 ${indexStr} Updated: "${item.question.slice(0, 50)}..." (slug: ${questionSlug})`);
          stats.updated++;
        }
      } else {
        if (isDryRun) {
          console.log(`🔍 [DRY-RUN] Would INSERT new question: "${item.question.slice(0, 50)}..." (slug: ${questionSlug})`);
          stats.inserted++;
        } else {
          await Question.create(questionData);
          console.log(`✅ ${indexStr} Inserted: "${item.question.slice(0, 50)}..." (slug: ${questionSlug})`);
          stats.inserted++;
        }
      }
    } catch (err) {
      stats.failed++;
      stats.errors.push({
        index: i + 1,
        question: item?.question || "(unknown)",
        error: err.message,
      });
      console.error(`❌ ${indexStr} Failed: "${item?.question || 'Unknown'}" -> ${err.message}`);
    }
  }

  console.log("\n=================================================");
  console.log("📈 Seeding Summary:");
  console.log(`   Total Read:    ${stats.total}`);
  console.log(`   Inserted:      ${stats.inserted}`);
  console.log(`   Updated:       ${stats.updated}`);
  console.log(`   Skipped:       ${stats.skipped}`);
  console.log(`   Failed/Errors: ${stats.failed}`);
  console.log("=================================================");

  if (stats.errors.length > 0) {
    console.log("\n⚠️ Error Details:");
    stats.errors.forEach((e) => {
      console.log(` - Item #${e.index}: [${e.question.slice(0, 40)}] => ${e.error}`);
    });
  }

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from database.");
}

// Command-line execution support
const args = process.argv.slice(2);
const defaultFilePath = path.resolve(__dirname, "./data/sample_interview_questions.json");

let customFilePath = "";
let isDryRun = false;
let skipDuplicates = false;
let autoCreateCategory = false;
let validateOnly = false;

for (const arg of args) {
  if (arg === "--dry-run") isDryRun = true;
  else if (arg === "--validate-only") validateOnly = true;
  else if (arg === "--skip-duplicates") skipDuplicates = true;
  else if (arg === "--create-category") autoCreateCategory = true;
  else if (arg.startsWith("--file=")) customFilePath = arg.replace("--file=", "").trim();
  else if (!arg.startsWith("--")) customFilePath = arg.trim();
}

const targetFilePath = customFilePath
  ? path.isAbsolute(customFilePath)
    ? customFilePath
    : path.resolve(process.cwd(), customFilePath)
  : defaultFilePath;

seedInterviewQuestions({
  filePath: targetFilePath,
  isDryRun,
  skipDuplicates,
  autoCreateCategory,
  validateOnly,
}).catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
