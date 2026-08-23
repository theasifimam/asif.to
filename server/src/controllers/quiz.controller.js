import mongoose from "mongoose";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import TopicCategory from "../models/TopicCategory.js";
import QuizQuestion from "../models/Question.js";
import User from "../models/User.js";
import { randomUUID } from "node:crypto";

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

// ASIF_QUESTION_LEARNING_MAPPING_V1:payload
const cleanId = (v) => v?._id || v || null;
const resolveLearningMappings = async (raw = [], courseIds = []) => {
  const selected = new Set(courseIds.map(String));
  const out = [];
  for (const item of Array.isArray(raw) ? raw.slice(0, 50) : []) {
    const course = cleanId(item?.course),
      chapterId = cleanId(item?.chapter),
      categoryId = cleanId(item?.category);
    if (
      !mongoose.isValidObjectId(course) ||
      !selected.has(String(course)) ||
      (!chapterId && !categoryId)
    )
      continue;
    let chapter = null,
      category = null;
    if (chapterId)
      chapter = mongoose.isValidObjectId(chapterId)
        ? await Chapter.findOne({ _id: chapterId, course }).select("_id").lean()
        : null;
    if (categoryId)
      category = mongoose.isValidObjectId(categoryId)
        ? await TopicCategory.findOne({ _id: categoryId, course })
            .select("_id")
            .lean()
        : null;
    if (chapterId && !chapter) continue;
    if (categoryId && !category) continue;
    out.push({
      course,
      chapter: chapter?._id || null,
      category: category?._id || null,
      source: ["auto", "legacy"].includes(item?.source)
        ? item.source
        : "manual",
      confidence: Math.min(
        100,
        Math.max(0, Number(item?.confidence ?? 100) || 0),
      ),
      mappedAt: item?.mappedAt ? new Date(item.mappedAt) : new Date(),
    });
  }
  const map = new Map();
  out.forEach((m) => map.set(String(m.course), m));
  return Array.from(map.values());
};
const buildQuestionPayload = async (body) => {
  const courses = await resolveCourses(body.courseIds || body.courses);
  const courseIds = courses.map((course) => course._id);
  return {
    type: "quiz",
    courses: courseIds,
    learningMappings: await resolveLearningMappings(
      body.learningMappings,
      courseIds,
    ),
    question: body.question,
    options: body.options,
    correctIndex: body.correctIndex,
    explanation: body.explanation || "",
    quizEnabled: body.quizEnabled !== false,
    flashcardEnabled: body.flashcardEnabled !== false,
    flashcardAnswer: body.flashcardAnswer || "",
    tag: body.tag || "",
    difficulty: body.difficulty || "medium",
    status: body.status || "published",
  };
};

