import { Router } from "express";
import {
  getQuizQuestions,
  getQuizQuestionsAdmin,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
} from "../controllers/quiz.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.get("/", getQuizQuestions);

// Admin
router.get("/admin/all", protect, authorize("admin", "editor"), getQuizQuestionsAdmin);
router.post("/", protect, authorize("admin", "editor"), createQuizQuestion);
router.patch("/:id", protect, authorize("admin", "editor"), updateQuizQuestion);
router.delete("/:id", protect, authorize("admin"), deleteQuizQuestion);

export default router;
