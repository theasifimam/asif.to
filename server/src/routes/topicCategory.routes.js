import { Router } from "express";
import {
  getTopicCategories,
  createTopicCategory,
  updateTopicCategory,
  deleteTopicCategory,
} from "../controllers/courseTopic.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();
const canView = [protect, requirePermission("topics.view")];
const canManage = [protect, requirePermission("topics.manage")];

router.get("/", ...canView, getTopicCategories);
router.post("/", ...canManage, createTopicCategory);
router.patch("/:id", ...canManage, updateTopicCategory);
router.delete("/:id", ...canManage, deleteTopicCategory);

export default router;
