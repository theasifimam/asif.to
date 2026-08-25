import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
// ASIF_QUESTION_LEARNING_MAPPING_V1:question-import
import Question from "../models/Question.js";
import { logActivity } from "../services/activity.service.js";
import { formatCanonicalUrl } from "../utils/canonical.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) {
    return value.map((keyword) => String(keyword).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }

  return [];
}

function getPagination(query, defaultLimit = 20) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || defaultLimit, 1),
    100,
  );

  return { page, limit, skip: (page - 1) * limit };
}

// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:availability-helper
async function attachLearningAvailability(courseId, chapters = []) {
  if (!chapters.length) return chapters;
  const ids = chapters.map((chapter) => chapter._id);
  const eligible = {
    course: courseId,
    chapter: { $in: ids },
    $or: [
      { source: { $in: ["manual", "legacy"] } },
      { source: "auto", confidence: { $gte: 75 } },
    ],
  };

  const rows = await Question.aggregate([
    {
      $match: {
        type: "quiz",
        status: "published",
        learningMappings: { $elemMatch: eligible },
      },
    },
    { $unwind: "$learningMappings" },
    {
      $match: {
        "learningMappings.course": courseId,
        "learningMappings.chapter": { $in: ids },
        $or: [
          { "learningMappings.source": { $in: ["manual", "legacy"] } },
          {
            "learningMappings.source": "auto",
            "learningMappings.confidence": { $gte: 75 },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$learningMappings.chapter",
        reviseCount: {
          $sum: {
            $cond: [{ $ne: ["$flashcardEnabled", false] }, 1, 0],
          },
        },
        practiceCount: {
          $sum: {
            $cond: [{ $ne: ["$quizEnabled", false] }, 1, 0],
          },
        },
      },
    },
  ]);

  const map = new Map(rows.map((row) => [String(row._id), row]));

  return chapters.map((chapter) => {
    const row = map.get(String(chapter._id)) || {};
    const build = chapter.learningActivities?.build || {};
    return {
      ...chapter,
      learningAvailability: {
        reviseCount: Number(row.reviseCount || 0),
        practiceCount: Number(row.practiceCount || 0),
        build: Boolean(
          build.enabled &&
            (String(build.title || "").trim() ||
              String(build.description || "").trim()),
        ),
      },
    };
  });
}

// ── Public Endpoints ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/courses
 * List all published courses (with chapter counts and view rankings)
 */
export const getCourses = async (req, res) => {
  try {
    const { status, techId, sortBy } = req.query;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    } else if (!status) {
      filter.status = "published";
    }
    if (techId) filter.techId = techId;

    const courses = await Course.find(filter).lean();
    const courseIds = courses.map((c) => c._id);

    // Aggregate chapter count & total views for each course
    const chapterStats = await Chapter.aggregate([
      { $match: { course: { $in: courseIds }, status: "published" } },
      {
        $group: {
          _id: "$course",
          count: { $sum: 1 },
          totalViews: { $sum: "$viewCount" },
        },
      },
    ]);

    const countMap = {};
    const viewsMap = {};
    chapterStats.forEach((s) => {
      countMap[s._id.toString()] = s.count;
      viewsMap[s._id.toString()] = s.totalViews || 0;
    });

    let result = courses.map((c) => ({
      ...c,
      chapterCount: countMap[c._id.toString()] || 0,
      totalViews: viewsMap[c._id.toString()] || 0,
    }));

    // Rank courses by most read (totalViews descending)
    result.sort((a, b) => {
      if (b.totalViews !== a.totalViews) {
        return b.totalViews - a.totalViews;
      }
      return (a.order ?? 0) - (b.order ?? 0);
    });

    // Attach ranking index
    result = result.map((c, index) => ({
      ...c,
      rank: index + 1,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("[COURSES] getCourses error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/v1/courses/:slug
 * Get single course with its ordered chapters (public info only)
 */
export const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    let course = await Course.findOne({ slug, status: "published" }).lean();
    if (!course) {
      // Fallback: search by techId if slug didn't match directly
      course = await Course.findOne({ techId: slug, status: "published" })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    const chapters = await Chapter.find({
      course: course._id,
      status: "published",
    })
      .sort({ order: 1 })
      // ASIF_COURSE_LEARNING_FLOW_V1:public-course-chapter-select
.select("slug title summary order viewCount tryItChallenge relatedQuestions learningActivities")
      .lean();

    // ASIF_QUESTION_LEARNING_MAPPING_V1:course-response
    const chaptersWithLearning = await attachLearningAvailability(course._id, chapters);
    res.status(200).json({ success: true, data: { ...course, chapters: chaptersWithLearning } });
  } catch (error) {
    console.error("[COURSES] getCourseBySlug error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/v1/courses/:slug/chapters/:chapterSlug
 * Get a single chapter with full content
 */
export const getChapterBySlug = async (req, res) => {
  try {
    const { slug: courseSlug, chapterSlug } = req.params;

    let course = await Course.findOne({
      slug: courseSlug,
      status: "published",
    }).lean();
    if (!course) {
      // Fallback: search by techId if slug didn't match directly
      course = await Course.findOne({ techId: courseSlug, status: "published" })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    const chapter = await Chapter.findOne({
      course: course._id,
      slug: chapterSlug,
      status: "published",
    }).lean();

    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found." });
    }

    // Capture real readership: increment viewCount on each read
    Chapter.findByIdAndUpdate(chapter._id, { $inc: { viewCount: 1 } })
      .exec()
      .catch(() => {});

    // Get adjacent chapters for prev/next navigation
    const allChapters = await Chapter.find({
      course: course._id,
      status: "published",
    })
      .sort({ order: 1 })
      .select("slug title order")
      .lean();

    // ASIF_QUESTION_LEARNING_MAPPING_V1:chapter-response
    const [chapterWithLearning] = await attachLearningAvailability(course._id, [chapter]);
    const allChaptersWithLearning = await attachLearningAvailability(course._id, allChapters);

    const currentIndex = allChapters.findIndex((c) => c.slug === chapter.slug);
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const nextChapter =
      currentIndex < allChapters.length - 1
        ? allChapters[currentIndex + 1]
        : null;

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          slug: course.slug,
          title: course.title,
          subtitle: course.subtitle,
          thumbnail: course.thumbnail,
          level: course.level,
          duration: course.duration,
          techId: course.techId,
          examEnabled: course.examEnabled,
          examSettings: course.examSettings,
        },
        chapter: chapterWithLearning,
        allChapters: allChaptersWithLearning,
        prevChapter,
        nextChapter,
      },
    });
  } catch (error) {
    console.error("[COURSES] getChapterBySlug error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Admin Endpoints ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/courses/admin/all
 * Get all courses (including drafts) for admin panel
 */
export const getCoursesAdmin = async (req, res) => {
  try {
    const { search = "", status = "all", level = "all" } = req.query;
    const hasPagination =
      req.query.page !== undefined || req.query.limit !== undefined;
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (status !== "all") filter.status = status;
    if (level !== "all") filter.level = level;
    if (search.trim()) {
      const expression = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { title: expression },
        { subtitle: expression },
        { slug: expression },
        { techId: expression },
        { keywords: expression },
      ];
    }

    const total = await Course.countDocuments(filter);
    let query = Course.find(filter).sort({ order: 1, createdAt: -1 });
    if (hasPagination) query = query.skip(skip).limit(limit);
    const courses = await query.lean();

    const courseIds = courses.map((c) => c._id);
    const chapterCounts = await Chapter.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    chapterCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const result = courses.map((c) => ({
      ...c,
      chapterCount: countMap[c._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: result,
      pagination: {
        page: hasPagination ? page : 1,
        limit: hasPagination ? limit : Math.max(total, 1),
        total,
        pages: hasPagination ? Math.max(Math.ceil(total / limit), 1) : 1,
      },
    });
  } catch (error) {
    console.error("[COURSES] getCoursesAdmin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/v1/courses/admin/:id
 * Get a course by _id with all its chapters (admin)
 */
export const getCourseByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }
    const chapters = await Chapter.find({ course: id })
      .sort({ order: 1 })
      .lean();
    res.status(200).json({ success: true, data: { ...course, chapters } });
  } catch (error) {
    console.error("[COURSES] getCourseByIdAdmin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/v1/courses
 * Create a new course
 */
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      techId,
      level,
      duration,
      thumbnail,
      learningOutcomes,
      order,
      status,
      examEnabled,
      examSettings,
      seoTitle,
      seoDescription,
      keywords,
      canonicalUrl,
      interviewSeoTitle,
      interviewSeoDescription,
      interviewKeywords,
      interviewCanonicalUrl,
      interviewOgImage,
      relatedCourses,
      relatedArticles,
      popularChapterIds,
    } = req.body;

    if (!title || !subtitle || !techId) {
      return res.status(400).json({
        success: false,
        message: "title, subtitle, and techId are required.",
      });
    }

    let baseSlug = req.body.slug
      ? slugify(req.body.slug)
      : slugify(techId || title);
    if (!baseSlug) baseSlug = slugify(title);

    let slug = baseSlug;
    let existing = await Course.findOne({ slug });
    let counter = 2;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await Course.findOne({ slug });
      counter++;
    }

    const finalCanonicalUrl = formatCanonicalUrl("/courses", canonicalUrl, slug);
    const finalInterviewCanonicalUrl = formatCanonicalUrl(`/${slug}/interview-questions`, interviewCanonicalUrl, "");

    const finalThumbnail = req.file ? `/uploads/articles/${req.file.filename}` : (thumbnail || "");

    const course = await Course.create({
      slug,
      title,
      subtitle,
      techId,
      level: level || "Beginner - Advanced",
      duration: duration || "Self-paced",
      thumbnail: finalThumbnail,
      learningOutcomes: typeof learningOutcomes === "string" ? (() => { try { return JSON.parse(learningOutcomes); } catch { return []; } })() : (learningOutcomes || []),
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
      keywords: normalizeKeywords(keywords),
      canonicalUrl: finalCanonicalUrl,
      interviewSeoTitle: interviewSeoTitle || "",
      interviewSeoDescription: interviewSeoDescription || "",
      interviewKeywords: normalizeKeywords(interviewKeywords),
      interviewCanonicalUrl: finalInterviewCanonicalUrl,
      interviewOgImage: interviewOgImage || "",
      order: Number(order) || 0,
      status: status || "published",
      examEnabled: examEnabled === true || examEnabled === "true",
      examSettings: typeof examSettings === "string" ? (() => { try { return JSON.parse(examSettings); } catch { return undefined; } })() : (examSettings || undefined),
      relatedCourses: typeof relatedCourses === "string" ? (() => { try { return JSON.parse(relatedCourses); } catch { return []; } })() : (Array.isArray(relatedCourses) ? relatedCourses : []),
      relatedArticles: typeof relatedArticles === "string" ? (() => { try { return JSON.parse(relatedArticles); } catch { return []; } })() : (Array.isArray(relatedArticles) ? relatedArticles : []),
      popularChapterIds: typeof popularChapterIds === "string" ? (() => { try { return JSON.parse(popularChapterIds); } catch { return []; } })() : (Array.isArray(popularChapterIds) ? popularChapterIds : []),
    });
    await logActivity({ actor: req.user, action: "course.created", entityType: "course", entityId: course._id, entityTitle: course.title, description: "created", severity: "info", url: `/courses/${course._id}` });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error("[COURSES] createCourse error:", error);
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug is already in use by another course.",
      });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PATCH /api/v1/courses/:id
 * Update a course
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      "title",
      "subtitle",
      "techId",
      "level",
      "duration",
      "thumbnail",
      "learningOutcomes",
      "seoTitle",
      "seoDescription",
      "keywords",
      "canonicalUrl",
      "interviewSeoTitle",
      "interviewSeoDescription",
      "interviewKeywords",
      "interviewCanonicalUrl",
      "interviewOgImage",
      "order",
      "status",
      "slug",
      "examEnabled",
      "examSettings",
      "relatedCourses",
      "relatedArticles",
      "popularChapterIds",
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    if (req.file) {
      updates.thumbnail = `/uploads/articles/${req.file.filename}`;
    }

    if (req.body.learningOutcomes !== undefined) {
      updates.learningOutcomes = typeof req.body.learningOutcomes === "string"
        ? (() => { try { return JSON.parse(req.body.learningOutcomes); } catch { return []; } })()
        : req.body.learningOutcomes;
    }
    if (req.body.examSettings !== undefined) {
      updates.examSettings = typeof req.body.examSettings === "string"
        ? (() => { try { return JSON.parse(req.body.examSettings); } catch { return undefined; } })()
        : req.body.examSettings;
    }
    if (req.body.relatedCourses !== undefined) {
      updates.relatedCourses = typeof req.body.relatedCourses === "string"
        ? (() => { try { return JSON.parse(req.body.relatedCourses); } catch { return []; } })()
        : (Array.isArray(req.body.relatedCourses) ? req.body.relatedCourses : []);
    }
    if (req.body.relatedArticles !== undefined) {
      updates.relatedArticles = typeof req.body.relatedArticles === "string"
        ? (() => { try { return JSON.parse(req.body.relatedArticles); } catch { return []; } })()
        : (Array.isArray(req.body.relatedArticles) ? req.body.relatedArticles : []);
    }
    if (req.body.popularChapterIds !== undefined) {
      updates.popularChapterIds = typeof req.body.popularChapterIds === "string"
        ? (() => { try { return JSON.parse(req.body.popularChapterIds); } catch { return []; } })()
        : (Array.isArray(req.body.popularChapterIds) ? req.body.popularChapterIds : []);
    }
    if (req.body.examEnabled !== undefined) {
      updates.examEnabled = req.body.examEnabled === true || req.body.examEnabled === "true";
    }
    if (req.body.order !== undefined) {
      updates.order = Number(req.body.order) || 0;
    }

    if (req.body.keywords !== undefined) {
      updates.keywords = normalizeKeywords(req.body.keywords);
    }
    if (req.body.interviewKeywords !== undefined) updates.interviewKeywords = normalizeKeywords(req.body.interviewKeywords);

    const currentCourse = await Course.findById(id).lean();
    if (!currentCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    if (req.body.slug !== undefined) {
      const formattedSlug = slugify(req.body.slug);
      if (!formattedSlug) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid URL slug." });
      }
      const existing = await Course.findOne({
        slug: formattedSlug,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Slug is already in use by another course.",
        });
      }
      updates.slug = formattedSlug;
    }

    if (updates.canonicalUrl !== undefined || updates.slug !== undefined) {
      const targetSlug = updates.slug || currentCourse.slug;
      updates.canonicalUrl = formatCanonicalUrl(
        "/courses",
        updates.canonicalUrl !== undefined ? updates.canonicalUrl : currentCourse.canonicalUrl,
        targetSlug,
      );
    }

    if (updates.interviewCanonicalUrl !== undefined || updates.slug !== undefined) {
      const targetSlug = updates.slug || currentCourse.slug;
      updates.interviewCanonicalUrl = formatCanonicalUrl(
        `/${targetSlug}/interview-questions`,
        updates.interviewCanonicalUrl !== undefined ? updates.interviewCanonicalUrl : currentCourse.interviewCanonicalUrl,
        "",
      );
    }

    updates.updatedAt = new Date();

    const previous = currentCourse;
    const course = await Course.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }
    const seoChanged = ["seoTitle", "seoDescription", "keywords", "canonicalUrl", "interviewSeoTitle", "interviewSeoDescription"].some((key) => updates[key] !== undefined);
    await logActivity({ actor: req.user, action: seoChanged ? "course.seo_updated" : "course.updated", entityType: "course", entityId: course._id, entityTitle: course.title, description: seoChanged ? "changed SEO metadata for" : "updated", severity: seoChanged ? "important" : "info", before: previous ? { title: previous.title, status: previous.status } : undefined, after: { changedFields: Object.keys(updates).filter((key) => key !== "updatedAt") }, url: `/courses/${course._id}` });

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("[COURSES] updateCourse error:", error);
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug is already in use by another course.",
      });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/v1/courses/:id
 * Delete course and all its chapters
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    // Delete all associated chapters
    await Chapter.deleteMany({ course: id });
    await Course.findByIdAndDelete(id);
    await logActivity({ actor: req.user, action: "course.deleted", entityType: "course", entityId: course._id, entityTitle: course.title, description: "permanently deleted", severity: "critical", url: "/courses" });

    res
      .status(200)
      .json({ success: true, message: "Course and all chapters deleted." });
  } catch (error) {
    console.error("[COURSES] deleteCourse error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Chapter Admin Endpoints ───────────────────────────────────────────────────

/**
 * GET /api/v1/courses/:courseId/chapters
 * Get all chapters of a course (admin: all statuses)
 */
export const getChapters = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { search = "", status = "all", category = "all" } = req.query;
    const hasPagination =
      req.query.page !== undefined || req.query.limit !== undefined;
    const { page, limit, skip } = getPagination(req.query);
    const filter = { course: courseId };

    if (status !== "all") filter.status = status;
    if (category && category !== "all") {
      if (category === "none" || category === "uncategorized") {
        filter.category = null;
      } else {
        filter.category = category;
      }
    }

    if (search.trim()) {
      const expression = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { title: expression },
        { summary: expression },
        { slug: expression },
        { keywords: expression },
      ];
    }

    const total = await Chapter.countDocuments(filter);
    let query = Chapter.find(filter)
      .populate("category", "name slug")
      .sort({ order: 1, createdAt: -1 });
    if (hasPagination) query = query.skip(skip).limit(limit);
    const chapters = await query.lean();

    res.status(200).json({
      success: true,
      data: chapters,
      pagination: {
        page: hasPagination ? page : 1,
        limit: hasPagination ? limit : Math.max(total, 1),
        total,
        pages: hasPagination ? Math.max(Math.ceil(total / limit), 1) : 1,
      },
    });
  } catch (error) {
    console.error("[CHAPTERS] getChapters error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/v1/courses/:courseId/chapters
 * Create a chapter under a course
 */
export const createChapter = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      summary,
      content,
      codeSnippet,
      codeSnippets,
      language,
      tryItChallenge,
      order,
      status,
      seoTitle,
      seoDescription,
      keywords,
      canonicalUrl,
      category,
    } = req.body;

    if (!title || !summary) {
      return res.status(400).json({
        success: false,
        message: "title and summary are required.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    const baseSlug = slugify(req.body.slug || title);
    if (!baseSlug) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid URL slug." });
    }

    let slug = baseSlug;
    let counter = 2;
    while (await Chapter.exists({ course: courseId, slug })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    // Auto-assign order if not provided
    let chapterOrder = order;
    if (chapterOrder === undefined || chapterOrder === null) {
      const lastChapter = await Chapter.findOne({ course: courseId })
        .sort({ order: -1 })
        .lean();
      chapterOrder = lastChapter ? lastChapter.order + 1 : 0;
    }

    const finalCanonicalUrl = formatCanonicalUrl(
      `/${course.slug}`,
      canonicalUrl,
      slug,
    );

    const chapter = await Chapter.create({
      course: courseId,
      slug,
      title,
      summary,
      content: content || [],
      codeSnippet: codeSnippet || "",
      codeSnippets: codeSnippets || [],
      language: language || "javascript",
      tryItChallenge: tryItChallenge || "",
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
      keywords: normalizeKeywords(keywords),
      canonicalUrl: finalCanonicalUrl,
      category: category || null,
      order: chapterOrder,
      status: status || "published",
    });
    await logActivity({ actor: req.user, action: "chapter.created", entityType: "chapter", entityId: chapter._id, entityTitle: chapter.title, description: `added a chapter to ${course.title}:`, severity: "info", metadata: { courseId: course._id }, url: `/courses/${course._id}/chapters/${chapter._id}` });

    res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    console.error("[CHAPTERS] createChapter error:", error);
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug is already in use by another chapter in this course.",
      });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PATCH /api/v1/chapters/:id
 * Update a chapter
 */
export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      "title",
      "slug",
      "summary",
      "content",
      "codeSnippet",
      "codeSnippets",
      "language",
      "tryItChallenge",
      "seoTitle",
      "seoDescription",
      "keywords",
      "canonicalUrl",
      "category",
      "order",
      "status",
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const currentChapter = await Chapter.findById(id).select("course title status canonicalUrl slug").lean();
    if (!currentChapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found." });
    }

    if (req.body.keywords !== undefined) {
      updates.keywords = normalizeKeywords(req.body.keywords);
    }

    if (req.body.slug !== undefined) {
      const formattedSlug = slugify(req.body.slug);
      if (!formattedSlug) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid URL slug." });
      }

      const existing = await Chapter.exists({
        course: currentChapter.course,
        slug: formattedSlug,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Slug is already in use by another chapter in this course.",
        });
      }
      updates.slug = formattedSlug;
    }

    if (updates.canonicalUrl !== undefined || updates.slug !== undefined) {
      const parentCourse = await Course.findById(currentChapter.course).select("slug").lean();
      const targetSlug = updates.slug || currentChapter.slug;
      updates.canonicalUrl = formatCanonicalUrl(
        `/${parentCourse?.slug || ""}`,
        updates.canonicalUrl !== undefined ? updates.canonicalUrl : currentChapter.canonicalUrl,
        targetSlug,
      );
    }

    const chapter = await Chapter.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found." });
    }
    const seoChanged = ["seoTitle", "seoDescription", "keywords", "canonicalUrl"].some((key) => updates[key] !== undefined);
    await logActivity({ actor: req.user, action: seoChanged ? "chapter.seo_updated" : "chapter.updated", entityType: "chapter", entityId: chapter._id, entityTitle: chapter.title, description: seoChanged ? "changed SEO metadata for" : "updated", severity: seoChanged ? "important" : "info", before: { title: currentChapter.title, status: currentChapter.status }, after: { changedFields: Object.keys(updates).filter((key) => key !== "content") }, metadata: { courseId: chapter.course }, url: `/courses/${chapter.course}/chapters/${chapter._id}` });

    res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    console.error("[CHAPTERS] updateChapter error:", error);
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug is already in use by another chapter in this course.",
      });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/v1/chapters/:id
 * Delete a chapter
 */
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findByIdAndDelete(id);
    if (!chapter) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found." });
    }
    await logActivity({ actor: req.user, action: "chapter.deleted", entityType: "chapter", entityId: chapter._id, entityTitle: chapter.title, description: "permanently deleted", severity: "critical", metadata: { courseId: chapter.course }, url: `/courses/${chapter.course}` });
    res.status(200).json({ success: true, message: "Chapter deleted." });
  } catch (error) {
    console.error("[CHAPTERS] deleteChapter error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PATCH /api/v1/chapters/reorder
 * Bulk update chapter order
 * Body: { orders: [{ id, order }] }
 */
export const reorderChapters = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      return res
        .status(400)
        .json({ success: false, message: "orders array is required." });
    }

    const ops = orders.map(({ id, order }) =>
      Chapter.findByIdAndUpdate(id, { order }, { returnDocument: 'after' }),
    );
    await Promise.all(ops);

    res.status(200).json({ success: true, message: "Chapters reordered." });
  } catch (error) {
    console.error("[CHAPTERS] reorderChapters error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/v1/courses/chapters/:id/view
 * Public — atomically increment viewCount on a chapter.
 * Fire-and-forget from the frontend; returns 200 immediately.
 */
export const trackChapterView = async (req, res) => {
  try {
    const { id } = req.params;
    // Atomic increment — no race conditions
    await Chapter.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    // Silently fail — don't break the reader's experience
    console.error("[ANALYTICS] trackChapterView error:", error);
    res.status(200).json({ success: true }); // still 200 to not alarm frontend
  }
};

/**
 * GET /api/v1/courses/analytics/overview
 * Admin-only — returns aggregated view stats across all courses & chapters.
 */
export const getCourseAnalytics = async (req, res) => {
  try {
    // 1. All chapters with their view counts and course references
    const chapters = await Chapter.find({})
      .select("title slug course viewCount status createdAt")
      .lean();

    // 2. All courses
    const courses = await Course.find({})
      .select("title slug techId status")
      .lean();

    // Build a courseId → course map
    const courseMap = {};
    courses.forEach((c) => {
      courseMap[c._id.toString()] = c;
    });

    // 3. Enrich chapters with course info
    const enrichedChapters = chapters.map((ch) => ({
      ...ch,
      courseName: courseMap[ch.course?.toString()]?.title || "Unknown",
      courseSlug: courseMap[ch.course?.toString()]?.slug || "",
      courseTechId: courseMap[ch.course?.toString()]?.techId || "",
    }));

    // 4. Top 20 most-viewed chapters
    const topChapters = [...enrichedChapters]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 20);

    // 5. Per-course totals
    const courseTotals = {};
    enrichedChapters.forEach((ch) => {
      const key = ch.course?.toString();
      if (!key) return;
      if (!courseTotals[key]) {
        courseTotals[key] = {
          courseId: key,
          courseName: ch.courseName,
          courseSlug: ch.courseSlug,
          techId: ch.courseTechId,
          totalViews: 0,
          chapterCount: 0,
          publishedChapters: 0,
        };
      }
      courseTotals[key].totalViews += ch.viewCount || 0;
      courseTotals[key].chapterCount += 1;
      if (ch.status === "published") courseTotals[key].publishedChapters += 1;
    });

    const courseStats = Object.values(courseTotals).sort(
      (a, b) => b.totalViews - a.totalViews,
    );

    // 6. Chapters with zero views (content that hasn't been read yet)
    const zeroViewChapters = enrichedChapters
      .filter((ch) => !ch.viewCount && ch.status === "published")
      .slice(0, 20);

    // 7. Summary totals
    const totalViews = enrichedChapters.reduce(
      (sum, ch) => sum + (ch.viewCount || 0),
      0,
    );
    const totalChapters = enrichedChapters.length;
    const publishedChapters = enrichedChapters.filter(
      (ch) => ch.status === "published",
    ).length;
    const avgViewsPerChapter =
      totalChapters > 0 ? Math.round(totalViews / totalChapters) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalViews,
          totalChapters,
          publishedChapters,
          totalCourses: courses.length,
          avgViewsPerChapter,
        },
        topChapters,
        courseStats,
      },
    });
  } catch (error) {
    console.error("[ANALYTICS] getCourseAnalytics error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
