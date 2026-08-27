// ASIF_COURSE_LEARNING_FLOW_V1
export const COURSE_STAGE_WEIGHTS = Object.freeze({
  learn: 40,
  revise: 25,
  practice: 25,
  build: 10,
});

export const COURSE_STAGES = Object.freeze(["learn", "revise", "practice", "build"]);

const clamp = (value) => Math.min(100, Math.max(0, Number(value) || 0));
const ids = (value) => Array.isArray(value)
  ? value.map((item) => String(item?._id || item)).filter(Boolean)
  : [];

export const chapterQuestionIds = (chapter, stage) => {
  const learning = chapter?.learningActivities || {};
  const configured = stage === "revise"
    ? ids(learning.revisionQuestions)
    : ids(learning.practiceQuestions);
  return configured.length ? configured : ids(chapter?.relatedQuestions);
};

// ASIF_QUESTION_LEARNING_MAPPING_V1:progress-availability
export const chapterStageAvailability = (chapter) => {
  const build=chapter?.learningActivities?.build||{};
  const mapped=chapter?.learningAvailability||{};
  return { learn:true, revise:Number(mapped.reviseCount||0)>0, practice:Number(mapped.practiceCount||0)>0 || Boolean(String(chapter?.tryItChallenge||"").trim()), build:mapped.build!==undefined ? Boolean(mapped.build) : Boolean((Array.isArray(chapter?.codingProblems)&&chapter.codingProblems.length)||(build.enabled&&(String(build.title||"").trim()||String(build.description||"").trim()))) };
};

const stagePercent = (stage, value = {}) => {
  if (["revise", "practice"].includes(stage) && Number(value.score) > 0) return clamp(value.score);
  return value.completed ? 100 : 0;
};

export const stageSatisfied = (stage, value = {}) =>
  ["revise", "practice"].includes(stage)
    ? Boolean(value.completed) || Number(value.score) >= 70
    : Boolean(value.completed);

export const chapterProgressSnapshot = (chapter, progress = {}) => {
  const availability = chapterStageAvailability(chapter);
  const stages = {};
  for (const stage of COURSE_STAGES) {
    stages[stage] = {
      completed: Boolean(progress?.[stage]?.completed),
      score: clamp(progress?.[stage]?.score || 0),
      attempts: Number(progress?.[stage]?.attempts || 0),
      completedAt: progress?.[stage]?.completedAt || null,
      percent: availability[stage] ? stagePercent(stage, progress?.[stage] || {}) : 0,
    };
  }
  const available = COURSE_STAGES.filter((stage) => availability[stage]);
  const weight = available.reduce((sum, stage) => sum + COURSE_STAGE_WEIGHTS[stage], 0);
  const masteryScore = weight ? Math.round(available.reduce(
    (sum, stage) => sum + stages[stage].percent * COURSE_STAGE_WEIGHTS[stage], 0,
  ) / weight) : 0;
  return { availability, stages, masteryScore };
};

export const summarizeCourseProgress = ({ course, chapters = [], progress }) => {
  const byChapter = new Map((progress?.chapters || []).map((item) => [String(item.chapter?._id || item.chapter), item]));
  const chapterProgress = chapters.map((chapter) => {
    const stored = byChapter.get(String(chapter._id)) || {};
    return {
      chapter: { _id: chapter._id, slug: chapter.slug, title: chapter.title, summary: chapter.summary, order: chapter.order },
      ...chapterProgressSnapshot(chapter, stored),
      lastActivityAt: stored.lastActivityAt || null,
    };
  });

  const overallProgress = chapterProgress.length
    ? Math.round(chapterProgress.reduce((sum, item) => sum + item.masteryScore, 0) / chapterProgress.length)
    : 0;
  const incomplete = (item) => COURSE_STAGES.some((stage) => item.availability[stage] && !stageSatisfied(stage, item.stages[stage]));
  const lastId = String(progress?.lastChapter?._id || progress?.lastChapter || "");
  const target = chapterProgress.find((item) => String(item.chapter._id) === lastId && incomplete(item)) || chapterProgress.find(incomplete);
  let nextAction = null;
  if (target) {
    const stage = COURSE_STAGES.find((name) => target.availability[name] && !stageSatisfied(name, target.stages[name]));
    if (stage) {
      const chapterId = String(target.chapter._id);
      // ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:next-route
      const href = stage === "learn"
        ? `/${course.slug}/${target.chapter.slug}`
        : `/${course.slug}/${target.chapter.slug}/${stage}`;
      nextAction = {
        stage,
        chapter: target.chapter,
        href,
        label: stage === "learn" ? "Continue reading" : stage === "revise" ? "Revise this chapter" : stage === "practice" ? "Practice this chapter" : "Build with this chapter",
      };
    }
  }
  return {
    course: { _id: course._id, slug: course.slug, title: course.title, techId: course.techId },
    overallProgress,
    completedChapters: chapterProgress.filter((item) => stageSatisfied("learn", item.stages.learn)).map((item) => item.chapter.slug),
    chapterProgress,
    nextAction,
    lastActivityAt: progress?.lastActivityAt || null,
  };
};
