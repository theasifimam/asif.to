import { Router } from "express";
import {
  getQuizQuestions,
  getCourseExam,
  submitCourseExam,
  submitPracticeQuiz,
  getQuizQuestionsAdmin,
  getQuestionAdmin,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "../controllers/quiz.controller.js";
import { optionalProtect, protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

// Public
router.get("/", getQuizQuestions);
router.get("/exam/:courseSlug", optionalProtect, getCourseExam);
router.post("/exam/:courseSlug/submit", protect, submitCourseExam);
router.post("/practice/submit", protect, submitPracticeQuiz);

// Admin
router.get(
  "/admin/all",
  protect,
  requirePermission("question_bank.view"),
  getQuizQuestionsAdmin,
);
router.get("/admin/:id", protect, requirePermission("question_bank.view"), getQuestionAdmin);
router.post("/", protect, requirePermission("question_bank.manage"), createQuizQuestion);
router.patch("/:id", protect, requirePermission("question_bank.manage"), updateQuizQuestion);
router.delete("/:id", protect, requirePermission("question_bank.manage"), deleteQuizQuestion);

export default router;
