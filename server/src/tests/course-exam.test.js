import test from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.js";
import { normalizeExamQuestionText } from "../controllers/quiz.controller.js";

test("course exams normalize duplicate question text consistently", () => {
  assert.equal(
    normalizeExamQuestionText("  Which   hook stores state?  "),
    normalizeExamQuestionText("which hook stores state?"),
  );
});

test("final exam attempts remember the questions that were served", () => {
  const questionIdsPath = User.schema.path("quizAttempts").schema.path("questionIds");
  assert.ok(questionIdsPath);
  assert.equal(questionIdsPath.instance, "Array");

  const user = new User({
    fullName: "Exam Learner",
    username: "exam-learner",
    email: "exam@example.com",
    quizAttempts: [
      {
        courseId: "507f1f77bcf86cd799439011",
        kind: "final_exam",
        score: 1,
        total: 1,
        percentage: 100,
        questionIds: ["507f191e810c19729de860ea"],
      },
    ],
  });
  assert.equal(
    String(user.quizAttempts[0].questionIds[0]),
    "507f191e810c19729de860ea",
  );
});
