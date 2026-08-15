import { Router } from "express";
import {
  listPublicInterviewQuestions,
  getPublicInterviewQuestion,
  listInterviewQuestions,
  getInterviewQuestion,
  createInterviewQuestion,
  updateInterviewQuestion,
  deleteInterviewQuestion,
} from "../controllers/interviewQuestion.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();
const canView = [protect, requirePermission("interview_questions.view")];
const canManage = [protect, requirePermission("interview_questions.manage")];

router.get("/public/:courseSlug", listPublicInterviewQuestions);
router.get("/public/:courseSlug/:questionSlug", getPublicInterviewQuestion);
router.get("/", ...canView, listInterviewQuestions);
router.get("/:id", ...canView, getInterviewQuestion);
router.post("/", ...canManage, createInterviewQuestion);
router.patch("/:id", ...canManage, updateInterviewQuestion);
router.delete("/:id", ...canManage, deleteInterviewQuestion);

export default router;
