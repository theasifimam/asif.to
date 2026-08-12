"use client";

import React from "react";
import Link from "next/link";
import { X, CheckCircle, Check } from "lucide-react";

export default function ChapterDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  courseId,
  chapter,
  allChapters = [],
  completedChapters = [],
}) {
  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-foreground">
            All Course Chapters
          </h3>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-2">
          {allChapters.map((ch, idx) => {
            const isActive = ch.slug === chapter?.slug;
            const isDone = completedChapters.includes(ch.slug);
            return (
              <Link
                key={ch.slug}
                href={`/${courseId}/${ch.slug}`}
                onClick={() => setIsDrawerOpen(false)}
                className={`flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-zinc-50 dark:bg-zinc-950 text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{ch.title}</span>
                </div>
                {isActive ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : isDone ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
