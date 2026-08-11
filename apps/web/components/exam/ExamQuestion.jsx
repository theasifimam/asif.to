"use client";

import React from "react";

const OPTION_LABELS = ["A", "B", "C", "D"];

/**
 * ExamQuestion
 * Displays a single question card with 4 selectable options.
 * No answer reveal until the exam is fully submitted.
 */
export default function ExamQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelect,
}) {
  if (!question) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Question counter */}
      <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
        <span>
          Question{" "}
          <span className="text-foreground text-sm font-black">{questionNumber}</span>{" "}
          of {totalQuestions}
        </span>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${
            selectedOption !== null
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
          }`}
        >
          {selectedOption !== null ? "✓ Answered" : "Unanswered"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question text */}
      <h2 className="text-base sm:text-lg font-extrabold text-foreground leading-snug">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              id={`exam-option-${idx}`}
              className={`w-full text-left flex items-center gap-3.5 p-4 rounded-2xl border-2 text-xs sm:text-sm font-medium transition-all duration-200 active:scale-[0.99] ${
                isSelected
                  ? "border-blue-600 bg-blue-600/10 text-blue-700 dark:text-blue-300 font-bold shadow-md shadow-blue-500/10"
                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-foreground hover:border-blue-400 hover:bg-blue-500/5"
              }`}
            >
              {/* Option label badge */}
              <span
                className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300"
                }`}
              >
                {OPTION_LABELS[idx]}
              </span>
              <span className="leading-snug">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
