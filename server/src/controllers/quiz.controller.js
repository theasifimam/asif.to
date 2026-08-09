import QuizQuestion from "../models/QuizQuestion.js";

/** GET /api/v1/quiz — public; filterable by ?techId= */
export const getQuizQuestions = async (req, res) => {
  try {
    const { techId, difficulty, limit = 20 } = req.query;
    const filter = { status: "published" };
    if (techId) filter.techId = techId;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await QuizQuestion.find(filter)
      .limit(Number(limit))
      .lean();
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error("[QUIZ] getQuizQuestions error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** GET /api/v1/quiz/admin/all — admin: all statuses */
export const getQuizQuestionsAdmin = async (req, res) => {
  try {
    const { techId } = req.query;
    const filter = {};
    if (techId) filter.techId = techId;
    const questions = await QuizQuestion.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error("[QUIZ] getQuizQuestionsAdmin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** POST /api/v1/quiz (admin) */
export const createQuizQuestion = async (req, res) => {
  try {
    const { techId, question, options, correctIndex, explanation, difficulty, status } = req.body;
    if (!techId || !question || !options || correctIndex === undefined) {
      return res.status(400).json({ success: false, message: "techId, question, options, and correctIndex are required." });
    }
    const q = await QuizQuestion.create({
      techId, question, options, correctIndex,
      explanation: explanation || "",
      difficulty: difficulty || "medium",
      status: status || "published",
    });
    res.status(201).json({ success: true, data: q });
  } catch (error) {
    console.error("[QUIZ] createQuizQuestion error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** PATCH /api/v1/quiz/:id (admin) */
export const updateQuizQuestion = async (req, res) => {
  try {
    const allowed = ["techId", "question", "options", "correctIndex", "explanation", "difficulty", "status"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const q = await QuizQuestion.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!q) return res.status(404).json({ success: false, message: "Question not found." });
    res.status(200).json({ success: true, data: q });
  } catch (error) {
    console.error("[QUIZ] updateQuizQuestion error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** DELETE /api/v1/quiz/:id (admin) */
export const deleteQuizQuestion = async (req, res) => {
  try {
    const q = await QuizQuestion.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: "Question not found." });
    res.status(200).json({ success: true, message: "Question deleted." });
  } catch (error) {
    console.error("[QUIZ] deleteQuizQuestion error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
