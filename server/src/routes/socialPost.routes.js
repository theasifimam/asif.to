import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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
import { getSocialPostPublications, publishSocialPost, uploadSocialPostPublishingAssets } from "../controllers/socialPostPublication.controller.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publishingRoot = path.resolve(__dirname, "../../uploads/social-publishing");
const publishingStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const destination = path.join(publishingRoot, String(req.params.id).replace(/[^a-zA-Z0-9_-]/g, ""));
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
  },
});
const publishingUpload = multer({
  storage: publishingStorage,
  limits: { files: 20, fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => ["image/png", "image/jpeg"].includes(file.mimetype) ? cb(null, true) : cb(new Error("Publishing only supports PNG or JPEG slides.")),
});

// All routes are protected and require content-creation permission
router.use(protect, requirePermission("articles.create"));

router.get("/", getSocialPosts);
router.post("/:id/publishing-assets", publishingUpload.array("files", 20), uploadSocialPostPublishingAssets);
router.post("/:id/publish", publishSocialPost);
router.get("/:id/publications", getSocialPostPublications);
router.get("/:id", getSocialPostById);
router.post("/", createSocialPost);
router.patch("/:id", updateSocialPost);
router.post("/:id/duplicate", duplicateSocialPost);
router.delete("/:id", deleteSocialPost);

export default router;
