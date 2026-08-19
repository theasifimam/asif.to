import { Router } from "express";
import {
  getSocialPosts,
  getSocialPostById,
  createSocialPost,
  updateSocialPost,
  duplicateSocialPost,
  deleteSocialPost,
} from "../controllers/socialPost.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

// All routes are protected and require content-creation permission
router.use(protect, requirePermission("articles.create"));

router.get("/", getSocialPosts);
router.get("/:id", getSocialPostById);
router.post("/", createSocialPost);
router.patch("/:id", updateSocialPost);
router.post("/:id/duplicate", duplicateSocialPost);
router.delete("/:id", deleteSocialPost);

export default router;
