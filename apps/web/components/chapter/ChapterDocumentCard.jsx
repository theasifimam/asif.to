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
      className={`flex flex-col gap-4 py-2 sm:gap-6 sm:py-10 transition-all ${
        isFocusMode
          ? "sm:py-12"
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
