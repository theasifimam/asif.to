"use client";

import React from "react";
import { ArrowLeft, List, Minimize2 } from "lucide-react";
import { useScrollNavVisible } from "@/components/ScrollNavProvider";

export default function FocusHeader({
  course,
  chapter,
  currentChapterIndex,
  allChapters,
  progressPercentage,
  tableOfContents = [],
  isTocOpen,
  setIsTocOpen,
  fontSize,
  setFontSize,
  setIsFocusMode,
}) {
  const isNavVisible = useScrollNavVisible();

  return (
    <header
      className={`sticky top-0 z-50 bg-white/98 dark:bg-zinc-900/98 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-xs transition-transform duration-300 ease-in-out ${
        isNavVisible
          ? "translate-y-0"
          : "-translate-y-full pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        {/* Left: Back button & Lesson title info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={() => setIsFocusMode(false)}
            className="p-1.5 sm:p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
            title="Exit Focus Mode"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 hidden sm:block truncate">
              {course?.title}
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-foreground truncate">
              {chapter?.title}
            </h2>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Progress Chip (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <span>
              {currentChapterIndex + 1}/{allChapters.length}
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-blue-600 dark:text-blue-400">
              {progressPercentage}%
            </span>
          </div>

          {/* In-Page Contents Dropdown Trigger */}
          {tableOfContents.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all"
                title="Table of Contents"
              >
                <List className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="hidden sm:inline">Contents</span>
              </button>

              {/* TOC Dropdown Menu */}
              {isTocOpen && (
                <div className="absolute right-0 top-11 w-72 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 space-y-1">
                  <div className="text-[10px] font-black uppercase text-zinc-400 px-2 py-1 tracking-wider border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    Table of Contents
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setIsTocOpen(false)}
                        className={`block px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors ${
                          item.type === "h2"
                            ? "pl-4"
                            : item.type === "h3"
                              ? "pl-6"
                              : ""
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Font Size Adjuster */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 text-[10px] sm:text-[11px] font-bold">
            {["sm", "md", "lg"].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full uppercase transition-all ${
                  fontSize === size
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-black"
                    : "text-zinc-500 hover:text-foreground"
                }`}
                title={`Text size: ${size}`}
              >
                {size === "sm" ? "A-" : size === "md" ? "A" : "A+"}
              </button>
            ))}
          </div>

          {/* Exit Focus Mode Button */}
          <button
            onClick={() => setIsFocusMode(false)}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0"
            title="Exit Focus Mode"
          >
            <Minimize2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Exit Focus</span>
          </button>
        </div>
      </div>
    </header>
  );
}
