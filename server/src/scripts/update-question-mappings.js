import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../configs/db.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import TopicCategory from "../models/TopicCategory.js";
import Question from "../models/Question.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function findCourse(identifier) {
  if (!identifier) return null;
  const str = String(identifier).trim();
  if (mongoose.isValidObjectId(str)) {
    const found = await Course.findById(str).lean();
    if (found) return found;
  }
  return await Course.findOne({
    $or: [
      { slug: str.toLowerCase() },
      { title: { $regex: new RegExp(`^${str}$`, "i") } },
    ],
  }).lean();
}

async function findCategory(identifier, courseId = null) {
  if (!identifier) return null;
  const str = String(identifier).trim();
  if (mongoose.isValidObjectId(str)) {
    const found = await TopicCategory.findById(str).lean();
    if (found) return found;
  }

  const query = {
    $or: [
      { slug: str.toLowerCase() },
      { name: { $regex: new RegExp(`^${str}$`, "i") } },
    ],
  };
  if (courseId) {
    query.course = courseId;
  }

  // Try scoped to course first if courseId provided
  let found = await TopicCategory.findOne(query).lean();
  if (!found && courseId) {
    delete query.course;
    found = await TopicCategory.findOne(query).lean();
  }
  return found;
}

async function findChapter(identifier, courseId = null) {
  if (!identifier) return null;
  const str = String(identifier).trim();
  if (mongoose.isValidObjectId(str)) {
    const found = await Chapter.findById(str).lean();
    if (found) return found;
  }

  const query = {
    $or: [
      { slug: str.toLowerCase() },
      { title: { $regex: new RegExp(`^${str}$`, "i") } },
    ],
  };
  if (courseId) {
    query.course = courseId;
  }

  // Try scoped to course first if courseId provided
  let found = await Chapter.findOne(query).lean();
  if (!found && courseId) {
    delete query.course;
    found = await Chapter.findOne(query).lean();
  }
  return found;
}

