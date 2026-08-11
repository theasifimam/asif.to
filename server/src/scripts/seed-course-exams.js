import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import path from "path";
import Course from "../models/Course.js";
import QuizQuestion from "../models/QuizQuestion.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const EXAMS = {
  javascript: {
    label: "JavaScript",
    file: "javascript-questions.json",
  },
  nodejs: {
    label: "Node.js",
    file: "nodejs-questions.json",
  },
  html: {
    label: "HTML",
    file: "html-questions.json",
  },
};

function validateQuestions(questions, label) {
  if (!Array.isArray(questions) || !questions.length) {
    throw new Error(`${label} question data must be a non-empty array.`);
  }

  const seen = new Set();
  questions.forEach((item, index) => {
    const question = String(item.question || "").trim();
    if (!question || seen.has(question)) {
      throw new Error(`${label} question ${index + 1} is empty or duplicated.`);
    }
    if (!Array.isArray(item.options) || item.options.length !== 4) {
      throw new Error(
        `${label} question ${index + 1} must have exactly four options.`,
      );
    }
    if (
      !Number.isInteger(item.correctIndex) ||
      item.correctIndex < 0 ||
      item.correctIndex > 3
    ) {
      throw new Error(
        `${label} question ${index + 1} has an invalid correctIndex.`,
      );
    }
    if (!["easy", "medium", "hard"].includes(item.difficulty || "medium")) {
      throw new Error(
        `${label} question ${index + 1} has an invalid difficulty.`,
      );
    }
    seen.add(question);
  });
}

async function seedExam(techId) {
  const config = EXAMS[techId];
  const questionsPath = path.resolve(
    __dirname,
    `../../../media/${config.file}`,
  );
  const questions = JSON.parse(await fs.readFile(questionsPath, "utf8"));
  validateQuestions(questions, config.label);

  const course = await Course.findOne({
    $or: [{ techId }, { slug: techId }],
  });
  if (!course) {
    throw new Error(
      `${config.label} course was not found. Create the course before seeding its exam.`,
    );
  }

  const operations = questions.map((item) => ({
    updateOne: {
      filter: { question: item.question, courses: course._id },
      update: {
        $set: {
          courses: [course._id],
          options: item.options,
          correctIndex: item.correctIndex,
          explanation: item.explanation || "",
          difficulty: item.difficulty || "medium",
          status: item.status || "published",
        },
        $unset: { course: "", techId: "", techIds: "" },
      },
      upsert: true,
    },
  }));
  const result = await QuizQuestion.bulkWrite(operations);

  course.examEnabled = true;
  course.examSettings = {
    questionCount: 20,
    durationMinutes: 30,
    passingPercentage: 70,
    cooldownHours: 24,
  };
  await course.save();

  console.log(`${config.label} exam processed ${questions.length} questions.`);
  console.log(
    `Inserted: ${result.upsertedCount}; updated: ${result.modifiedCount}.`,
  );
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in server/.env");
  }

  const requested = process.argv.slice(2);
  const techIds = requested.length ? requested : Object.keys(EXAMS);
  const unsupported = techIds.filter((techId) => !EXAMS[techId]);
  if (unsupported.length) {
    throw new Error(
      `Unknown exam course(s): ${unsupported.join(", ")}. Expected: ${Object.keys(EXAMS).join(", ")}.`,
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  for (const techId of techIds) {
    await seedExam(techId);
  }
}

run()
  .catch((error) => {
    console.error("Course exam seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
