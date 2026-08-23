"use client";

// ASIF_COURSE_LEARNING_FLOW_V1
import { useCallback, useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
const STAGES = ["learn", "revise", "practice", "build"];
const WEIGHTS = { learn: 40, revise: 25, practice: 25, build: 10 };
const localKey = (slug) =>
  `asif_course_progress_${String(slug || "").toLowerCase()}`;
const oldKey = (slug) => `course_completed_${String(slug || "")}`;
const asId = (value) => String(value?._id || value || "");

// ASIF_QUESTION_LEARNING_MAPPING_V1:web-availability
export const chapterAvailability = (chapter) => {
  const build = chapter?.learningActivities?.build || {};
  const mapped = chapter?.learningAvailability || {};
  return {
    learn: true,
    revise: Number(mapped.reviseCount || 0) > 0,
    practice:
      Number(mapped.practiceCount || 0) > 0 ||
      Boolean(String(chapter?.tryItChallenge || "").trim()),
    build:
      mapped.build !== undefined
        ? Boolean(mapped.build)
        : Boolean(
            build.enabled &&
            (String(build.title || "").trim() ||
              String(build.description || "").trim()),
          ),
  };
};

function readLocal(courseSlug, chapters = []) {
  if (typeof window === "undefined" || !courseSlug) return { chapters: {} };
  try {
    const raw = localStorage.getItem(localKey(courseSlug));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (!parsed.chapters) parsed.chapters = {};
        return parsed;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return { chapters: {} };
}

function writeLocal(courseSlug, value) {
  if (typeof window === "undefined" || !courseSlug) return;
  localStorage.setItem(
    localKey(courseSlug),
    JSON.stringify({ ...value, updatedAt: new Date().toISOString() }),
  );
}

function localSummary(courseSlug, chapters = []) {
  const stored = readLocal(courseSlug, chapters);
  const chapterProgress = chapters.map((chapter) => {
    const key = asId(chapter._id) || chapter.slug;
    const value = stored.chapters[key] || stored.chapters[chapter.slug] || {};
    const availability = chapterAvailability(chapter);
    const stages = {};
    for (const stage of STAGES) {
      const source = value?.[stage] || {};
      stages[stage] = {
        completed: Boolean(source.completed),
        score: Number(source.score || 0),
        attempts: Number(source.attempts || 0),
        completedAt: source.completedAt || null,
        percent: availability[stage] ? stagePercent(stage, source) : 0,
      };
    }
    const available = STAGES.filter((stage) => availability[stage]);
    const totalWeight = available.reduce(
      (sum, stage) => sum + WEIGHTS[stage],
      0,
    );
    const masteryScore = totalWeight
      ? Math.round(
          available.reduce(
            (sum, stage) => sum + stages[stage].percent * WEIGHTS[stage],
            0,
          ) / totalWeight,
        )
      : 0;
    return {
      chapter: {
        _id: chapter._id,
        slug: chapter.slug,
        title: chapter.title,
        summary: chapter.summary,
        order: chapter.order,
      },
      availability,
      stages,
      masteryScore,
      lastActivityAt: value.lastActivityAt || null,
    };
  });
  const overallProgress = chapterProgress.length
    ? Math.round(
        chapterProgress.reduce((sum, item) => sum + item.masteryScore, 0) /
          chapterProgress.length,
      )
    : 0;
  const incomplete = (item) =>
    STAGES.some(
      (stage) =>
        item.availability[stage] && !satisfied(stage, item.stages[stage]),
    );
  const target =
    chapterProgress.find(
      (item) =>
        asId(item.chapter._id) === String(stored.lastChapterId) &&
        incomplete(item),
    ) || chapterProgress.find(incomplete);
  let nextAction = null;
  if (target) {
    const stage = STAGES.find(
      (name) =>
        target.availability[name] && !satisfied(name, target.stages[name]),
    );
    const id = asId(target.chapter._id);
    if (stage)
      nextAction = {
        stage,
        chapter: target.chapter,
        href:
          // ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:local-next-route
          stage === "learn"
            ? `/${courseSlug}/${target.chapter.slug}`
            : `/${courseSlug}/${target.chapter.slug}/${stage}`,
        label:
          stage === "learn"
            ? "Continue reading"
            : stage === "revise"
              ? "Revise this chapter"
              : stage === "practice"
                ? "Practice this chapter"
                : "Build with this chapter",
      };
  }
  return {
    source: "local",
    overallProgress,
    completedChapters: chapterProgress
      .filter((item) => satisfied("learn", item.stages.learn))
      .map((item) => item.chapter.slug),
    chapterProgress,
    nextAction,
  };
}

function normalize(summary) {
  return {
    ...summary,
    chapterMap: Object.fromEntries(
      (summary?.chapterProgress || []).map((item) => [
        asId(item.chapter?._id),
        item,
      ]),
    ),
  };
}

async function request(path, options = {}) {
  if (!API) {
    const error = new Error("NEXT_PUBLIC_API_URL is not configured.");
    error.status = 0;
    throw error;
  }
  const response = await fetch(`${API.replace(/\/$/, "")}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.message || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return body?.data || {};
}

async function loadServerOrLocal(courseSlug, chapters) {
  const local = readLocal(courseSlug, chapters);
  try {
    let server = await request(
      `/courses/${encodeURIComponent(courseSlug)}/progress`,
    );
    const localItems = Object.values(local.chapters || {});
    if (localItems.length) {
      try {
        server = await request(
          `/courses/${encodeURIComponent(courseSlug)}/progress/merge`,
          { method: "POST", body: JSON.stringify({ chapters: localItems }) },
        );
        localStorage.removeItem(localKey(courseSlug));
        localStorage.removeItem(oldKey(courseSlug));
      } catch {}
    }
    return normalize({ ...server, source: "server" });
  } catch {
    return normalize(localSummary(courseSlug, chapters));
  }
}

export async function recordCourseStage({
  courseSlug,
  chapterId,
  chapterSlug,
  stage,
  completed,
  score,
  chapter,
}) {
  const identity = chapterSlug || chapterId;
  if (!courseSlug || !identity || !STAGES.includes(stage)) return null;
  try {
    const server = await request(
      `/courses/${encodeURIComponent(courseSlug)}/chapters/${encodeURIComponent(identity)}/progress`,
      {
        method: "PATCH",
        body: JSON.stringify({
          stage,
          ...(completed !== undefined ? { completed } : {}),
          ...(score !== undefined ? { score } : {}),
        }),
      },
    );
    if (typeof window !== "undefined")
      window.dispatchEvent(
        new CustomEvent("asif-course-progress-updated", {
          detail: { courseSlug },
        }),
      );
    return normalize({ ...server, source: "server" });
  } catch {
    if (typeof window === "undefined") return null;
    const stored = readLocal(courseSlug, chapter ? [chapter] : []);
    const key = String(chapterId || chapter?._id || chapterSlug);
    const previous = stored.chapters[key] || {};
    const stageValue = previous[stage] || {};
    stored.chapters[key] = {
      ...previous,
      chapterId: String(chapterId || chapter?._id || ""),
      chapterSlug: chapterSlug || chapter?.slug || "",
      [stage]: {
        ...stageValue,
        ...(completed !== undefined
          ? {
              completed: Boolean(completed),
              completedAt: completed
                ? stageValue.completedAt || new Date().toISOString()
                : null,
            }
          : {}),
        ...(score !== undefined
          ? {
              score: Math.min(100, Math.max(0, Number(score) || 0)),
              attempts: Number(stageValue.attempts || 0) + 1,
              ...(completed === undefined
                ? { completed: Number(score) >= 70 }
                : {}),
            }
          : {}),
      },
      lastActivityAt: new Date().toISOString(),
    };
    stored.lastChapterId = key;
    writeLocal(courseSlug, stored);
    window.dispatchEvent(
      new CustomEvent("asif-course-progress-updated", {
        detail: { courseSlug },
      }),
    );
    return null;
  }
}

export function useCourseProgress(courseSlug, chapters = []) {
  const stableChapters = useMemo(() => chapters || [], [chapters]);
  const [state, setState] = useState(() => ({
    ...normalize({
      source: "local",
      overallProgress: 0,
      completedChapters: [],
      chapterProgress: [],
      nextAction: null,
    }),
    loading: true,
  }));
  const refresh = useCallback(async () => {
    if (!courseSlug) {
      setState((current) => ({ ...current, loading: false }));
      return;
    }
    const next = await loadServerOrLocal(courseSlug, stableChapters);
    setState({ ...next, loading: false });
  }, [courseSlug, stableChapters]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    const handler = (event) => {
      if (!event?.detail?.courseSlug || event.detail.courseSlug === courseSlug)
        refresh();
    };
    window.addEventListener("asif-course-progress-updated", handler);
    return () =>
      window.removeEventListener("asif-course-progress-updated", handler);
  }, [courseSlug, refresh]);
  const markStage = useCallback(
    async (chapter, stage, options = {}) => {
      await recordCourseStage({
        courseSlug,
        chapterId: chapter?._id,
        chapterSlug: chapter?.slug,
        stage,
        chapter,
        ...options,
      });
      await refresh();
    },
    [courseSlug, refresh],
  );
  return { ...state, refresh, markStage };
}
