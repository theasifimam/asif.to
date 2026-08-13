import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import Course from "../models/Course.js";
import QuizQuestion from "../models/Question.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const examDataPath = path.resolve(__dirname, "./cssExamData.js");

async function seedCssExam() {
  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI is not defined in server/.env");
  await mongoose.connect(process.env.MONGO_URI);

  const { CSS_EXAM_QUESTIONS } = await import(pathToFileURL(examDataPath).href);
  const course = await Course.findOne({
    $or: [{ techId: "mongodb" }, { slug: "mongodb" }],
  });
  if (!course)
    throw new Error(
      "mongodb course was not found. Create the course before seeding its exam.",
    );

  course.examEnabled = true;
  course.examSettings = {
    questionCount: 20,
    durationMinutes: 30,
    passingPercentage: 70,
    cooldownHours: 24,
  };
  await course.save();

  const operations = CSS_EXAM_QUESTIONS.map((item) => ({
    updateOne: {
      filter: { type: "quiz", question: item.question },
      update: {
        $set: {
          type: "quiz",
          courses: [course._id],
          options: item.options,
          correctIndex: item.correctIndex,
          explanation: item.explanation || "",
          difficulty: item.difficulty || "medium",
          status: "published",
        },
      },
      upsert: true,
    },
  }));

  const result = await QuizQuestion.bulkWrite(operations);
  console.log(
    `mongodb exam seeded: ${CSS_EXAM_QUESTIONS.length} questions processed.`,
  );
  console.log(
    `Inserted: ${result.upsertedCount}; updated: ${result.modifiedCount}.`,
  );
  await mongoose.disconnect();
}

seedCssExam().catch(async (error) => {
  console.error("mongodb exam seed failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
