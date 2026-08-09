import { Router } from "express";
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  getArticleBySlug } from
"../controllers/article.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { uploadArticleImage } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes
router.get("/", getArticles);
router.get("/:id", getArticleById);
router.get("/slug/:slug", getArticleBySlug);

// Protected editor/admin routes
router.post(
  "/",
  protect,
  authorize("admin", "editor", "author"),
  uploadArticleImage.single("image"),
  createArticle
);

router.patch(
  "/:id",
  protect,
  authorize("admin", "editor", "author"),
  uploadArticleImage.single("image"),
  updateArticle
);

router.patch(
  "/:id/publish",
  protect,
  authorize("admin", "editor", "author"),
  publishArticle
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "editor", "author"),
  deleteArticle
);

export default router;