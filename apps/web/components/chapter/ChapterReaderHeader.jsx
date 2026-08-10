"use client";

import React from "react";
import { Clock, Check, Bookmark } from "lucide-react";

export default function ChapterReaderHeader({
  chapter,
  currentChapterIndex,
  allChaptersCount,
  estimatedReadingTime,
  isCurrentCompleted,
  toggleChapterComplete,
  isCurrentSaved,
  toggleSaveLecture,
  isFocusMode,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Lesson {currentChapterIndex + 1} of {allChaptersCount}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            {estimatedReadingTime} min read
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark as Done Toggle Button */}
          <button
            onClick={() => toggleChapterComplete(chapter?.slug)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isCurrentCompleted
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isCurrentCompleted ? "Completed" : "Mark Done"}</span>
          </button>

          {/* Save Lecture Toggle Button */}
          <button
            onClick={toggleSaveLecture}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isCurrentSaved
                ? "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            }`}
            title={
              isCurrentSaved
                ? "Remove from saved lectures"
                : "Save lecture for later"
            }
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${isCurrentSaved ? "fill-current" : ""}`}
            />
            <span>{isCurrentSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      <h1
        className={`font-black text-foreground tracking-tight ${
          isFocusMode ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl"
        }`}
      >
        {chapter?.title}
      </h1>

      {chapter?.summary && (
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium pb-4 border-b border-zinc-100 dark:border-zinc-800">
          {chapter.summary}
        </p>
      )}
    </div>
  );
}
