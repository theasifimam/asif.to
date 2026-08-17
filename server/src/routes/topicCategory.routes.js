import { Router } from "express";
import {
  getTopicCategories,
  getTopicCategory,
  createTopicCategory,
  updateTopicCategory,
  deleteTopicCategory,
  reorderTopicCategories,
  listPublicInterviewCategories,
  getPublicInterviewCategory,
} from "../controllers/courseTopic.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();
const canView = [protect, requirePermission("topics.view")];
const canManage = [protect, requirePermission("topics.manage")];

router.get("/public", listPublicInterviewCategories);
router.get("/public/:categorySlug", getPublicInterviewCategory);
router.get("/public/:courseSlug/:categorySlug", getPublicInterviewCategory);
router.get("/", ...canView, getTopicCategories);
router.patch("/reorder", ...canManage, reorderTopicCategories);
router.get("/:id", ...canView, getTopicCategory);
router.post("/", ...canManage, createTopicCategory);
router.patch("/:id", ...canManage, updateTopicCategory);
router.delete("/:id", ...canManage, deleteTopicCategory);

export default router;
