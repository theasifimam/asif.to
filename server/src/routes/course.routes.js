import { Router } from "express";
import {
  getCourses,
  getCourseBySlug,
  getChapterBySlug,
  getCoursesAdmin,
  getCourseByIdAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
  trackChapterView,
  getCourseAnalytics,
} from "../controllers/course.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getCourses);
router.get("/admin/all", protect, authorize("admin", "editor"), getCoursesAdmin);
// Analytics — must come before /:slug to avoid conflicts
router.get("/analytics/overview", protect, authorize("admin", "editor"), getCourseAnalytics);
router.get("/:slug", getCourseBySlug);
router.get("/:slug/chapters/:chapterSlug", getChapterBySlug);

// ── Public — View Tracking (fire-and-forget, no auth needed) ─────────────────
router.post("/chapters/:id/view", trackChapterView);

// ── Admin — Course CRUD ───────────────────────────────────────────────────────
router.get("/admin/:id", protect, authorize("admin", "editor"), getCourseByIdAdmin);
router.post("/", protect, authorize("admin", "editor"), createCourse);
router.patch("/:id", protect, authorize("admin", "editor"), updateCourse);
router.delete("/:id", protect, authorize("admin"), deleteCourse);

// ── Admin — Chapter CRUD ──────────────────────────────────────────────────────
router.get("/:courseId/chapters", protect, authorize("admin", "editor"), getChapters);
router.post("/:courseId/chapters", protect, authorize("admin", "editor"), createChapter);
router.patch("/chapters/reorder", protect, authorize("admin", "editor"), reorderChapters);
router.patch("/chapters/:id", protect, authorize("admin", "editor"), updateChapter);
router.delete("/chapters/:id", protect, authorize("admin", "editor"), deleteChapter);

export default router;
