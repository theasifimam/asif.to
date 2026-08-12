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
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const canManage = [protect, authorize("admin", "editor")];

router.get("/public/:courseSlug", listPublicInterviewQuestions);
router.get("/public/:courseSlug/:questionSlug", getPublicInterviewQuestion);
router.get("/", ...canManage, listInterviewQuestions);
router.get("/:id", ...canManage, getInterviewQuestion);
router.post("/", ...canManage, createInterviewQuestion);
router.patch("/:id", ...canManage, updateInterviewQuestion);
router.delete("/:id", ...canManage, deleteInterviewQuestion);

export default router;
