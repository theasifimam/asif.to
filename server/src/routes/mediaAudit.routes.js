import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  deleteOrphanedMedia,
  listMediaAudit,
  requireMediaAuditSuperAdmin,
} from "../controllers/mediaAudit.controller.js";

const router = Router();
router.use(protect, requireMediaAuditSuperAdmin);
router.get("/", listMediaAudit);
router.delete("/file", deleteOrphanedMedia);

export default router;
