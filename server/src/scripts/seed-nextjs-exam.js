import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import path from "path";
import Course from "../models/Course.js";
import QuizQuestion from "../models/Question.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const questionsPath = path.resolve(
  __dirname,
  "../../../media/nextjsquestions.json",
);

const normalizeTechId = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

function validateQuestions(questions) {
  if (!Array.isArray(questions) || !questions.length) {
    throw new Error("Next.js question data must be a non-empty array.");
  }

  const seen = new Set();
  questions.forEach((item, index) => {
    if (!item.question || seen.has(item.question)) {
      throw new Error(`Question ${index + 1} is empty or duplicated.`);
    }
    if (!Array.isArray(item.options) || item.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly four options.`);
    }
    if (
      !Number.isInteger(item.correctIndex) ||
      item.correctIndex < 0 ||
      item.correctIndex > 3
    ) {
      throw new Error(`Question ${index + 1} has an invalid correctIndex.`);
    }
    if (!["easy", "medium", "hard"].includes(item.difficulty || "medium")) {
      throw new Error(`Question ${index + 1} has an invalid difficulty.`);
    }
    seen.add(item.question);
  });
}

async function migrateLegacyQuestionCourses() {
  const courses = await Course.find().select("_id techId").lean();
  const courseIds = new Set(courses.map((course) => String(course._id)));
  const courseByTechId = new Map(
    courses.map((course) => [normalizeTechId(course.techId), course._id]),
  );
  const collection = mongoose.connection.collection("quizquestions");
  const questions = await collection.find({}).toArray();
  const unresolved = [];
  const operations = [];

  for (const question of questions) {
    const resolvedIds = new Set();
    const currentCourses = Array.isArray(question.courses)
      ? question.courses
      : [];

    for (const courseId of currentCourses) {
      if (courseIds.has(String(courseId))) resolvedIds.add(String(courseId));
    }
    if (question.course && courseIds.has(String(question.course))) {
      resolvedIds.add(String(question.course));
    }

    const legacyTechIds = [
      question.techId,
      ...(Array.isArray(question.techIds) ? question.techIds : []),
    ];
    for (const techId of legacyTechIds) {
      const courseId = courseByTechId.get(normalizeTechId(techId));
      if (courseId) resolvedIds.add(String(courseId));
    }

    if (!resolvedIds.size) {
      unresolved.push(`${question._id}: ${question.question}`);
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: question._id },
        update: {
          $set: {
            courses: [...resolvedIds].map(
              (courseId) => new mongoose.Types.ObjectId(courseId),
            ),
          },
          $unset: { course: "", techId: "", techIds: "" },
        },
      },
    });
  }

  if (unresolved.length) {
    throw new Error(
      `Cannot migrate ${unresolved.length} quiz question(s) without a valid course:\n${unresolved.join("\n")}`,
    );
  }

  const result = operations.length
    ? await collection.bulkWrite(operations)
    : { matchedCount: 0, modifiedCount: 0 };

  const indexes = await collection.indexes();
  const obsoleteIndexes = ["techId_1_status_1", "techIds_1_status_1"];
  for (const indexName of obsoleteIndexes) {
    if (indexes.some((index) => index.name === indexName)) {
      await collection.dropIndex(indexName);
    }
  }

  return result;
}

async function seedNextjsExam() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const questions = JSON.parse(await fs.readFile(questionsPath, "utf8"));
  validateQuestions(questions);

  const course = await Course.findOne({
    $or: [{ techId: "nextjs" }, { slug: "nextjs" }],
  });
  if (!course) {
    throw new Error(
      "Next.js course was not found. Create the course before seeding its exam.",
    );
  }

  const migration = await migrateLegacyQuestionCourses();

  course.examEnabled = true;
  course.examSettings = {
    questionCount: 20,
    durationMinutes: 30,
    passingPercentage: 70,
    cooldownHours: 24,
  };
  await course.save();

  const operations = questions.map((item) => ({
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
          status: item.status || "published",
        },
        $unset: { course: "", techId: "", techIds: "" },
      },
      upsert: true,
    },
  }));
  const result = await QuizQuestion.bulkWrite(operations);

  console.log(
    `Legacy migration matched ${migration.matchedCount}; modified ${migration.modifiedCount}.`,
  );
  console.log(`Next.js exam processed ${questions.length} questions.`);
  console.log(
    `Inserted: ${result.upsertedCount}; updated: ${result.modifiedCount}.`,
  );
}

seedNextjsExam()
  .catch((error) => {
    console.error("Next.js exam seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
