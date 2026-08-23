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

async function exportCourseQuizData() {
  const courseSlug = process.argv[2];

  if (!courseSlug || courseSlug.startsWith("--")) {
    console.error("❌ Error: Course slug is required.");
    console.log("Usage: node src/scripts/export-course-quiz-data.js <course-slug>");
    console.log("Example: node src/scripts/export-course-quiz-data.js javascript");
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB...`);
    await connectDB();

    console.log(`Fetching course with slug: "${courseSlug}"...`);
    const course = await Course.findOne({
      slug: { $regex: new RegExp(`^${courseSlug}$`, "i") },
    }).lean();

    if (!course) {
      console.error(`❌ Error: Course with slug "${courseSlug}" not found.`);
      process.exit(1);
    }

    const courseId = course._id;
    console.log(`Found Course: "${course.title}" (ID: ${courseId})`);

    // Fetch Categories
    console.log(`Fetching categories for course...`);
    const categories = await TopicCategory.find({ course: courseId })
      .sort({ order: 1 })
      .lean();

    // Fetch Chapters
    console.log(`Fetching chapters for course...`);
    const chapters = await Chapter.find({ course: courseId })
      .sort({ order: 1 })
      .lean();

    // Fetch Quiz Questions
    console.log(`Fetching quiz questions for course...`);
    const questions = await Question.find({
      type: "quiz",
      $or: [
        { courses: courseId },
        { course: courseId },
        { "learningMappings.course": courseId },
      ],
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const outputData = {
      course: {
        id: course._id,
        title: course.title,
        slug: course.slug,
      },
      categories: categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
      })),
      chapters: chapters.map((chap) => ({
        id: chap._id,
        title: chap.title,
        slug: chap.slug,
        categoryId: chap.category || null,
      })),
      questions: questions.map((q) => ({
        id: q._id,
        question: q.question,
      })),
    };

    // Ensure output directory exists
    const exportsDir = path.resolve(__dirname, "../../exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const outputFile = path.join(exportsDir, `${course.slug}-quiz-data.json`);
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), "utf-8");

    console.log("\n========================================");
    console.log(`✅ EXPORT SUCCESSFUL!`);
    console.log(`- Course: ${course.title} (${course.slug})`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Chapters: ${chapters.length}`);
    console.log(`- Quiz Questions: ${questions.length}`);
    console.log(`- Overwritten file: ${outputFile}`);
    console.log("========================================\n");

    if (process.argv.includes("--stdout")) {
      console.log(JSON.stringify(outputData, null, 2));
    }
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

exportCourseQuizData();
