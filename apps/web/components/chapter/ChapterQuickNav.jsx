"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";

export default function ChapterQuickNav({
  courseId,
  prevChapter,
  nextChapter,
  examEnabled = false,
  variant = "top",
}) {
  if (variant === "top") {
    return (
      <div className="flex items-center justify-between p-2.5 sm:p-4 rounded-4xl sm:rounded-4xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-bold gap-2">
        {prevChapter ? (
          <Link
            href={`/${courseId}/${prevChapter.slug}`}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline max-w-[48%]"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">
              Prev: {prevChapter.title?.split(". ")[1] || prevChapter.title}
            </span>
          </Link>
        ) : (
          <span className="text-zinc-400 font-medium text-[11px] sm:text-xs">
            Start of Course
          </span>
        )}

        {nextChapter ? (
          <Link
            href={`/${courseId}/${nextChapter.slug}`}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline max-w-[48%] justify-end text-right ml-auto"
          >
            <span className="line-clamp-1">
              Next: {nextChapter.title?.split(". ")[1] || nextChapter.title}
            </span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Link>
        ) : examEnabled ? (
          <Link
            href={`/courses/${courseId}/final-exam`}
            className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline max-w-[48%] justify-end text-right ml-auto font-bold text-[11px] sm:text-xs"
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Take Final Exam</span>
          </Link>
        ) : (
          <span className="text-zinc-400 font-bold text-[11px] sm:text-xs">
            Final Exam Coming Soon
          </span>
        )}
      </div>
    );
  }

  // Bottom variant
  return (
    <div className="flex items-center justify-between p-3.5 sm:p-5 rounded-4xl sm:rounded-4xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-bold gap-2">
      {prevChapter ? (
        <Link
          href={`/${courseId}/${prevChapter.slug}`}
          className="flex items-center gap-1.5 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95 text-[11px] sm:text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Link>
      ) : (
        <div />
      )}

      {nextChapter ? (
        <Link
          href={`/${courseId}/${nextChapter.slug}`}
          className="flex items-center gap-1.5 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/25 active:scale-95 text-[11px] sm:text-xs"
        >
          <span>Next Lesson</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : examEnabled ? (
        /* Last chapter of a course with exam — show Final Exam CTA */
        <Link
          href={`/courses/${courseId}/final-exam`}
          className="flex items-center gap-1.5 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all shadow-md shadow-blue-500/25 active:scale-95 text-[11px] sm:text-xs"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Take Final Exam</span>
        </Link>
      ) : (
        <div
          className="flex items-center gap-1.5 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-bold text-[11px] sm:text-xs cursor-not-allowed"
          aria-disabled="true"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Exam Coming Soon</span>
        </div>
      )}
    </div>
  );
}
