import { Router } from "express";
import {
  getFlashcards,
  getFlashcardsAdmin,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "../controllers/flashcard.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.get("/", getFlashcards);

// Admin
router.get("/admin/all", protect, authorize("admin", "editor"), getFlashcardsAdmin);
router.post("/", protect, authorize("admin", "editor"), createFlashcard);
router.patch("/:id", protect, authorize("admin", "editor"), updateFlashcard);
router.delete("/:id", protect, authorize("admin"), deleteFlashcard);

export default router;
