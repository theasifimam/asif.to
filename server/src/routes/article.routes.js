import { Router } from "express";
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  getArticleBySlug,
} from "../controllers/article.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireAnyPermission, requirePermission } from "../utils/permissions.js";
import {
  compressArticleImage,
  uploadArticleImage,
} from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes
router.get("/", getArticles);
router.get("/:id", getArticleById);
router.get("/slug/:slug", getArticleBySlug);

// Protected editor/admin routes
router.post(
  "/",
  protect,
  requirePermission("articles.create"),
  uploadArticleImage.single("image"),
  compressArticleImage,
  createArticle,
);

router.patch(
  "/:id",
  protect,
  requireAnyPermission("articles.edit_own", "articles.edit_all"),
  uploadArticleImage.single("image"),
  compressArticleImage,
  updateArticle,
);

router.patch(
  "/:id/publish",
  protect,
  requirePermission("articles.publish"),
  publishArticle,
);

router.delete(
  "/:id",
  protect,
  requirePermission("articles.delete"),
  deleteArticle,
);

export default router;
