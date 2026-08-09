import Flashcard from "../models/Flashcard.js";

/** GET /api/v1/flashcards — public; filterable by ?techId= */
export const getFlashcards = async (req, res) => {
  try {
    const { techId, tag, limit = 50 } = req.query;
    const filter = { status: "published" };
    if (techId) filter.techId = techId;
    if (tag) filter.tag = tag;

    const cards = await Flashcard.find(filter).limit(Number(limit)).lean();
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    console.error("[FLASHCARDS] getFlashcards error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** GET /api/v1/flashcards/admin/all — admin: all statuses */
export const getFlashcardsAdmin = async (req, res) => {
  try {
    const { techId } = req.query;
    const filter = {};
    if (techId) filter.techId = techId;
    const cards = await Flashcard.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    console.error("[FLASHCARDS] getFlashcardsAdmin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** POST /api/v1/flashcards (admin) */
export const createFlashcard = async (req, res) => {
  try {
    const { techId, front, back, tag, difficulty, status } = req.body;
    if (!techId || !front || !back) {
      return res.status(400).json({ success: false, message: "techId, front, and back are required." });
    }
    const card = await Flashcard.create({
      techId, front, back,
      tag: tag || "",
      difficulty: difficulty || "medium",
      status: status || "published",
    });
    res.status(201).json({ success: true, data: card });
  } catch (error) {
    console.error("[FLASHCARDS] createFlashcard error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** PATCH /api/v1/flashcards/:id (admin) */
export const updateFlashcard = async (req, res) => {
  try {
    const allowed = ["techId", "front", "back", "tag", "difficulty", "status"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const card = await Flashcard.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!card) return res.status(404).json({ success: false, message: "Flashcard not found." });
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    console.error("[FLASHCARDS] updateFlashcard error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** DELETE /api/v1/flashcards/:id (admin) */
export const deleteFlashcard = async (req, res) => {
  try {
    const card = await Flashcard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: "Flashcard not found." });
    res.status(200).json({ success: true, message: "Flashcard deleted." });
  } catch (error) {
    console.error("[FLASHCARDS] deleteFlashcard error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
