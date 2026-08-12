import { Router } from "express";
import {
  getTopicCategories,
  createTopicCategory,
  updateTopicCategory,
  deleteTopicCategory,
} from "../controllers/courseTopic.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const canManage = [protect, authorize("admin", "editor")];

router.get("/", ...canManage, getTopicCategories);
router.post("/", ...canManage, createTopicCategory);
router.patch("/:id", ...canManage, updateTopicCategory);
router.delete("/:id", ...canManage, deleteTopicCategory);

export default router;
