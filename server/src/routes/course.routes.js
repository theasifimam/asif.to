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
import {
  approveCourseDeletion,
  beginCourseDeletion,
  blockDirectCourseDeletion,
  getCourseDeletionImpact,
  getCourseDeletionRequest,
  rejectCourseDeletion,
  sendCourseDeletionApproverOtp,
  verifyCourseDeletionInitiatorOtp,
} from "../controllers/courseDeletion.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/", getCourses);
router.get(
  "/admin/all",
  protect,
  requirePermission("courses.view"),
  getCoursesAdmin,
);
// Static prefixes must come before /:slug to avoid conflicts.
router.get(
  "/analytics/overview",
  protect,
  requirePermission("courses.view"),
  getCourseAnalytics,
);
router.get("/slug/:slug", getCourseBySlug);
router.get("/slug/:slug/chapters/:chapterSlug", getChapterBySlug);
router.get("/:slug/chapters/:chapterSlug", getChapterBySlug);
router.get("/:slug", getCourseBySlug);

// ── Public — View Tracking (fire-and-forget, no auth needed) ─────────────────
router.post("/chapters/:id/view", trackChapterView);

// ── Admin — Course CRUD ───────────────────────────────────────────────────────
router.get(
  "/admin/:id",
  protect,
  requirePermission("courses.view"),
  getCourseByIdAdmin,
);
router.post("/", protect, requirePermission("courses.manage"), createCourse);
router.patch("/:id", protect, requirePermission("courses.manage"), updateCourse);

router.get(
  "/admin/:id/deletion-impact",
  protect,
  requirePermission("courses.manage"),
  getCourseDeletionImpact,
);
router.post(
  "/:id/deletion-requests",
  protect,
  requirePermission("courses.manage"),
  beginCourseDeletion,
);
router.get(
  "/deletion-requests/:requestId",
  protect,
  requirePermission("courses.manage"),
  getCourseDeletionRequest,
);
router.post(
  "/deletion-requests/:requestId/verify-initiator",
  protect,
  requirePermission("courses.manage"),
  verifyCourseDeletionInitiatorOtp,
);
router.post(
  "/deletion-requests/:requestId/approval-otp",
  protect,
  requirePermission("courses.manage"),
  sendCourseDeletionApproverOtp,
);
router.post(
  "/deletion-requests/:requestId/approve",
  protect,
  requirePermission("courses.manage"),
  approveCourseDeletion,
);
router.post(
  "/deletion-requests/:requestId/reject",
  protect,
  requirePermission("courses.manage"),
  rejectCourseDeletion,
);

// Direct deletion is deliberately blocked. The final course row is deleted only
// by approveCourseDeletion after two different admin accounts verify email OTPs.
router.delete(
  "/:id",
  protect,
  requirePermission("courses.manage"),
  blockDirectCourseDeletion,
);

// ── Admin — Chapter CRUD ──────────────────────────────────────────────────────
router.get(
  "/:courseId/chapters",
  protect,
  requirePermission("courses.view"),
  getChapters,
);
router.post(
  "/:courseId/chapters",
  protect,
  requirePermission("courses.manage"),
  createChapter,
);
router.patch(
  "/chapters/reorder",
  protect,
  requirePermission("courses.manage"),
  reorderChapters,
);
router.patch(
  "/chapters/:id",
  protect,
  requirePermission("courses.manage"),
  updateChapter,
);
router.delete(
  "/chapters/:id",
  protect,
  requirePermission("courses.manage"),
  deleteChapter,
);

export default router;
