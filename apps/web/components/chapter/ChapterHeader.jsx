"use client";

import Link from "next/link";
import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
} from "lucide-react";

export default function ChapterHeader({
  courseId,
  course,
  tech,
  progressPercentage,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60 transition-all">
      {/* Breadcrumb & Top Actions Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Left: Back Link & Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/courses/${courseId}`}
            className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground transition-colors shrink-0"
            title="Back to course overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 min-w-0">
            <Link
              href="/courses"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 hidden sm:inline"
            >
              Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0 hidden sm:inline" />
            <Link
              href={`/courses/${courseId}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-bold text-zinc-800 dark:text-zinc-200 transition-colors truncate max-w-55 sm:max-w-95"
              title={course?.title}
            >
              {course?.title || "Course Overview"}
            </Link>
          </nav>
        </div>

        {/* Right Actions: Progress & Sidebar Toggle */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {progressPercentage}% Completed
            </span>
            <div className="w-16 sm:w-24 bg-zinc-100 dark:bg-zinc-800 h-1.5 sm:h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all cursor-pointer"
            title={isSidebarOpen ? "Collapse sidebar" : "Show sidebar"}
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-zinc-500" />
                <span>Collapse Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Show Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
