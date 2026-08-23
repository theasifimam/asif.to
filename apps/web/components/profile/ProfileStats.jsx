"use client";

import React from "react";
import Link from "next/link";
import { Flame, BookMarked, BookOpen, Award, Sparkles } from "lucide-react";
import { getUserMasteryTier } from "@/lib/masteryTier";

export default function ProfileStats({
  user,
  streak = 0,
  libraryCount = 0,
  completedCoursesCount = 0,
  certificatesCount = 0,
  masteryLevel = 1,
  onSelectTab,
}) {
  const masteryTier = getUserMasteryTier(user, { streak });
  const displayLevel = masteryTier.level || masteryLevel || 1;
  const displayTitle = masteryTier.title || "Learning Explorer";

  const allStats = [
    {
      key: "streak",
      hasScore: streak > 0,
      render: () => (
        <Link
          key="streak"
          href="/revision"
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs flex flex-col justify-between border border-zinc-100 dark:border-zinc-800/80 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all group cursor-pointer min-h-[110px]"
        >
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
              Streak
            </span>
            <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500/20 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-black text-2xl text-foreground">
                {streak} Days
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
              Daily Learning
            </p>
          </div>
        </Link>
      ),
    },
    {
      key: "library",
      hasScore: libraryCount > 0,
      render: () => (
        <button
          key="library"
          type="button"
          onClick={() => onSelectTab && onSelectTab("library")}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs flex flex-col justify-between text-left border border-zinc-100 dark:border-zinc-800/80 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all group cursor-pointer min-h-[110px]"
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
              Library
            </span>
            <BookMarked className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-black text-2xl text-foreground">
                {libraryCount}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
              {libraryCount === 1 ? "Note & Snippet" : "Notes & Snippets"}
            </p>
          </div>
        </button>
      ),
    },
    {
      key: "courses",
      hasScore: completedCoursesCount > 0,
      render: () => (
        <button
          key="courses"
          type="button"
          onClick={() => onSelectTab && onSelectTab("courses")}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs flex flex-col justify-between text-left border border-zinc-100 dark:border-zinc-800/80 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-md transition-all group cursor-pointer min-h-[110px]"
        >
          <div className="flex items-center justify-between text-indigo-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
              Courses
            </span>
            <BookOpen className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-black text-2xl text-foreground">
                {completedCoursesCount} Done
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
              {completedCoursesCount === 1 ? "Completed Track" : "Completed Tracks"}
            </p>
          </div>
        </button>
      ),
    },
    {
      key: "certificates",
      hasScore: certificatesCount > 0,
      render: () => (
        <button
          key="certificates"
          type="button"
          onClick={() => onSelectTab && onSelectTab("certificates")}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs flex flex-col justify-between text-left border border-zinc-100 dark:border-zinc-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-md transition-all group cursor-pointer min-h-[110px]"
        >
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
              Certs
            </span>
            <Award className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-black text-2xl text-foreground">
                {certificatesCount} Won
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
              {certificatesCount === 1 ? "Verified Certificate" : "Verified Certificates"}
            </p>
          </div>
        </button>
      ),
    },
    {
      key: "mastery",
      hasScore: displayLevel > 1 || streak > 0 || completedCoursesCount > 0,
      render: () => (
        <button
          key="mastery"
          type="button"
          onClick={() => onSelectTab && onSelectTab("quiz")}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs flex flex-col justify-between text-left border border-zinc-100 dark:border-zinc-800/80 hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:shadow-md transition-all group cursor-pointer min-h-[110px]"
        >
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
              Mastery
            </span>
            <Sparkles className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-foreground">
                Level {displayLevel}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
              {displayTitle}
            </p>
          </div>
        </button>
      ),
    },
  ];

  const activeStats = allStats.filter((s) => s.hasScore);

  if (activeStats.length === 0) return null;

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {activeStats.map((s) => s.render())}
    </section>
  );
}
