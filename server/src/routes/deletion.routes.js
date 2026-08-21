import { Router } from "express";
import {
  approveDeletion,
  beginDeletion,
  getDeletionImpact,
  getDeletionRequest,
  rejectDeletion,
  sendDeletionApproverOtp,
  verifyDeletionInitiatorOtp,
} from "../controllers/deletion.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

router.get(
  "/:entityModel/:entityId/deletion-impact",
  protect,
  requirePermission("courses.manage"),
  getDeletionImpact,
);

router.post(
  "/:entityModel/:entityId/begin",
  protect,
  requirePermission("courses.manage"),
  beginDeletion,
);

router.get(
  "/:requestId",
  protect,
  requirePermission("courses.manage"),
  getDeletionRequest,
);

router.post(
  "/:requestId/verify-initiator",
  protect,
  requirePermission("courses.manage"),
  verifyDeletionInitiatorOtp,
);

router.post(
  "/:requestId/approval-otp",
  protect,
  requirePermission("courses.manage"),
  sendDeletionApproverOtp,
);

router.post(
  "/:requestId/approve",
  protect,
  requirePermission("courses.manage"),
  approveDeletion,
);

router.post(
  "/:requestId/reject",
  protect,
  requirePermission("courses.manage"),
  rejectDeletion,
);

export default router;
