import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import Course from "../models/Course.js";
import QuizQuestion from "../models/QuizQuestion.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const examDataPath = path.resolve(
  __dirname,
  "../../../apps/web/lib/reactjsExamData.js",
);

async function seedReactExam() {
  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI is not defined in server/.env");
  await mongoose.connect(process.env.MONGO_URI);

  const { REACTJS_EXAM_QUESTIONS } = await import(
    pathToFileURL(examDataPath).href
  );
  const course = await Course.findOne({
    $or: [{ techId: "reactjs" }, { slug: "reactjs" }],
  });
  if (!course)
    throw new Error(
      "React.js course was not found. Create the course before seeding its exam.",
    );

  course.examEnabled = true;
  course.examSettings = {
    questionCount: 20,
    durationMinutes: 30,
    passingPercentage: 70,
    cooldownHours: 24,
  };
  await course.save();

  const operations = REACTJS_EXAM_QUESTIONS.map((item) => ({
    updateOne: {
      filter: { question: item.question },
      update: {
        $set: {
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
    `React exam seeded: ${REACTJS_EXAM_QUESTIONS.length} questions processed.`,
  );
  console.log(
    `Inserted: ${result.upsertedCount}; updated: ${result.modifiedCount}.`,
  );
  await mongoose.disconnect();
}

seedReactExam().catch(async (error) => {
  console.error("React exam seed failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
