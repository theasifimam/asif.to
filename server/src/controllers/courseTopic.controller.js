import mongoose from "mongoose";
import Course from "../models/Course.js";
import CourseTopic from "../models/CourseTopic.js";
import TopicCategory from "../models/TopicCategory.js";
import InterviewQuestion from "../models/Question.js";
import { formatCanonicalUrl } from "../utils/canonical.js";
import fs from "fs";

function slugify(value = "") {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseKeywords(value) {
  if (Array.isArray(value))
    return [
      ...new Set(value.map((item) => String(item).trim()).filter(Boolean)),
    ];
  return [
    ...new Set(
      String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function isValidId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function normalizeInterviewQuestions(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .map((item, index) => ({
      question: item?.question || item,
      order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
    }))
    .filter((item) => isValidId(item.question))
    .filter((item) => {
      const id = String(item.question);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ question: item.question, order: index }));
}

async function resolveInterviewQuestions(value, courseId) {
  const normalized = normalizeInterviewQuestions(value);
  if (!normalized.length) return [];
  const ids = await InterviewQuestion.find({
    type: "interview",
    _id: { $in: normalized.map((item) => item.question) },
    course: courseId,
  }).distinct("_id");
  const valid = new Set(ids.map((id) => String(id)));
  if (valid.size !== normalized.length) {
    const error = new Error(
      "Every interview question must exist and belong to the selected course.",
    );
    error.name = "InterviewQuestionAssignmentError";
    throw error;
  }
  return normalized.map((item, index) => ({
    question: item.question,
    order: index,
  }));
}

async function resolveCourse(value) {
  if (!value) return null;
  return Course.findOne(isValidId(value) ? { _id: value } : { slug: value });
}

async function resolveCategory(value, courseId) {
  if (!value) return null;
  return TopicCategory.findOne({ _id: value, course: courseId });
}

function adminPopulate(query) {
  return query
    .populate("course", "title slug status")
    .populate("category", "name slug order")
    .populate("author", "fullName email")
    .populate("relatedTopics", "type title slug status order category")
    .populate(
      "interviewQuestions.question",
      "course question slug difficulty questionType tags",
    );
}

function publicTopic(topic) {
  const item = topic.toObject ? topic.toObject() : topic;
  return {
    _id: item._id,
    type: item.type || "article",
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    seoTitle: item.seoTitle || item.title,
    seoDescription: item.seoDescription || item.excerpt,
    keywords: item.keywords || [],
    canonicalUrl: item.canonicalUrl || "",
    status: item.status,
    publishedAt: item.publishedAt,
    order: item.order,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    course: item.course,
    category: item.category,
    image: item.image || "",
    interviewQuestions: (item.interviewQuestions || [])
      .filter((entry) => entry.question)
      .sort((a, b) => a.order - b.order)
      .map((entry) => ({
        order: entry.order,
        ...entry.question,
      })),
    relatedTopics: (item.relatedTopics || []).map((related) => ({
      _id: related._id,
      type: related.type || "article",
      title: related.title,
      slug: related.slug,
      excerpt: related.excerpt,
      order: related.order,
      category: related.category,
    })),
    previousTopic: item.previousTopic || null,
    nextTopic: item.nextTopic || null,
  };
}

function validationMessage(error) {
  if (error?.name === "InterviewQuestionAssignmentError") return error.message;
  if (error?.code === 11000)
    return "A topic with this slug already exists in the selected course.";
  if (error?.name === "ValidationError")
    if (error?.name === "ValidationError") {
      return Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
    }
  return "An unexpected error occurred.";
}

export const listCourseTopics = async (req, res) => {
  try {
    const {
      search = "",
      course,
      category,
      type,
      status = "all",
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};
    if (course) {
      const selectedCourse = await resolveCourse(course);
      if (!selectedCourse)
        return res
          .status(404)
          .json({ success: false, message: "Course not found." });
      filter.course = selectedCourse._id;
    }
    if (category && isValidId(category)) filter.category = category;
    if (["article", "interview"].includes(type)) filter.type = type;
    if (status !== "all") filter.status = status;
    if (search.trim())
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { slug: { $regex: search.trim(), $options: "i" } },
      ];
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const [topics, total] = await Promise.all([
      adminPopulate(
        CourseTopic.find(filter)
          .sort({ course: 1, order: 1, title: 1 })
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize),
      ).lean(),
      CourseTopic.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: topics,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[COURSE TOPICS] list error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const listCourseTopicsAdmin = listCourseTopics;

export const getCourseTopicAdmin = async (req, res) => {
  try {
    const topic = await adminPopulate(CourseTopic.findById(req.params.id));
    if (!topic)
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });
    res.json({ success: true, data: topic });
  } catch (error) {
    console.error("[COURSE TOPICS] get admin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createCourseTopic = async (req, res) => {
  try {
    if (typeof req.body.interviewQuestions === "string") {
      try {
        req.body.interviewQuestions = JSON.parse(req.body.interviewQuestions);
      } catch {}
    }
    if (typeof req.body.relatedTopics === "string") {
      try {
        req.body.relatedTopics = JSON.parse(req.body.relatedTopics);
      } catch {}
    }
    const course = await resolveCourse(req.body.course || req.body.courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    const category = await resolveCategory(
      req.body.category || req.body.categoryId,
      course._id,
    );
    if (!category)
      return res.status(400).json({
        success: false,
        message: "A category from the selected course is required.",
      });
    const requestedRelated = Array.isArray(req.body.relatedTopics)
      ? req.body.relatedTopics
      : [];
    const relatedTopics = await CourseTopic.find({
      course: course._id,
      _id: { $in: requestedRelated },
    }).distinct("_id");
    const type = req.body.type === "interview" ? "interview" : "article";
    const interviewQuestions =
      type === "interview"
        ? await resolveInterviewQuestions(
            req.body.interviewQuestions,
            course._id,
          )
        : [];
    const targetSlug = slugify(req.body.slug || req.body.title);
    const basePath = `/${course.slug}/${category.slug}`;
    const canonicalUrl = formatCanonicalUrl(
      basePath,
      req.body.canonicalUrl,
      targetSlug,
    );

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/articles/${req.file.filename}`;
    }

    const topic = await CourseTopic.create({
      ...req.body,
      type,
      course: course._id,
      category: category._id,
      slug: targetSlug,
      canonicalUrl,
      keywords: parseKeywords(req.body.keywords),
      relatedTopics,
      interviewQuestions,
      image: imageUrl,
      author: req.user._id,
      status: "draft",
      publishedAt: null,
    });
    res.status(201).json({
      success: true,
      data: await adminPopulate(CourseTopic.findById(topic._id)),
    });
  } catch (error) {
    console.error("[COURSE TOPICS] create error:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res
      .status(error.code === 11000 ? 409 : 400)
      .json({ success: false, message: validationMessage(error) });
  }
};

export const updateCourseTopic = async (req, res) => {
  try {
    if (typeof req.body.interviewQuestions === "string") {
      try {
        req.body.interviewQuestions = JSON.parse(req.body.interviewQuestions);
      } catch {}
    }
    if (typeof req.body.relatedTopics === "string") {
      try {
        req.body.relatedTopics = JSON.parse(req.body.relatedTopics);
      } catch {}
    }
    const topic = await CourseTopic.findById(req.params.id);
    if (!topic)
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });
    const course =
      req.body.course || req.body.courseId
        ? await resolveCourse(req.body.course || req.body.courseId)
        : await Course.findById(topic.course);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    const category =
      req.body.category || req.body.categoryId
        ? await resolveCategory(
            req.body.category || req.body.categoryId,
            course._id,
          )
        : await TopicCategory.findById(topic.category);
    if (!category)
      return res.status(400).json({
        success: false,
        message: "A category from the selected course is required.",
      });
    const allowed = [
      "title",
      "excerpt",
      "content",
      "seoTitle",
      "seoDescription",
      "order",
    ];
    if (req.body.type !== undefined)
      topic.type = req.body.type === "interview" ? "interview" : "article";
    for (const key of allowed)
      if (req.body[key] !== undefined) topic[key] = req.body[key];
    if (req.body.title !== undefined || req.body.slug !== undefined)
      topic.slug = slugify(req.body.slug || req.body.title);
    topic.course = course._id;
    topic.category = category._id;

    if (
      req.body.canonicalUrl !== undefined ||
      req.body.slug !== undefined ||
      req.body.title !== undefined ||
      req.body.category !== undefined ||
      req.body.course !== undefined
    ) {
      const targetSlug = topic.slug;
      const basePath = `/${course.slug}/${category.slug}`;
      topic.canonicalUrl = formatCanonicalUrl(
        basePath,
        req.body.canonicalUrl !== undefined ? req.body.canonicalUrl : topic.canonicalUrl,
        targetSlug,
      );
    }

    if (req.body.keywords !== undefined)
      topic.keywords = parseKeywords(req.body.keywords);
    if (req.body.relatedTopics !== undefined) {
      const related = Array.isArray(req.body.relatedTopics)
        ? req.body.relatedTopics
        : [];
      const validRelated = await CourseTopic.find({
        course: course._id,
        $and: [{ _id: { $in: related } }, { _id: { $ne: topic._id } }],
      }).distinct("_id");
      topic.relatedTopics = validRelated;
    }
    if (topic.type === "article") {
      topic.interviewQuestions = [];
    } else if (
      req.body.interviewQuestions !== undefined ||
      req.body.course !== undefined ||
      req.body.courseId !== undefined
    ) {
      topic.interviewQuestions = await resolveInterviewQuestions(
        req.body.interviewQuestions ?? topic.interviewQuestions,
        course._id,
      );
    }

    if (req.file) {
      if (topic.image && topic.image.startsWith("/")) {
        const oldImagePath = topic.image.slice(1);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      topic.image = `/uploads/articles/${req.file.filename}`;
    } else if (req.body.image === "" || req.body.image === "null" || req.body.image === null) {
      if (topic.image && topic.image.startsWith("/")) {
        const oldImagePath = topic.image.slice(1);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      topic.image = "";
    }

    await topic.save();
    res.json({
      success: true,
      data: await adminPopulate(CourseTopic.findById(topic._id)),
    });
  } catch (error) {
    console.error("[COURSE TOPICS] update error:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res
      .status(error.code === 11000 ? 409 : 400)
      .json({ success: false, message: validationMessage(error) });
  }
};

export const publishCourseTopic = async (req, res) => {
  try {
    const topic = await CourseTopic.findById(req.params.id);
    if (!topic)
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });
    const nextStatus = req.body.status === "draft" ? "draft" : "published";
    if (
      nextStatus === "published" &&
      (!topic.title ||
        !topic.slug ||
        !topic.excerpt ||
        !topic.content ||
        !topic.course ||
        !topic.category ||
        !topic.seoTitle ||
        !topic.seoDescription ||
        (topic.type === "interview" && !topic.interviewQuestions?.length))
    )
      return res.status(400).json({
        success: false,
        message:
          topic.type === "interview"
            ? "Title, slug, course, category, excerpt, content, SEO fields, and at least one interview question are required before publishing."
            : "Title, slug, course, category, excerpt, content, SEO title, and SEO description are required before publishing.",
      });
    if (nextStatus === "published" && topic.type === "interview") {
      topic.interviewQuestions = await resolveInterviewQuestions(
        topic.interviewQuestions,
        topic.course,
      );
    }
    topic.status = nextStatus;
    topic.publishedAt =
      topic.status === "published" ? topic.publishedAt || new Date() : null;
    await topic.save();
    res.json({
      success: true,
      data: await adminPopulate(CourseTopic.findById(topic._id)),
    });
  } catch (error) {
    console.error("[COURSE TOPICS] publish error:", error);
    res.status(400).json({ success: false, message: validationMessage(error) });
  }
};

export const deleteCourseTopic = async (req, res) => {
  try {
    const topic = await CourseTopic.findByIdAndDelete(req.params.id);
    if (!topic)
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });

    if (topic.image && topic.image.startsWith("/")) {
      const oldImagePath = topic.image.slice(1);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await CourseTopic.updateMany(
      { relatedTopics: topic._id },
      { $pull: { relatedTopics: topic._id } },
    );
    res.json({ success: true, message: "Topic deleted successfully." });
  } catch (error) {
    console.error("[COURSE TOPICS] delete error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const reorderCourseTopics = async (req, res) => {
  try {
    const course = await resolveCourse(req.body.course || req.body.courseId);
    if (!course)
      return res.status(400).json({
        success: false,
        message: "A valid course is required to reorder topics.",
      });

    const requested = Array.isArray(req.body.orders) ? req.body.orders : [];
    const orders = requested.filter(
      (item, index, items) =>
        isValidId(item?.id) &&
        Number.isFinite(Number(item?.order)) &&
        items.findIndex(
          (candidate) => String(candidate?.id) === String(item.id),
        ) === index,
    );
    if (!orders.length || orders.length !== requested.length)
      return res.status(400).json({
        success: false,
        message:
          "Every topic order must contain a unique valid topic ID and numeric order.",
      });

    const topicIds = await CourseTopic.find({
      _id: { $in: orders.map((item) => item.id) },
      course: course._id,
    }).distinct("_id");
    if (topicIds.length !== orders.length)
      return res.status(400).json({
        success: false,
        message: "Every topic must belong to the selected course.",
      });

    await Promise.all(
      orders.map((item) =>
        CourseTopic.updateOne(
          { _id: item.id, course: course._id },
          { $set: { order: Math.max(0, Number(item.order) || 0) } },
        ),
      ),
    );
    res.json({ success: true, message: "Topic order updated successfully." });
  } catch (error) {
    console.error("[COURSE TOPICS] reorder error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPublicTopics = async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.courseSlug,
      status: "published",
    })
      .select("title slug")
      .lean();
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    const topics = await CourseTopic.find({
      course: course._id,
      status: "published",
    })
      .sort({ order: 1, title: 1 })
      .populate("category", "name slug order")
      .select(
        "type title slug excerpt seoTitle seoDescription keywords canonicalUrl publishedAt order category",
      )
      .lean();
    res.json({ success: true, data: { course, topics } });
  } catch (error) {
    console.error("[COURSE TOPICS] public list error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPublicTopic = async (req, res) => {
  try {
    const nestedPath = Array.isArray(req.params.topicPath)
      ? req.params.topicPath
      : String(req.params.topicPath || "")
          .split("/")
          .filter(Boolean);
    const topicSlug = nestedPath.length
      ? nestedPath[nestedPath.length - 1]
      : req.params.topicSlug;
    const categorySlug =
      nestedPath.length > 1 ? nestedPath.slice(0, -1).join("/") : null;

    const course = await Course.findOne({
      slug: req.params.courseSlug,
      status: "published",
    })
      .select("title slug")
      .lean();
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });

    const filter = {
      course: course._id,
      slug: topicSlug,
      status: "published",
    };
    if (categorySlug) {
      const category = await TopicCategory.findOne({
        course: course._id,
        slug: categorySlug,
      })
        .select("_id")
        .lean();
      if (!category)
        return res
          .status(404)
          .json({ success: false, message: "Topic not found." });
      filter.category = category._id;
    }

    const topic = await CourseTopic.findOne(filter)
      .populate("category", "name slug order")
      .populate({
        path: "relatedTopics",
        match: { status: "published" },
        select: "type title slug excerpt order category",
        populate: { path: "category", select: "name slug" },
      })
      .populate({
        path: "interviewQuestions.question",
        select:
          "question answer difficulty questionType tags slug codeExample expectedOutput followUps",
      })
      .lean();
    if (!topic)
      return res
        .status(404)
        .json({ success: false, message: "Topic not found." });
    const siblings = await CourseTopic.find({
      course: course._id,
      status: "published",
    })
      .sort({ order: 1, title: 1 })
      .select("type title slug order category")
      .populate("category", "name slug")
      .lean();
    const index = siblings.findIndex(
      (item) => String(item._id) === String(topic._id),
    );
    const data = publicTopic({
      ...topic,
      course,
      previousTopic: siblings[index - 1] || null,
      nextTopic: siblings[index + 1] || null,
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error("[COURSE TOPICS] public detail error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Topic Categories Controller ─────────────────────────────────────────────

export const getTopicCategories = async (req, res) => {
  try {
    const { course } = req.query;
    const filter = {};
    if (course && course !== "all") {
      const selectedCourse = await resolveCourse(course);
      if (!selectedCourse)
        return res
          .status(404)
          .json({ success: false, message: "Course not found." });
      filter.course = selectedCourse._id;
    }
    const categories = await TopicCategory.find(filter)
      .sort({ order: 1, name: 1 })
      .populate("course", "title slug status")
      .lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("[TOPIC CATEGORIES] list error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTopicCategory = async (req, res) => {
  try {
    const category = await TopicCategory.findById(req.params.id)
      .populate("course", "title slug status")
      .lean();
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    res.json({ success: true, data: category });
  } catch (error) {
    console.error("[TOPIC CATEGORIES] get error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createTopicCategory = async (req, res) => {
  try {
    let courseObj = null;
    if (req.body.course && req.body.course !== "none") {
      courseObj = await resolveCourse(req.body.course);
      if (!courseObj)
        return res
          .status(404)
          .json({ success: false, message: "Course not found." });
    }
    const targetSlug = slugify(req.body.slug || req.body.name);
    const basePath = courseObj
      ? `/${courseObj.slug}/interview-questions`
      : "/interview-questions";
    const canonicalUrl = formatCanonicalUrl(
      basePath,
      req.body.canonicalUrl,
      targetSlug,
    );

    const category = await TopicCategory.create({
      ...req.body,
      course: courseObj ? courseObj._id : null,
      slug: targetSlug,
      canonicalUrl,
      status: req.body.status || "published",
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("[TOPIC CATEGORIES] create error:", error);
    res
      .status(error.code === 11000 ? 409 : 400)
      .json({ success: false, message: validationMessage(error) });
  }
};

export const updateTopicCategory = async (req, res) => {
  try {
    const category = await TopicCategory.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });

    if (req.body.course !== undefined) {
      if (req.body.course && req.body.course !== "none") {
        const courseObj = await resolveCourse(req.body.course);
        if (!courseObj)
          return res
            .status(404)
            .json({ success: false, message: "Course not found." });
        category.course = courseObj._id;
      } else {
        category.course = null;
      }
    }

    const allowed = [
      "name",
      "description",
      "content",
      "status",
      "order",
      "thumbnail",
      "seoTitle",
      "seoDescription",
      "keywords",
      "ogTitle",
      "ogDescription",
      "ogImage",
      "twitterTitle",
      "twitterDescription",
      "twitterImage",
      "noindex",
      "nofollow",
      "featuredChapters",
      "relatedCheatsheets",
      "relatedCourses",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) category[key] = req.body[key];
    }
    if (req.body.name !== undefined || req.body.slug !== undefined) {
      category.slug = slugify(req.body.slug || req.body.name);
    }

    if (
      req.body.canonicalUrl !== undefined ||
      req.body.slug !== undefined ||
      req.body.name !== undefined ||
      req.body.course !== undefined
    ) {
      const courseObj = category.course
        ? await Course.findById(category.course).select("slug").lean()
        : null;
      const targetSlug = category.slug;
      const basePath = courseObj
        ? `/${courseObj.slug}/interview-questions`
        : "/interview-questions";
      category.canonicalUrl = formatCanonicalUrl(
        basePath,
        req.body.canonicalUrl !== undefined ? req.body.canonicalUrl : category.canonicalUrl,
        targetSlug,
      );
    }

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    console.error("[TOPIC CATEGORIES] update error:", error);
    res
      .status(error.code === 11000 ? 409 : 400)
      .json({ success: false, message: validationMessage(error) });
  }
};

export const deleteTopicCategory = async (req, res) => {
  try {
    const category = await TopicCategory.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });

    const inUse = await CourseTopic.exists({ category: category._id });
    if (inUse)
      return res.status(409).json({
        success: false,
        message: "Remove or reassign topics in this category before deleting it.",
      });

    await category.deleteOne();
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    console.error("[TOPIC CATEGORIES] delete error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const reorderTopicCategories = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "An array of categories with id and order is required.",
      });
    }

    const bulkOps = items
      .map((item, index) => {
        const id = typeof item === "string" ? item : item._id || item.id;
        if (!isValidId(id)) return null;
        const orderNum = Number.isFinite(Number(item.order))
          ? Number(item.order)
          : index;
        return {
          updateOne: {
            filter: { _id: id },
            update: { $set: { order: orderNum } },
          },
        };
      })
      .filter(Boolean);

    if (bulkOps.length) {
      await TopicCategory.bulkWrite(bulkOps);
    }

    res.json({
      success: true,
      message: "Categories reordered successfully.",
    });
  } catch (error) {
    console.error("[TOPIC CATEGORIES] reorder error:", error);
    res.status(500).json({ success: false, message: "Unable to reorder categories." });
  }
};

export const listPublicInterviewCategories = async (req, res) => {
  try {
    const { course: courseQuery } = req.query;
    const { courseSlug } = req.params;
    const targetCourse = courseSlug || courseQuery;

    let catFilter = { status: { $ne: "draft" } };
    if (targetCourse && targetCourse !== "all") {
      const courseObj = await Course.findOne({
        slug: targetCourse,
        status: { $ne: "draft" },
      })
        .select("_id")
        .lean();
      if (courseObj) {
        catFilter.course = courseObj._id;
      }
    }

    const categories = await TopicCategory.find(catFilter)
      .sort({ order: 1, name: 1 })
      .populate("course", "title slug")
      .lean();

    const result = [];
    for (const cat of categories) {
      const questionCount = await InterviewQuestion.countDocuments({
        type: "interview",
        category: cat._id,
        status: { $ne: "draft" },
      });
      if (questionCount > 0) {
        result.push({ ...cat, questionCount });
      }
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[TOPIC CATEGORIES] public list error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPublicInterviewCategory = async (req, res) => {
  try {
    const { courseSlug, categorySlug } = req.params;
    const { page = 1, limit = 15, course: courseQuery } = req.query;

    let targetCategorySlug = categorySlug;
    let targetCourseSlug = courseSlug || courseQuery;

    // Handle single param /public/:categorySlug
    if (!targetCategorySlug && courseSlug) {
      targetCategorySlug = courseSlug;
      targetCourseSlug = courseQuery || null;
    }

    let courseObj = null;
    if (targetCourseSlug) {
      courseObj = await Course.findOne({
        slug: targetCourseSlug,
        status: { $ne: "draft" },
      })
        .select("_id title slug")
        .lean();
    }

    const catFilter = {
      slug: targetCategorySlug,
      status: { $ne: "draft" },
    };
    if (courseObj) {
      catFilter.course = courseObj._id;
    }

    let category = await TopicCategory.findOne(catFilter)
      .populate("course", "title slug")
      .lean();

    // Fallback: if scoped category not found, search by slug alone
    if (!category && courseObj) {
      category = await TopicCategory.findOne({
        slug: targetCategorySlug,
        status: { $ne: "draft" },
      })
        .populate("course", "title slug")
        .lean();
    }

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    const filter = {
      type: "interview",
      category: category._id,
      status: { $ne: "draft" },
    };
    if (category.course) {
      const courseId = category.course._id || category.course;
      filter.$or = [{ course: courseId }, { course: { $exists: false } }, { course: null }];
    }
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 15, 1), 100);

    const [questions, total, questionIndex] = await Promise.all([
      InterviewQuestion.find(filter)
        .sort({ order: 1, createdAt: 1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      InterviewQuestion.countDocuments(filter),
      InterviewQuestion.find(filter)
        .sort({ order: 1, createdAt: 1 })
        .select("question slug")
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        category,
        questions,
        questionIndex,
        pagination: {
          page: pageNumber,
          limit: pageSize,
          total,
          pages: Math.max(Math.ceil(total / pageSize), 1),
        },
      },
    });
  } catch (error) {
    console.error("[TOPIC CATEGORIES] public category error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
