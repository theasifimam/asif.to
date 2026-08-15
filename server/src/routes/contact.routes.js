import { Router } from "express";
import { submitMessage, getMessages, updateMessageStatus } from "../controllers/contact.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

// Public route to submit a contact form
router.post("/", submitMessage);

// Protected admin routes
router.use(protect);
router.use(requirePermission("users.edit"));

router.get("/", getMessages);
router.patch("/:id/status", updateMessageStatus);

export default router;
