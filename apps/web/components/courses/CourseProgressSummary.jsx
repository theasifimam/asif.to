"use client";
// ASIF_COURSE_LEARNING_FLOW_V1
import Link from "next/link";
const STAGES = [
  ["learn", "Learn"],
  ["revise", "Revise"],
  ["practice", "Practice"],
  ["build", "Build"],
];

export default function CourseProgressSummary({ course, progress }) {
  if (!course || progress?.loading) return null;
  const next = progress?.nextAction;
  const percent = progress?.overallProgress || 0;
  return (
    <section className="rounded-4xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Your course progress
              </p>
              <h2 className="mt-1 text-lg font-black">
                Learn → Revise → Practice → Build
              </h2>
            </div>
            <span className="text-2xl font-black">{percent}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STAGES.map(([key, label]) => (
              <span
                key={key}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black text-zinc-500 dark:bg-zinc-800"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="sm:w-64">
          {next ? (
            <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-500/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">
                Continue learning
              </p>
              <p className="mt-1 line-clamp-1 text-xs font-black">
                {next.chapter?.title}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">{next.label}</p>
              <Link
                href={next.href}
                className="mt-3 inline-flex rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white"
              >
                Continue →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Course learning loop complete.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ChapterStageProgress({ progress }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {/* ASIF_QUESTION_LEARNING_MAPPING_V1:summary-hide */}
      {STAGES.filter(([key]) => progress?.availability?.[key]).map(
        ([key, label]) => {
          const available = progress?.availability?.[key];
          const percent = progress?.stages?.[key]?.percent || 0;
          const done = available && percent >= 70;
          return (
            <span
              key={key}
              className={`rounded-full px-2.5 py-1 text-[9px] font-black ${!available ? "bg-zinc-100 text-zinc-400 opacity-55 dark:bg-zinc-800" : done ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"}`}
            >
              {done ? "✓ " : available ? "○ " : "— "}
              {label}
              {available && percent > 0 && percent < 100 ? ` ${percent}%` : ""}
            </span>
          );
        },
      )}
    </div>
  );
}
