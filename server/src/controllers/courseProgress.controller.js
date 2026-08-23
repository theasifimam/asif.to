import mongoose from "mongoose";
import Chapter from "../models/Chapter.js";
import Course from "../models/Course.js";
import CourseProgress from "../models/CourseProgress.js";
import Question from "../models/Question.js";
import { COURSE_STAGES, summarizeCourseProgress } from "../services/courseProgress.service.js";

// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:progress-availability
async function withLearningAvailability(courseId, chapters = []) {
  if (!chapters.length) return chapters;
  const ids = chapters.map((chapter) => chapter._id);
  const rows = await Question.aggregate([
    {
      $match: {
        type: "quiz",
        status: "published",
        learningMappings: {
          $elemMatch: {
            course: courseId,
            chapter: { $in: ids },
            $or: [
              { source: { $in: ["manual", "legacy"] } },
              { source: "auto", confidence: { $gte: 75 } },
            ],
          },
        },
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
          $sum: { $cond: [{ $ne: ["$flashcardEnabled", false] }, 1, 0] },
        },
        practiceCount: {
          $sum: { $cond: [{ $ne: ["$quizEnabled", false] }, 1, 0] },
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

// ASIF_COURSE_LEARNING_FLOW_V1
const fail = (res, status, message) => res.status(status).json({ success: false, message });
const chapterSelect = "title slug summary order tryItChallenge relatedQuestions learningActivities status";

async function resolveCourse(value) {
  if (mongoose.isValidObjectId(value)) return Course.findOne({ _id: value, status: "published" }).lean();
  return Course.findOne({ status: "published", $or: [{ slug: value }, { techId: value }] }).lean();
}

async function resolveChapter(courseId, value) {
  const query = { course: courseId, status: "published" };
  if (mongoose.isValidObjectId(value)) query._id = value;
  else query.slug = value;
  return Chapter.findOne(query).select(chapterSelect).lean();
}

function blankChapter(chapterId) {
  return { chapter: chapterId, learn: {}, revise: {}, practice: {}, build: {}, lastActivityAt: new Date() };
}

function findEntry(progress, chapterId) {
  return progress.chapters.find((item) => String(item.chapter) === String(chapterId));
}

async function summaryFor(progress, course) {
  const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();
  const decorated = await withLearningAvailability(course._id, chapters);
  return summarizeCourseProgress({ course, chapters: decorated, progress });
}

export const getCourseProgress = async (req, res) => {
  try {
    const course = await resolveCourse(req.params.slug);
    if (!course) return fail(res, 404, "Course not found.");
    const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();
    const decorated = await withLearningAvailability(course._id, chapters);
    const progress = await CourseProgress.findOne({ user: req.user._id, course: course._id }).lean();
    res.json({ success: true, data: summarizeCourseProgress({ course, chapters: decorated, progress }) });
  } catch (error) {
    console.error("[COURSE_PROGRESS] getCourseProgress:", error);
    fail(res, 500, "Unable to load course progress.");
  }
};

export const updateCourseChapterProgress = async (req, res) => {
  try {
    const { stage, completed, score } = req.body || {};
    if (!COURSE_STAGES.includes(stage)) return fail(res, 400, "Invalid course learning stage.");
    const course = await resolveCourse(req.params.slug);
    if (!course) return fail(res, 404, "Course not found.");
    const chapter = await resolveChapter(course._id, req.params.chapterSlug);
    if (!chapter) return fail(res, 404, "Chapter not found.");

    let progress = await CourseProgress.findOne({ user: req.user._id, course: course._id });
    if (!progress) progress = new CourseProgress({ user: req.user._id, course: course._id, chapters: [] });
    let entry = findEntry(progress, chapter._id);
    if (!entry) {
      progress.chapters.push(blankChapter(chapter._id));
      entry = progress.chapters[progress.chapters.length - 1];
    }

    const now = new Date();
    const target = entry[stage];
    if (score !== undefined && score !== null && score !== "") {
      const normalized = Math.min(100, Math.max(0, Number(score) || 0));
      target.score = normalized;
      target.attempts = Number(target.attempts || 0) + 1;
      if (completed === undefined) target.completed = normalized >= 70;
    }
    if (completed !== undefined) target.completed = Boolean(completed);
    target.completedAt = target.completed ? target.completedAt || now : null;
    target.updatedAt = now;
    entry.lastActivityAt = now;
    progress.lastActivityAt = now;
    progress.lastChapter = chapter._id;

    const summary = await summaryFor(progress, course);
    progress.overallProgress = summary.overallProgress;
    await progress.save();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("[COURSE_PROGRESS] updateCourseChapterProgress:", error);
    fail(res, 500, "Unable to update course progress.");
  }
};

export const mergeAnonymousCourseProgress = async (req, res) => {
  try {
    const course = await resolveCourse(req.params.slug);
    if (!course) return fail(res, 404, "Course not found.");
    const incoming = Array.isArray(req.body?.chapters) ? req.body.chapters : [];
    let progress = await CourseProgress.findOne({ user: req.user._id, course: course._id });
    if (!progress) progress = new CourseProgress({ user: req.user._id, course: course._id, chapters: [] });

    for (const item of incoming.slice(0, 500)) {
      const identity = item?.chapterId || item?.chapterSlug;
      if (!identity) continue;
      const chapter = await resolveChapter(course._id, identity);
      if (!chapter) continue;
      let entry = findEntry(progress, chapter._id);
      if (!entry) {
        progress.chapters.push(blankChapter(chapter._id));
        entry = progress.chapters[progress.chapters.length - 1];
      }
      for (const stage of COURSE_STAGES) {
        const source = item?.[stage];
        if (!source || typeof source !== "object") continue;
        const target = entry[stage];
        if (source.completed === true) {
          target.completed = true;
          target.completedAt = target.completedAt || (source.completedAt ? new Date(source.completedAt) : new Date());
        }
        if (Number(source.score) > Number(target.score || 0)) target.score = Math.min(100, Math.max(0, Number(source.score) || 0));
        target.attempts = Math.max(Number(target.attempts || 0), Number(source.attempts || 0));
        target.updatedAt = new Date();
      }
      entry.lastActivityAt = item.lastActivityAt ? new Date(item.lastActivityAt) : new Date();
      progress.lastChapter = chapter._id;
      progress.lastActivityAt = new Date();
    }
    const summary = await summaryFor(progress, course);
    progress.overallProgress = summary.overallProgress;
    await progress.save();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("[COURSE_PROGRESS] mergeAnonymousCourseProgress:", error);
    fail(res, 500, "Unable to merge local course progress.");
  }
};

export const getMyCourseProgressSummary = async (req, res) => {
  try {
    const docs = await CourseProgress.find({ user: req.user._id }).sort({ lastActivityAt: -1 }).populate("course", "title slug techId status").lean();
    const courses = [];
    for (const progress of docs.slice(0, 25)) {
      const course = progress.course;
      if (!course || course.status !== "published") continue;
      const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();
      const decorated = await withLearningAvailability(course._id, chapters);
      courses.push(summarizeCourseProgress({ course, chapters: decorated, progress }));
    }
    const overallProgress = courses.length ? Math.round(courses.reduce((sum, item) => sum + item.overallProgress, 0) / courses.length) : 0;
    res.json({ success: true, data: { overallProgress, activeCourses: courses.length, current: courses[0] || null, courses } });
  } catch (error) {
    console.error("[COURSE_PROGRESS] getMyCourseProgressSummary:", error);
    fail(res, 500, "Unable to load learning summary.");
  }
};
