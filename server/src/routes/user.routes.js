import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  getMyBookmarks,
  toggleBookmark,
  toggleSavedItem,
  getMySavedItems,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

import { uploadAvatar } from "../middlewares/upload.middleware.js";

const router = Router();

// ─── Self-service routes (any authenticated user) ───────────────────────────
router.get("/me/profile", protect, getMyProfile);
router.patch("/me/update", protect, uploadAvatar.single("avatar"), updateMyProfile);
router.get("/me/bookmarks", protect, getMyBookmarks);
router.post("/me/bookmarks/toggle/:articleId", protect, toggleBookmark);
router.post("/me/saves/toggle", protect, toggleSavedItem);
router.get("/me/saves", protect, getMySavedItems);

// ─── Public routes ──────────────────────────────────────────────────────────
router.get("/public/:username", getPublicProfile);

// ─── Admin-only routes ───────────────────────────────────────────────────────
router.get("/", protect, authorize("admin", "editor"), getUsers);
router.post("/", protect, authorize("admin"), createUser);

router.get("/:id", protect, authorize("admin", "editor"), getUserById);
router.patch("/:id", protect, authorize("admin"), uploadAvatar.single("avatar"), updateUser);
router.patch("/:id/role", protect, authorize("admin"), updateUserRole);
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.patch("/:id/reset-password", protect, authorize("admin"), resetUserPassword);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;