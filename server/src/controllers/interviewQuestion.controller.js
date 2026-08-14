import mongoose from "mongoose";
import InterviewQuestion from "../models/Question.js";
import CourseTopic from "../models/CourseTopic.js";
import "../models/TopicCategory.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Article from "../models/Article.js";

function slugify(value = "") {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);
}

function parseList(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return [
    ...new Set(values.map((item) => String(item).trim()).filter(Boolean)),
  ];
}

function validationMessage(error) {
  if (error?.code === 11000) return "A question with this slug already exists.";
  if (error?.name === "ValidationError")
    return Object.values(error.errors)
      .map((item) => item.message)
      .join(" ");
  return "Internal server error";
}

const questionFields =
  "course question answer difficulty questionType tags slug codeExample expectedOutput followUps seoTitle seoDescription keywords canonicalUrl ogImage author createdAt updatedAt";

async function resolveCourse(value) {
  if (!value) return null;
  return Course.findOne(
    mongoose.Types.ObjectId.isValid(value) ? { _id: value } : { slug: value },
  );
}

function populateQuestion(query) {
  return query
    .select(questionFields)
    .populate("course", "title slug status")
    .populate("author", "fullName email");
}

function publicQuestion(question) {
  return {
    _id: question._id,
    question: question.question,
    answer: question.answer,
    difficulty: question.difficulty,
    questionType: question.questionType,
    tags: question.tags || [],
    slug: question.slug,
    codeExample: question.codeExample || "",
    expectedOutput: question.expectedOutput || "",
    followUps: question.followUps || [],
    seoTitle: question.seoTitle || "",
    seoDescription: question.seoDescription || "",
    keywords: question.keywords || [],
    canonicalUrl: question.canonicalUrl || "",
    ogImage: question.ogImage || "",
  };
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function relatedExpressions(question) {
  return [...new Set((question.tags || [])
    .map((tag) => String(tag).trim())
    .filter((tag) => tag.length > 1)
    .slice(0, 5)
    .map((tag) => new RegExp(escapeRegex(tag), "i")))];
}

async function getQuestionContext(course, question) {
  const expressions = relatedExpressions(question);
  const topicMatch = expressions.length
    ? {
        course: course._id,
        status: "published",
        type: "article",
        $or: [
          { title: { $in: expressions } },
          { excerpt: { $in: expressions } },
          { keywords: { $in: expressions } },
        ],
      }
    : { course: course._id, status: "published", type: "article" };
  const chapterMatch = expressions.length
    ? {
        course: course._id,
        status: "published",
        $or: [
          { title: { $in: expressions } },
          { summary: { $in: expressions } },
          { keywords: { $in: expressions } },
        ],
      }
    : { course: course._id, status: "published" };
  const articleMatch = expressions.length
    ? {
        status: "published",
        $or: [
          { title: { $in: expressions } },
          { content: { $in: expressions } },
        ],
      }
    : { status: "published" };

  let [topics, chapters, articles] = await Promise.all([
    CourseTopic.find(topicMatch).sort({ order: 1 }).limit(3).select("title slug excerpt category").populate("category", "name slug").lean(),
    Chapter.find(chapterMatch).sort({ order: 1 }).limit(4).select("title slug summary order").lean(),
    Article.find(articleMatch).sort({ createdAt: -1 }).limit(3).select("title slug image createdAt").lean(),
  ]);

  // New courses may not have tag-matched content yet. Keep the learning path useful.
  if (!topics.length && expressions.length)
    topics = await CourseTopic.find({ course: course._id, status: "published", type: "article" }).sort({ order: 1 }).limit(3).select("title slug excerpt category").populate("category", "name slug").lean();
  if (!chapters.length && expressions.length)
    chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).limit(4).select("title slug summary order").lean();

  return { topics, chapters, articles };
}