async function findQuestion(item) {
  const qId = item.questionId || item.id || item._id;

  if (qId && mongoose.isValidObjectId(String(qId).trim())) {
    const found = await Question.findById(String(qId).trim());
    if (found) return found;
  }

  if (item.slug) {
    const found = await Question.findOne({
      slug: String(item.slug).toLowerCase().trim(),
    });
    if (found) return found;
  }

  if (item.question) {
    const text = String(item.question).trim();
    const found = await Question.findOne({
      question: { $regex: new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (found) return found;
  }

  return null;
}

async function runMappingUpdate() {
  const filePathArg = process.argv[2];

  if (!filePathArg || filePathArg.startsWith("--")) {
    console.error("❌ Error: Path to JSON data file is required.");
    console.log("\nUsage:");
    console.log("  node src/scripts/update-question-mappings.js <path-to-json-file>");
    console.log("  npm run update:mappings -- <path-to-json-file>");
    console.log("\nExample:");
    console.log("  node src/scripts/update-question-mappings.js src/scripts/data/sample-question-mappings.json\n");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), filePathArg);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Error: JSON file not found at: ${resolvedPath}`);
    process.exit(1);
  }

  let rawContent;
  let items;
  try {
    rawContent = fs.readFileSync(resolvedPath, "utf-8");
    const parsed = JSON.parse(rawContent);
    items = Array.isArray(parsed) ? parsed : parsed.questions || parsed.updates || parsed.data || [];
  } catch (err) {
    console.error(`❌ Error parsing JSON file: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(items) || items.length === 0) {
    console.error("❌ Error: JSON file must contain an array of question mapping objects.");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB...`);
  await connectDB();

  console.log(`Processing ${items.length} question mapping updates...\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  const skippedReport = [];
  const updatedReport = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const indexLabel = `[Entry #${i + 1}]`;

    // 1. Match Question
    const questionDoc = await findQuestion(item);
    if (!questionDoc) {
      const identifier = item.questionId || item.id || item.slug || item.question || "Unknown";
      skippedCount++;
      skippedReport.push({
        entry: i + 1,
        identifier,
        reason: "Matching question not found in database",
      });
      console.log(`⚠️  ${indexLabel} SKIPPED: Question not found (${identifier})`);
      continue;
    }

    // 2. Identify Course if provided
    const rawCourse = item.courseId || item.courseSlug || item.courseTitle || item.course;
    let courseDoc = await findCourse(rawCourse);

    // If no course explicitly passed, fallback to existing course on question, category or chapter
    const rawCat = item.categoryId || item.categorySlug || item.categoryName || item.category;
    const rawChap = item.chapterId || item.chapterSlug || item.chapterTitle || item.chapter;

    if (!rawCat && !rawChap) {
      skippedCount++;
      skippedReport.push({
        entry: i + 1,
        identifier: questionDoc.question,
        reason: "No category or chapter specified in update data",
      });
      console.log(`⚠️  ${indexLabel} SKIPPED: No category or chapter provided for question "${questionDoc.question.substring(0, 40)}..."`);
      continue;
    }

    // 3. Match Category if specified
    let categoryDoc = null;
    if (rawCat) {
      categoryDoc = await findCategory(rawCat, courseDoc?._id);
      if (!categoryDoc) {
        skippedCount++;
        skippedReport.push({
          entry: i + 1,
          identifier: questionDoc.question,
          reason: `Category not found: "${rawCat}"`,
        });
        console.log(`⚠️  ${indexLabel} SKIPPED: Category "${rawCat}" not found in database`);
        continue;
      }
    }

    // 4. Match Chapter if specified
    let chapterDoc = null;
    if (rawChap) {
      chapterDoc = await findChapter(rawChap, courseDoc?._id);
      if (!chapterDoc) {
        skippedCount++;
        skippedReport.push({
          entry: i + 1,
          identifier: questionDoc.question,
          reason: `Chapter not found: "${rawChap}"`,
        });
        console.log(`⚠️  ${indexLabel} SKIPPED: Chapter "${rawChap}" not found in database`);
        continue;
      }
    }

    // Determine target course ID for mapping
    const targetCourseId =
      courseDoc?._id ||
      categoryDoc?.course ||
      chapterDoc?.course ||
      questionDoc.course ||
      (questionDoc.courses && questionDoc.courses[0]);

    // 5. Update Question Document
    try {
      if (questionDoc.type === "interview") {
        if (categoryDoc) {
          questionDoc.category = categoryDoc._id;
        }
        if (targetCourseId) {
          questionDoc.course = targetCourseId;
        }
      } else {
        // Quiz question
        if (categoryDoc) {
          questionDoc.category = categoryDoc._id;
        }

        if (targetCourseId) {
          // Add course to courses array if missing
          const existingCourseIds = (questionDoc.courses || []).map((c) => String(c));
          if (!existingCourseIds.includes(String(targetCourseId))) {
            questionDoc.courses = [...(questionDoc.courses || []), targetCourseId];
          }

          // Update or add learningMapping for this course
          const mappings = Array.isArray(questionDoc.learningMappings) ? questionDoc.learningMappings : [];
          const existingIdx = mappings.findIndex((m) => String(m.course) === String(targetCourseId));

          const newMapping = {
            course: targetCourseId,
            category: categoryDoc ? categoryDoc._id : (existingIdx >= 0 ? mappings[existingIdx].category : null),
            chapter: chapterDoc ? chapterDoc._id : (existingIdx >= 0 ? mappings[existingIdx].chapter : null),
            source: "manual",
            confidence: 100,
            mappedAt: new Date(),
          };

          if (existingIdx >= 0) {
            mappings[existingIdx] = { ...mappings[existingIdx].toObject?.() || mappings[existingIdx], ...newMapping };
          } else {
            mappings.push(newMapping);
          }

          questionDoc.learningMappings = mappings;
        }
      }

      await questionDoc.save({ validateBeforeSave: false });

      updatedCount++;
      const catName = categoryDoc ? categoryDoc.name : "Unchanged";
      const chapTitle = chapterDoc ? chapterDoc.title : "Unchanged";
      updatedReport.push({
        id: questionDoc._id,
        type: questionDoc.type,
        question: questionDoc.question,
        assignedCategory: catName,
        assignedChapter: chapTitle,
      });

      console.log(
        `✅ ${indexLabel} UPDATED [${questionDoc.type.toUpperCase()}] "${questionDoc.question.substring(0, 40)}..." -> Category: "${catName}", Chapter: "${chapTitle}"`
      );
    } catch (saveErr) {
      skippedCount++;
      skippedReport.push({
        entry: i + 1,
        identifier: questionDoc.question,
        reason: `Save error: ${saveErr.message}`,
      });
      console.log(`❌ ${indexLabel} ERROR saving question: ${saveErr.message}`);
    }
  }

  console.log("\n========================================");
  console.log("📊 QUESTION MAPPING UPDATE SUMMARY");
  console.log("========================================");
  console.log(`Total Entries Processed : ${items.length}`);
  console.log(`Successfully Updated    : ${updatedCount}`);
  console.log(`Skipped / Failed        : ${skippedCount}`);

  if (skippedReport.length > 0) {
    console.log("\n⚠️  SKIPPED ENTRIES DETAILS:");
    skippedReport.forEach((s) => {
      console.log(`  - Entry #${s.entry} ("${String(s.identifier).substring(0, 40)}..."): ${s.reason}`);
    });
  }

  console.log("========================================\n");

  await mongoose.disconnect();
}

runMappingUpdate();
