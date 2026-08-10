"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Search, CheckCircle, Check } from "lucide-react";

export default function ChapterSidebar({
  courseId,
  chapter,
  allChapters = [],
  currentChapterIndex,
  completedChapters = [],
  sidebarSearch,
  setSidebarSearch,
  activeItemRef,
}) {
  return (
    <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 z-30">
      <div style={{ position: "sticky", top: "90px" }}>
        <div className="h-[calc(100vh-7.5rem)] flex flex-col gap-3 p-4 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center justify-between px-2 pt-1 shrink-0">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Chapters ({allChapters.length})
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {currentChapterIndex + 1}/{allChapters.length}
            </span>
          </div>

          {/* Sidebar Search Filter */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter chapters..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-foreground placeholder:text-zinc-400 border-0 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Chapter Navigation List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
            {allChapters
              .filter((ch) =>
                ch.title
                  .toLowerCase()
                  .includes(sidebarSearch.toLowerCase()),
              )
              .map((ch, idx) => {
                const isActive = ch.slug === chapter?.slug;
                const isDone = completedChapters.includes(ch.slug);
                return (
                  <Link
                    key={ch.slug}
                    ref={isActive ? activeItemRef : null}
                    href={`/courses/${courseId}/${ch.slug}`}
                    className={`group flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                          isActive
                            ? "bg-white/20 text-white"
                            : isDone
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="line-clamp-2 leading-snug">
                        {ch.title}
                      </span>
                    </div>
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-white shrink-0 ml-1" />
                    ) : isDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                    ) : null}
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </aside>
  );
}