/** GET /api/v1/quiz — public practice questions filtered by course. */
// ASIF_QUESTION_LEARNING_MAPPING_V1:public-query
export const getQuizQuestions = async (req, res) => {
  try {
    const {
      courseId,
      chapterId,
      categoryId,
      difficulty,
      format = "quiz",
      limit = 20,
    } = req.query;
    const filter = {
      type: "quiz",
      status: "published",
      [format === "flashcard" ? "flashcardEnabled" : "quizEnabled"]: {
        $ne: false,
      },
    };
    let resolvedCourse = null;
    if (courseId) {
      if (mongoose.isValidObjectId(courseId)) resolvedCourse = courseId;
      else {
        const c = await Course.findOne({
          $or: [{ slug: courseId }, { techId: courseId }],
        })
          .select("_id")
          .lean();
        if (!c) return res.json({ success: true, data: [] });
        resolvedCourse = c._id;
      }
      filter.courses = resolvedCourse;
    }
    if (chapterId || categoryId) {
      if (!resolvedCourse)
        return res.status(400).json({
          success: false,
          message: "courseId is required with chapter/category filters.",
        });
      const elem = { course: resolvedCourse };
      if (chapterId) {
        if (mongoose.isValidObjectId(chapterId)) elem.chapter = chapterId;
        else {
          const ch = await Chapter.findOne({
            course: resolvedCourse,
            slug: chapterId,
          })
            .select("_id")
            .lean();
          if (!ch) return res.json({ success: true, data: [] });
          elem.chapter = ch._id;
        }
      }
      if (categoryId) {
        if (mongoose.isValidObjectId(categoryId)) elem.category = categoryId;
        else {
          const cat = await TopicCategory.findOne({
            course: resolvedCourse,
            slug: categoryId,
          })
            .select("_id")
            .lean();
          if (!cat) return res.json({ success: true, data: [] });
          elem.category = cat._id;
        }
      }
      filter.learningMappings = { $elemMatch: elem };
    }
    if (difficulty) filter.difficulty = difficulty;
    const questions = await QuizQuestion.find(filter)
      .limit(Math.min(Number(limit) || 20, 100))
      .populate("courses", "title slug techId")
      .lean();
    const data =
      format === "flashcard"
        ? questions.map((item) => ({
            _id: item._id,
            front: item.question,
            back:
              item.flashcardAnswer ||
              [item.options?.[item.correctIndex], item.explanation]
                .filter(Boolean)
                .join(" — "),
            tag: item.tag,
            difficulty: item.difficulty,
            techId: item.courses?.[0]?.techId || "javascript",
            courses: item.courses,
          }))
        : questions;
    res.status(200).json({ success: true, data });
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
    const match = {
      type: "quiz",
      status: "published",
      courses: course._id,
      quizEnabled: { $ne: false },
    };
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

/** POST /api/v1/quiz/exam/:courseSlug/submit — securely record an authenticated attempt. */
export const submitCourseExam = async (req, res) => {
  try {
    const course = await Course.findOne({
      $or: [{ slug: req.params.courseSlug }, { techId: req.params.courseSlug }],
      status: "published",
      examEnabled: true,
    })
      .select("_id slug title examSettings")
      .lean();
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Exam is not available." });

    const questionIds = Array.isArray(req.body.questionIds)
      ? req.body.questionIds.filter(mongoose.isValidObjectId)
      : [];
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    if (!questionIds.length || questionIds.length !== answers.length)
      return res.status(400).json({
        success: false,
        message: "A complete exam submission is required.",
      });

    const questions = await QuizQuestion.find({
      _id: { $in: questionIds },
      type: "quiz",
      status: "published",
      courses: course._id,
    })
      .select("_id correctIndex")
      .lean();
    if (questions.length !== questionIds.length)
      return res.status(400).json({
        success: false,
        message: "One or more submitted questions are invalid.",
      });
    const correct = new Map(
      questions.map((item) => [String(item._id), item.correctIndex]),
    );
    const score = questionIds.reduce(
      (sum, id, index) =>
        sum + (Number(answers[index]) === correct.get(String(id)) ? 1 : 0),
      0,
    );
    const total = questionIds.length;
    const percentage = Math.round((score / total) * 100);
    const passingPercentage = course.examSettings?.passingPercentage || 70;
    const passed = percentage >= passingPercentage;
    const certificateId = passed ? randomUUID() : undefined;
    const attempt = {
      courseId: course._id,
      kind: "final_exam",
      score,
      total,
      percentage,
      passed,
      durationSeconds: Math.max(Number(req.body.durationSeconds) || 0, 0),
      autoSubmitReason: ["timeout", "cheat"].includes(req.body.autoSubmitReason)
        ? req.body.autoSubmitReason
        : "manual",
      visibility: "private",
      certificateId,
    };
    const update = { $push: { quizAttempts: attempt } };
    if (passed) {
      update.$addToSet = { completedCourses: course._id };
      update.$push.certificates = {
        courseId: course._id,
        verificationId: certificateId,
        certificateUrl: `/certificates/${certificateId}`,
        score,
        total,
      };
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, {
      returnDocument: "after",
    }).select("quizAttempts certificates");
    const savedAttempt = user.quizAttempts[user.quizAttempts.length - 1];
    res.status(201).json({
      success: true,
      data: {
        attempt: savedAttempt,
        certificate: passed
          ? user.certificates.find(
              (item) => item.verificationId === certificateId,
            )
          : null,
      },
    });
  } catch (error) {
    console.error("[QUIZ] submitCourseExam error:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to record exam attempt." });
  }
};

export const submitPracticeQuiz = async (req, res) => {
  try {
    const questionIds = Array.isArray(req.body.questionIds)
      ? req.body.questionIds.filter(mongoose.isValidObjectId)
      : [];
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    if (!questionIds.length || questionIds.length !== answers.length)
      return res.status(400).json({
        success: false,
        message: "A complete quiz submission is required.",
      });
    const questions = await QuizQuestion.find({
      _id: { $in: questionIds },
      type: "quiz",
      status: "published",
    })
      .select("_id correctIndex courses")
      .lean();
    if (questions.length !== questionIds.length)
      return res.status(400).json({
        success: false,
        message: "One or more quiz questions are invalid.",
      });
    const correct = new Map(
      questions.map((item) => [String(item._id), item.correctIndex]),
    );
    const score = questionIds.reduce(
      (sum, id, index) =>
        sum + (Number(answers[index]) === correct.get(String(id)) ? 1 : 0),
      0,
    );
    const total = questionIds.length;
    let courseId = null;
    if (req.body.courseSlug) {
      const course = await Course.findOne({
        $or: [{ slug: req.body.courseSlug }, { techId: req.body.courseSlug }],
      })
        .select("_id")
        .lean();
      courseId = course?._id || null;
    }
    const attempt = {
      ...(courseId && { courseId }),
      kind: "practice",
      score,
      total,
      percentage: Math.round((score / total) * 100),
      passed: score / total >= 0.7,
      visibility: "private",
    };
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { quizAttempts: attempt } },
      { returnDocument: "after" },
    ).select("quizAttempts");
    res.status(201).json({
      success: true,
      data: { attempt: user.quizAttempts[user.quizAttempts.length - 1] },
    });
  } catch (error) {
    console.error("[QUIZ] submitPracticeQuiz error:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to record quiz attempt." });
  }
};