export const listPublicInterviewQuestions = async (req, res) => {
  try {
    const pageNumber = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.limit) || 15, 1), 50);
    const course = await Course.findOne({
      slug: req.params.courseSlug,
      status: "published",
    })
      .select("_id title slug interviewSeoTitle interviewSeoDescription interviewKeywords interviewCanonicalUrl interviewOgImage")
      .lean();
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });

    const [questions, total, questionIndex] = await Promise.all([
      InterviewQuestion.aggregate([
        { $match: { type: "interview", course: course._id } },
        {
          $addFields: {
            difficultyOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$difficulty", "easy"] }, then: 1 },
                  { case: { $eq: ["$difficulty", "medium"] }, then: 2 },
                  { case: { $eq: ["$difficulty", "hard"] }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
        { $sort: { difficultyOrder: 1, question: 1 } },
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize },
        { $project: { difficultyOrder: 0 } },
      ]),
      InterviewQuestion.countDocuments({ type: "interview", course: course._id }),
      InterviewQuestion.aggregate([
        { $match: { type: "interview", course: course._id } },
        { $addFields: { difficultyOrder: { $switch: { branches: [
          { case: { $eq: ["$difficulty", "easy"] }, then: 1 },
          { case: { $eq: ["$difficulty", "medium"] }, then: 2 },
          { case: { $eq: ["$difficulty", "hard"] }, then: 3 },
        ], default: 4 } } } },
        { $sort: { difficultyOrder: 1, question: 1 } },
        { $project: { _id: 1, question: 1, slug: 1, difficulty: 1 } },
      ]),
    ]);
    res.json({
      success: true,
      data: {
        course,
        questions: questions.map(publicQuestion),
        questionIndex,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error("[INTERVIEW QUESTIONS] public list error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPublicInterviewQuestion = async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.courseSlug,
      status: "published",
    })
      .select("_id title slug interviewSeoTitle interviewSeoDescription interviewKeywords interviewCanonicalUrl interviewOgImage")
      .lean();
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });

    const question = await InterviewQuestion.findOne({
      type: "interview",
      course: course._id,
      slug: req.params.questionSlug,
    })
      .select(
        "question answer difficulty questionType tags slug codeExample expectedOutput followUps seoTitle seoDescription keywords canonicalUrl ogImage createdAt updatedAt",
      )
      .lean();
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    const context = await getQuestionContext(course, question);
    res.json({
      success: true,
      data: { course, question: publicQuestion(question), ...context },
    });
  } catch (error) {
    console.error("[INTERVIEW QUESTIONS] public detail error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const listInterviewQuestions = async (req, res) => {
  try {
    const {
      course,
      search = "",
      difficulty,
      questionType,
      tag,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = { type: "interview" };
    if (course) {
      const selectedCourse = await resolveCourse(course);
      if (!selectedCourse)
        return res
          .status(404)
          .json({ success: false, message: "Course not found." });
      filter.course = selectedCourse._id;
    }
    if (difficulty && ["easy", "medium", "hard"].includes(difficulty))
      filter.difficulty = difficulty;
    if (
      questionType &&
      ["conceptual", "coding", "behavioral", "scenario", "debugging"].includes(
        questionType,
      )
    )
      filter.questionType = questionType;
    if (tag?.trim()) filter.tags = tag.trim().toLowerCase();
    if (search.trim()) {
      const expression = search.trim();
      filter.$or = [
        { question: { $regex: expression, $options: "i" } },
        { slug: { $regex: expression, $options: "i" } },
        { tags: { $regex: expression, $options: "i" } },
      ];
    }
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const [questions, total] = await Promise.all([
      populateQuestion(InterviewQuestion.find(filter))
        .sort({ updatedAt: -1, question: 1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      InterviewQuestion.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: questions,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[INTERVIEW QUESTIONS] list error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getInterviewQuestion = async (req, res) => {
  try {
    const question = await populateQuestion(
      InterviewQuestion.findOne({ _id: req.params.id, type: "interview" }),
    ).lean();
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Interview question not found." });
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createInterviewQuestion = async (req, res) => {
  try {
    const course = await resolveCourse(req.body.course || req.body.courseId);
    if (!course)
      return res.status(400).json({
        success: false,
        message: "A valid course is required.",
      });

    const question = await InterviewQuestion.create({
      type: "interview",
      course: course._id,
      question: req.body.question,
      answer: req.body.answer || "",
      difficulty: req.body.difficulty || "medium",
      questionType: req.body.questionType || "conceptual",
      tags: parseList(req.body.tags).map((tag) => tag.toLowerCase()),
      slug: slugify(req.body.slug || req.body.question),
      codeExample: req.body.codeExample || "",
      expectedOutput: req.body.expectedOutput || "",
      followUps: parseList(req.body.followUps),
      seoTitle: req.body.seoTitle || "",
      seoDescription: req.body.seoDescription || "",
      keywords: parseList(req.body.keywords),
      canonicalUrl: req.body.canonicalUrl || "",
      ogImage: req.body.ogImage || "",
      author: req.user._id,
    });
    res.status(201).json({
      success: true,
      data: await populateQuestion(InterviewQuestion.findOne({ _id: question._id, type: "interview" })),
    });
  } catch (error) {
    res
      .status(error.code === 11000 ? 409 : 400)
      .json({ success: false, message: validationMessage(error) });
  }
};

export const updateInterviewQuestion = async (req, res) => {
  try {
    const question = await InterviewQuestion.findOne({ _id: req.params.id, type: "interview" });
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Interview question not found." });
    if (req.body.course !== undefined || req.body.courseId !== undefined) {
      const course = await resolveCourse(req.body.course || req.body.courseId);
      if (!course)
        return res.status(400).json({
          success: false,
          message: "A valid course is required.",
        });

      if (String(course._id) !== String(question.course)) {
        const incompatibleTopic = await CourseTopic.exists({
          course: { $ne: course._id },
          "interviewQuestions.question": question._id,
        });
        if (incompatibleTopic)
          return res.status(409).json({
            success: false,
            message:
              "Remove this question from its current course topics before changing its course.",
          });
        question.course = course._id;
      }
    }

    const allowed = [
      "question",
      "answer",
      "difficulty",
      "questionType",
      "codeExample",
      "expectedOutput",
      "seoTitle",
      "seoDescription",
      "canonicalUrl",
      "ogImage",
    ];
    for (const key of allowed)
      if (req.body[key] !== undefined) question[key] = req.body[key];
    if (req.body.tags !== undefined)
      question.tags = parseList(req.body.tags).map((tag) => tag.toLowerCase());
    if (req.body.keywords !== undefined) question.keywords = parseList(req.body.keywords);
    if (req.body.followUps !== undefined)
      question.followUps = parseList(req.body.followUps);
    if (req.body.question !== undefined || req.body.slug !== undefined)
      question.slug = slugify(req.body.slug || req.body.question);
    await question.save();
    res.json({
      success: true,
      data: await populateQuestion(InterviewQuestion.findOne({ _id: question._id, type: "interview" })),
    });
  } catch (error) {
    res
      .status(error.code === 11000 ? 409 : 400)
      .json({ success: false, message: validationMessage(error) });
  }
};

export const deleteInterviewQuestion = async (req, res) => {
  try {
    const question = await InterviewQuestion.findOne({ _id: req.params.id, type: "interview" });
    if (!question)
      return res
        .status(404)
        .json({ success: false, message: "Interview question not found." });
    if (
      await CourseTopic.exists({ "interviewQuestions.question": question._id })
    )
      return res.status(409).json({
        success: false,
        message: "Remove this question from its topics before deleting it.",
      });
    await question.deleteOne();
    res.json({
      success: true,
      message: "Interview question deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
