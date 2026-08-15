import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

import Course from "../models/Course.js";
import TopicCategory from "../models/TopicCategory.js";
import Question from "../models/Question.js";

async function migrate() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGO_URI or MONGODB_URI is not defined in environment.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB for Interview Category migration.");

  const questions = await Question.find({ type: "interview" });
  console.log(`Found ${questions.length} interview questions.`);

  let updatedCount = 0;
  let categoryMap = new Map();

  for (const question of questions) {
    if (question.category) {
      console.log(`Question "${question.question}" already has category.`);
      continue;
    }

    let courseId = question.course;
    if (!courseId && question.courses?.length) {
      courseId = question.courses[0];
    }

    if (!courseId) {
      console.warn(`Question ID ${question._id} ("${question.question}") has no course or category.`);
      continue;
    }

    const courseKey = String(courseId);
    let category = categoryMap.get(courseKey);

    if (!category) {
      const course = await Course.findById(courseId);
      if (!course) {
        console.warn(`Course ${courseId} not found for question ${question._id}.`);
        continue;
      }

      // Check if a category with slug matching course.techId or course.slug already exists
      const targetSlug = (course.techId || course.slug).toLowerCase().trim();
      category = await TopicCategory.findOne({
        $or: [{ slug: targetSlug }, { course: course._id }],
      });

      if (!category) {
        const seoTitleText = (course.interviewSeoTitle || `${course.title} Interview Questions and Answers`).slice(0, 70);
        const seoDescText = (course.interviewSeoDescription || `Prepare for ${course.title} interviews with curated questions and detailed answers.`).slice(0, 170);

        category = await TopicCategory.create({
          name: course.techId ? `${course.techId.toUpperCase()}` : course.title,
          slug: targetSlug,
          description: (course.subtitle || `Interview questions and answers for ${course.title}`).slice(0, 500),
          seoTitle: seoTitleText,
          seoDescription: seoDescText,
          keywords: course.interviewKeywords || [],
          canonicalUrl: course.interviewCanonicalUrl || "",
          ogImage: course.interviewOgImage || "",
          course: course._id,
          status: "published",
        });
        console.log(`Created TopicCategory "${category.name}" (slug: ${category.slug})`);
      }

      categoryMap.set(courseKey, category);
    }

    question.category = category._id;
    await question.save();
    updatedCount++;
  }

  console.log(`Successfully migrated ${updatedCount} interview questions to categories.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