/** GET /api/v1/quiz/admin/all — admin: all statuses. */
// ASIF_QUESTION_LEARNING_MAPPING_V1:admin-filter
// ASIF_MAPPING_REVIEW_UI_V1:admin-list
export const getQuizQuestionsAdmin = async (req, res) => {
  try {
    const {
      courseId,
      chapterId,
      categoryId,
      mapping = "all",
      confidenceThreshold = 75,
      type = "quiz",
      page = 1,
      limit = 20,
    } = req.query;

    const threshold = Math.min(
      100,
      Math.max(0, Number(confidenceThreshold) || 75),
    );

    const selectedCourse =
      courseId && mongoose.isValidObjectId(courseId)
        ? courseId
        : null;

    const mappingActive =
      type !== "interview" && mapping !== "all";

    const filter =
      type === "all"
        ? mappingActive
          ? { type: "quiz" }
          : {}
        : {
            type: type === "interview" ? "interview" : "quiz",
          };

    if (selectedCourse) {
      if (type === "interview") {
        filter.course = selectedCourse;
      } else if (type === "all" && !mappingActive) {
        filter.$or = [
          { courses: selectedCourse },
          { course: selectedCourse },
        ];
      } else {
        filter.courses = selectedCourse;
      }
    }

    const and = [];

    if (
      type !== "interview" &&
      (chapterId || categoryId)
    ) {
      const elem = {};
      if (selectedCourse) elem.course = selectedCourse;
      if (chapterId && mongoose.isValidObjectId(chapterId)) {
        elem.chapter = chapterId;
      }
      if (categoryId && mongoose.isValidObjectId(categoryId)) {
        elem.category = categoryId;
      }
      if (Object.keys(elem).length) {
        and.push({
          learningMappings: { $elemMatch: elem },
        });
      }
    }

    const incomplete = [
      { category: null },
      { category: { $exists: false } },
      { chapter: null },
      { chapter: { $exists: false } },
      { confidence: { $lt: threshold } },
    ];

    if (type !== "interview") {
      if (mapping === "needs_review") {
        if (selectedCourse) {
          and.push({
            $or: [
              {
                learningMappings: {
                  $not: {
                    $elemMatch: { course: selectedCourse },
                  },
                },
              },
              {
                learningMappings: {
                  $elemMatch: {
                    course: selectedCourse,
                    $or: incomplete,
                  },
                },
              },
            ],
          });
        } else {
          and.push({
            $or: [
              {
                "learningMappings.0": { $exists: false },
              },
              {
                learningMappings: {
                  $elemMatch: { $or: incomplete },
                },
              },
            ],
          });
        }
      }

      if (mapping === "mapped") {
        and.push(
          selectedCourse
            ? {
                learningMappings: {
                  $elemMatch: { course: selectedCourse },
                },
              }
            : {
                "learningMappings.0": { $exists: true },
              },
        );
      }

      if (mapping === "unmapped") {
        and.push(
          selectedCourse
            ? {
                learningMappings: {
                  $not: {
                    $elemMatch: { course: selectedCourse },
                  },
                },
              }
            : {
                "learningMappings.0": { $exists: false },
              },
        );
      }

      if (mapping === "low_confidence") {
        and.push({
          learningMappings: {
            $elemMatch: {
              ...(selectedCourse
                ? { course: selectedCourse }
                : {}),
              confidence: { $lt: threshold },
            },
          },
        });
      }

      if (mapping === "complete") {
        if (selectedCourse) {
          and.push({
            learningMappings: {
              $elemMatch: {
                course: selectedCourse,
                category: { $ne: null },
                chapter: { $ne: null },
                confidence: { $gte: threshold },
              },
            },
          });
        } else {
          and.push({
            "learningMappings.0": { $exists: true },
          });
          and.push({
            learningMappings: {
              $not: {
                $elemMatch: { $or: incomplete },
              },
            },
          });
        }
      }
    }

    if (and.length) {
      filter.$and = [
        ...(filter.$and || []),
        ...and,
      ];
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(limit) || 20, 1),
      100,
    );

    const [questions, total] = await Promise.all([
      QuizQuestion.find(filter)
        .populate("courses", "title slug techId")
        .populate("course", "title slug techId")
        .populate("category", "name slug")
        .populate("learningMappings.course", "title slug techId")
        .populate("learningMappings.category", "name slug")
        .populate("learningMappings.chapter", "title slug order")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      QuizQuestion.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
      meta: {
        mapping,
        confidenceThreshold: threshold,
      },
    });
  } catch (error) {
    console.error("[QUIZ] getQuizQuestionsAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getQuestionAdmin = async (req, res) => {
  try {
    const question = await QuizQuestion.findById(req.params.id)
      .populate("courses", "title slug techId")
      .populate("course", "title slug techId")
      // ASIF_QUESTION_LEARNING_MAPPING_V1:populate
      .populate("learningMappings.course", "title slug techId")
      .populate("learningMappings.chapter", "title slug order")
      .populate("learningMappings.category", "name slug")
      .lean();
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    res.json({ success: true, data: question });
  } catch (error) {
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
    const existing = await QuizQuestion.findOne({
      _id: req.params.id,
      type: "quiz",
    });
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
    const question = await QuizQuestion.findOneAndDelete({
      _id: req.params.id,
      type: "quiz",
    });
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
