import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  getMyBookmarks,
  toggleBookmark,
  toggleSavedItem,
  getMySavedItems,
  updateAttemptVisibility,
  getCertificate,
  deactivateMyAccount,
  deleteMyAccount,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";
import {
  getPermissionMatrix,
  updatePermissionMatrix,
} from "../controllers/rolePermission.controller.js";
import {
  addUserNote,
  cancelInvitation,
  changeManagedRole,
  createInvitation,
  exportUsersCsv,
  getManagedUser,
  getUserOverview,
  listAuditLogs,
  listInvitations,
  moderateUser,
  revokeUserSessions,
  softDeleteUser,
} from "../controllers/userManagement.controller.js";

import {
  compressAvatar,
  uploadAvatar,
} from "../middlewares/upload.middleware.js";

const router = Router();

// ─── Self-service routes (any authenticated user) ───────────────────────────
router.get("/me/profile", protect, getMyProfile);
router.patch(
  "/me/update",
  protect,
  uploadAvatar.single("avatar"),
  compressAvatar,
  updateMyProfile,
);
router.post("/me/deactivate", protect, deactivateMyAccount);
router.delete("/me/account", protect, deleteMyAccount);
router.get("/me/bookmarks", protect, getMyBookmarks);
router.post("/me/bookmarks/toggle/:articleId", protect, toggleBookmark);
router.post("/me/saves/toggle", protect, toggleSavedItem);
router.get("/me/saves", protect, getMySavedItems);
router.patch(
  "/me/quiz-attempts/:attemptId/visibility",
  protect,
  updateAttemptVisibility,
);

// ─── Public routes ──────────────────────────────────────────────────────────
router.get("/public/:username", getPublicProfile);
router.get("/certificates/:verificationId", getCertificate);

router.get(
  "/permissions/matrix",
  protect,
  requirePermission("roles.manage"),
  getPermissionMatrix,
);
router.put(
  "/permissions/matrix",
  protect,
  requirePermission("roles.manage"),
  updatePermissionMatrix,
);

// ─── Admin-only routes ───────────────────────────────────────────────────────
router.get(
  "/overview",
  protect,
  requirePermission("users.view"),
  getUserOverview,
);
router.get("/audit", protect, requirePermission("users.edit"), listAuditLogs);
router.get(
  "/export.csv",
  protect,
  requirePermission("users.edit"),
  exportUsersCsv,
);
router.get(
  "/invitations",
  protect,
  requirePermission("invitations.manage"),
  listInvitations,
);
router.post(
  "/invitations",
  protect,
  requirePermission("invitations.manage"),
  createInvitation,
);
router.delete(
  "/invitations/:id",
  protect,
  requirePermission("invitations.manage"),
  cancelInvitation,
);

router.get("/", protect, requirePermission("users.view"), getUsers);
router.post("/", protect, requirePermission("users.create"), createUser);

router.get(
  "/:id/management",
  protect,
  requirePermission("users.edit"),
  getManagedUser,
);
router.post(
  "/:id/notes",
  protect,
  requirePermission("users.edit"),
  addUserNote,
);
router.post(
  "/:id/revoke-sessions",
  protect,
  requirePermission("users.suspend"),
  revokeUserSessions,
);
router.patch(
  "/:id",
  protect,
  requirePermission("users.edit"),
  uploadAvatar.single("avatar"),
  compressAvatar,
  updateUser,
);
router.patch(
  "/:id/role",
  protect,
  requirePermission("roles.manage"),
  changeManagedRole,
);
router.patch(
  "/:id/status",
  protect,
  requirePermission("users.suspend"),
  moderateUser,
);
router.patch(
  "/:id/reset-password",
  protect,
  requirePermission("users.edit"),
  resetUserPassword,
);
router.delete(
  "/:id",
  protect,
  requirePermission("users.delete"),
  softDeleteUser,
);
router.get("/:id", protect, requirePermission("users.view"), getUserById);

export default router;
