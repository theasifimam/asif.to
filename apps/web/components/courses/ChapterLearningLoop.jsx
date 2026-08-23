"use client";

import Link from "next/link";
import { BookOpen, Brain, CheckCircle2, Hammer, Layers } from "lucide-react";

// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1
const STAGES = [
  ["learn", "Learn", BookOpen],
  ["revise", "Revise", Layers],
  ["practice", "Practice", Brain],
  ["build", "Build", Hammer],
];

const isDone = (stage, value = {}) =>
  ["revise", "practice"].includes(stage)
    ? Boolean(value.completed) || Number(value.score) >= 70
    : Boolean(value.completed);

const hrefFor = (course, chapter, stage) =>
  stage === "learn"
    ? `/${encodeURIComponent(course)}/${encodeURIComponent(chapter)}`
    : `/${encodeURIComponent(course)}/${encodeURIComponent(chapter)}/${stage}`;

export default function ChapterLearningLoop({ courseSlug, chapter, progress }) {
  if (!chapter) return null;

  const mapped = chapter.learningAvailability || {};
  const build = chapter.learningActivities?.build || {};

  const fallback = {
    learn: true,
    revise: Number(mapped.reviseCount || 0) > 0,
    practice:
      Number(mapped.practiceCount || 0) > 0 ||
      Boolean(String(chapter.tryItChallenge || "").trim()),
    build: Boolean(
      mapped.build ??
        (build.enabled &&
          (String(build.title || "").trim() ||
            String(build.description || "").trim())),
    ),
  };

  const availability = progress?.availability || fallback;
  const visible = STAGES.filter(([key]) => availability[key]);

  if (!visible.length) return null;

  return (
    <section
      id="chapter-learning-loop"
      className="scroll-mt-28 rounded-[2rem] border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Complete this chapter
          </p>
          <h2 className="mt-1 text-xl font-black">
            {visible.map(([, label]) => label).join(" → ")}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Only activities available for this chapter are shown.
          </p>
        </div>
        <span className="text-xs font-black text-zinc-400">
          {progress?.masteryScore || 0}% chapter mastery
        </span>
      </div>

      <div className={`mt-5 grid gap-3 ${visible.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {visible.map(([key, label, Icon]) => {
          const value = progress?.stages?.[key] || {};
          const done = isDone(key, value);
          const count =
            key === "revise"
              ? Number(mapped.reviseCount || 0)
              : key === "practice"
                ? Number(mapped.practiceCount || 0)
                : 0;

          return (
            <div
              key={key}
              className={`rounded-3xl border p-4 ${
                done
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-500/5"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-xl ${
                      done
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="text-xs font-black">{label}</div>
                    {Number(value.score) > 0 && (
                      <div className="text-[10px] font-bold text-zinc-400">
                        Best score {value.score}%
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase ${done ? "text-emerald-600" : "text-zinc-400"}`}>
                  {done ? "Done" : key === "learn" ? "Current" : "Available"}
                </span>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-zinc-500">
                {key === "learn" && "Read and understand the chapter content."}
                {key === "revise" && "Recall only the revision cards mapped to this chapter."}
                {key === "practice" && "Practice only questions and challenges from this chapter."}
                {key === "build" && "Apply this chapter in its focused build challenge."}
              </p>

              {count > 0 && (
                <p className="mt-2 text-[10px] font-black text-zinc-400">
                  {count} {key === "revise" ? "mapped cards" : "mapped questions"}
                </p>
              )}

              {key === "build" && build.estimatedMinutes > 0 && (
                <p className="mt-2 text-[10px] font-black text-zinc-400">
                  ~{build.estimatedMinutes} minutes
                </p>
              )}

              {key === "learn" ? (
                <p className="mt-3 text-[10px] font-bold text-blue-600">
                  Use “Mark Done” above when the lesson is clear.
                </p>
              ) : (
                <Link
                  href={hrefFor(courseSlug, chapter.slug, key)}
                  className="mt-3 inline-flex rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white hover:bg-blue-700"
                >
                  {done ? `${label} again` : `Start ${label.toLowerCase()}`} →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
