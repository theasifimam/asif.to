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
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.get("/", getQuizQuestions);
router.get("/exam/:courseSlug", getCourseExam);
router.post("/exam/:courseSlug/submit", protect, submitCourseExam);
router.post("/practice/submit", protect, submitPracticeQuiz);

// Admin
router.get(
  "/admin/all",
  protect,
  authorize("admin", "editor"),
  getQuizQuestionsAdmin,
);
router.get("/admin/:id", protect, authorize("admin", "editor"), getQuestionAdmin);
router.post("/", protect, authorize("admin", "editor"), createQuizQuestion);
router.patch("/:id", protect, authorize("admin", "editor"), updateQuizQuestion);
router.delete("/:id", protect, authorize("admin"), deleteQuizQuestion);

export default router;
