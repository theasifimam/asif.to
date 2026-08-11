import mongoose from "mongoose";
import Course from "../models/Course.js";
import QuizQuestion from "../models/QuizQuestion.js";

const resolveCourses = async (courseIds = []) => {
  const ids = Array.isArray(courseIds)
    ? courseIds.filter((id) => mongoose.isValidObjectId(id))
    : [];
  return ids.length
    ? Course.find({ _id: { $in: ids } })
        .select("_id")
        .lean()
    : [];
};

const buildQuestionPayload = async (body) => {
  const courses = await resolveCourses(body.courseIds || body.courses);

  return {
    courses: courses.map((course) => course._id),
    question: body.question,
    options: body.options,
    correctIndex: body.correctIndex,
    explanation: body.explanation || "",
    difficulty: body.difficulty || "medium",
    status: body.status || "published",
  };
};

/** GET /api/v1/quiz — public practice questions filtered by course. */
export const getQuizQuestions = async (req, res) => {
  try {
    const { courseId, difficulty, limit = 20 } = req.query;
    const filter = { status: "published" };
    if (courseId) {
      if (mongoose.isValidObjectId(courseId)) {
        filter.courses = courseId;
      } else {
        const course = await Course.findOne({
          $or: [{ slug: courseId }, { techId: courseId }],
        })
          .select("_id")
          .lean();
        if (course) {
          filter.courses = course._id;
        } else {
          return res.status(200).json({ success: true, data: [] });
        }
      }
    }
    if (difficulty) filter.difficulty = difficulty;

    const questions = await QuizQuestion.find(filter)
      .limit(Math.min(Number(limit) || 20, 100))
      .populate("courses", "title slug techId")
      .lean();
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error("[QUIZ] getQuizQuestions error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** GET /api/v1/quiz/exam/:courseSlug — public dynamic final-exam definition. */
export const getCourseExam = async (req, res) => {
  try {
    const course = await Course.findOne({
      $or: [{ slug: req.params.courseSlug }, { techId: req.params.courseSlug }],
      status: "published",
      examEnabled: true,
    }).lean();
    if (!course)
      return res.status(404).json({
        success: false,
        message: "Exam is not available for this course.",
      });

    const settings = course.examSettings || {};
    const questionCount = Math.min(
      Math.max(Number(settings.questionCount) || 20, 1),
      100,
    );
    const match = { status: "published", courses: course._id };
    const questions = await QuizQuestion.aggregate([
      { $match: match },
      { $sample: { size: questionCount } },
    ]);

    if (!questions.length)
      return res.status(404).json({
        success: false,
        message: "No published questions are available for this exam.",
      });

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          slug: course.slug,
          techId: course.techId,
          title: course.title,
        },
        settings: {
          questionCount: questions.length,
          durationMinutes: settings.durationMinutes || 30,
          passingPercentage: settings.passingPercentage || 70,
          cooldownHours: settings.cooldownHours ?? 24,
        },
        questions,
      },
    });
  } catch (error) {
    console.error("[QUIZ] getCourseExam error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** GET /api/v1/quiz/admin/all — admin: all statuses. */
export const getQuizQuestionsAdmin = async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = {};
    if (courseId && mongoose.isValidObjectId(courseId))
      filter.courses = courseId;
    const questions = await QuizQuestion.find(filter)
      .populate("courses", "title slug techId")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error("[QUIZ] getQuizQuestionsAdmin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** POST /api/v1/quiz (admin). */
export const createQuizQuestion = async (req, res) => {
  try {
    if (
      !req.body.question ||
      !Array.isArray(req.body.options) ||
      req.body.correctIndex === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Question, four options, and correctIndex are required.",
      });
    }
    const payload = await buildQuestionPayload(req.body);
    if (!payload.courses.length)
      return res
        .status(400)
        .json({ success: false, message: "Select at least one valid course." });
    const question = await QuizQuestion.create(payload);
    await question.populate("courses", "title slug techId");
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error("[QUIZ] createQuizQuestion error:", error);
    res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/** PATCH /api/v1/quiz/:id (admin). */
export const updateQuizQuestion = async (req, res) => {
  try {
    const existing = await QuizQuestion.findById(req.params.id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    const merged = { ...existing.toObject(), ...req.body };
    const payload = await buildQuestionPayload(merged);
    if (!payload.courses.length)
      return res
        .status(400)
        .json({ success: false, message: "Select at least one valid course." });
    Object.assign(existing, payload);
    await existing.save();
    await existing.populate("courses", "title slug techId");
    res.status(200).json({ success: true, data: existing });
  } catch (error) {
    console.error("[QUIZ] updateQuizQuestion error:", error);
    res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/** DELETE /api/v1/quiz/:id (admin). */
export const deleteQuizQuestion = async (req, res) => {
  try {
    const question = await QuizQuestion.findByIdAndDelete(req.params.id);
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    res.status(200).json({ success: true, message: "Question deleted." });
  } catch (error) {
    console.error("[QUIZ] deleteQuizQuestion error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
