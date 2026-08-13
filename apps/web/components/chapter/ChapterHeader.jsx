"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  List,
} from "lucide-react";

export default function ChapterHeader({
  courseId,
  course,
  tech,
  progressPercentage,
  currentChapterIndex,
  allChapters = [],
  setIsFocusMode,
  isSidebarOpen,
  setIsSidebarOpen,
  setIsDrawerOpen,
}) {
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60 transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Back Arrow & Course Badges */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={`/courses/${courseId}`}
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
            title="Back to course overview"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-black text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 uppercase tracking-widest border border-blue-500/20 shrink-0">
              asif.to
            </span>
            <span
              className={`font-bold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full shrink-0 ${
                tech?.badgeBg ||
                "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              {tech?.name || course?.techId} Course
            </span>
            <span className="text-zinc-400 font-semibold text-[11px] sm:text-xs shrink-0">
              {progressPercentage}% Completed
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Focus Mode Toggle */}
          <button
            onClick={() => setIsFocusMode(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            title="Enter distraction-free Focus Mode (Press F)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Focus Mode</span>
            <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
              F
            </span>
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all"
            title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-blue-500" />
                <span>Show Sidebar</span>
              </>
            )}
          </button>

          {/* Mobile Chapter Drawer Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-xs font-bold active:scale-95 transition-all"
          >
            <List className="w-3.5 h-3.5" />
            <span>
              Chapters ({currentChapterIndex + 1}/{allChapters.length})
            </span>
          </button>
        </div>
      </div>

      {/* Course Title */}
      <h1 className="text-base sm:text-2xl font-black text-foreground tracking-tight leading-snug">
        {course?.title}
      </h1>

      {/* Course Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 sm:h-2 rounded-full overflow-hidden mt-0.5">
        <div
          className="bg-blue-600 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
