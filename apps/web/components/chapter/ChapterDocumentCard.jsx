"use client";

import React from "react";
import ChapterReaderHeader from "./ChapterReaderHeader";
import ChapterBlocksRenderer from "./ChapterBlocksRenderer";

export default function ChapterDocumentCard({
  chapter,
  currentChapterIndex,
  allChaptersCount,
  estimatedReadingTime,
  isCurrentCompleted,
  toggleChapterComplete,
  isFocusMode,
  isSimplePoints,
  parsedBlocks,
  fontBodyClass,
}) {
  return (
    <div
      className={`flex flex-col gap-4 p-5 sm:p-8 sm:gap-6 rounded-3xl sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs transition-all ${
        isFocusMode
          ? "sm:py-10"
          : ""
      }`}
    >
      <ChapterReaderHeader
        chapter={chapter}
        currentChapterIndex={currentChapterIndex}
        allChaptersCount={allChaptersCount}
        estimatedReadingTime={estimatedReadingTime}
        isCurrentCompleted={isCurrentCompleted}
        toggleChapterComplete={toggleChapterComplete}
        isFocusMode={isFocusMode}
      />

      <ChapterBlocksRenderer
        chapter={chapter}
        isSimplePoints={isSimplePoints}
        parsedBlocks={parsedBlocks}
        fontBodyClass={fontBodyClass}
      />
    </div>
  );
}
