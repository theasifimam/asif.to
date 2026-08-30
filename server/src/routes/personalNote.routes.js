import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from "../controllers/personalNote.controller.js";

const router = Router();
router.use(protect);

router.get("/", listNotes);
router.post("/", createNote);
router.get("/:id", getNote);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
