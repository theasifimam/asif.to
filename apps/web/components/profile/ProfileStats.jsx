"use client";

import React from "react";
import { Flame, BookMarked, BookOpen, Award, Sparkles } from "lucide-react";

export default function ProfileStats({
  streak = 0,
  libraryCount = 0,
  completedCoursesCount = 0,
  certificatesCount = 0,
  masteryLevel = 1,
  onSelectTab,
}) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* Streak */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between text-blue-500">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Streak
          </span>
          <Flame className="w-5 h-5" />
        </div>
        <span className="text-2xl font-black text-foreground mt-1">
          {streak} Days
        </span>
        <span className="text-[11px] text-zinc-400 font-medium">
          Daily Learning
        </span>
      </div>

      {/* Library Notes & Snippets */}
      <button
        type="button"
        onClick={() => onSelectTab && onSelectTab("library")}
        className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1 text-left hover:border-blue-500/40 border border-zinc-100 dark:border-zinc-800 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Library
          </span>
          <BookMarked className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-2xl font-black text-foreground mt-1">
          {libraryCount}
        </span>
        <span className="text-[11px] text-zinc-400 font-medium">
          Notes & Snippets
        </span>
      </button>

      {/* Courses */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between text-indigo-500">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Courses
          </span>
          <BookOpen className="w-5 h-5" />
        </div>
        <span className="text-2xl font-black text-foreground mt-1">
          {completedCoursesCount} Done
        </span>
        <span className="text-[11px] text-zinc-400 font-medium">
          Completed Tracks
        </span>
      </div>

      {/* Certificates */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between text-emerald-500">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Certs
          </span>
          <Award className="w-5 h-5" />
        </div>
        <span className="text-2xl font-black text-foreground mt-1">
          {certificatesCount} Won
        </span>
        <span className="text-[11px] text-zinc-400 font-medium">
          Certificates
        </span>
      </div>

      {/* Mastery */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex flex-col gap-1 col-span-2 sm:col-span-1 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between text-amber-500">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Mastery
          </span>
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-2xl font-black text-foreground mt-1">
          Level {masteryLevel}
        </span>
        <span className="text-[11px] text-zinc-400 font-medium">
          Pro Developer
        </span>
      </div>
    </section>
  );
}
