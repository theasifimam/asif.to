import express from "express";
import {
  getInternalLinks,
  getPublicInternalLinks,
  createInternalLink,
  updateInternalLink,
  deleteInternalLink,
  importInternalLinks,
} from "../controllers/internalLinksController.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route (for frontend fetching)
router.get("/public", getPublicInternalLinks);

// Admin routes
router.use(protect);
router.use(authorize("admin", "super_admin"));

router.get("/", getInternalLinks);
router.post("/", createInternalLink);
router.post("/import", importInternalLinks);
router.patch("/:id", updateInternalLink);
router.delete("/:id", deleteInternalLink);

export default router;
