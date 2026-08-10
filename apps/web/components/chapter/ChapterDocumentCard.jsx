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
  isCurrentSaved,
  toggleSaveLecture,
  isFocusMode,
  isSimplePoints,
  parsedBlocks,
  fontBodyClass,
}) {
  return (
    <div
      className={`rounded-none sm:rounded-[2.5rem] bg-transparent sm:bg-white dark:sm:bg-zinc-900/90 border-0 sm:border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-4 sm:gap-6 transition-all ${
        isFocusMode
          ? "px-2 py-2 sm:p-12 shadow-none sm:shadow-xl"
          : "px-2 py-2 sm:p-10 shadow-none sm:shadow-xs"
      }`}
    >
      <ChapterReaderHeader
        chapter={chapter}
        currentChapterIndex={currentChapterIndex}
        allChaptersCount={allChaptersCount}
        estimatedReadingTime={estimatedReadingTime}
        isCurrentCompleted={isCurrentCompleted}
        toggleChapterComplete={toggleChapterComplete}
        isCurrentSaved={isCurrentSaved}
        toggleSaveLecture={toggleSaveLecture}
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
