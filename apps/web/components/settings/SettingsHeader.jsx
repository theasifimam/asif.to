"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function SettingsHeader({
  username,
  onExpandAll,
  onCollapseAll,
}) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/${username || ""}`}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-foreground transition-colors w-fit group"
      >
        <ChevronLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span>Back to Profile</span>
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black font-outfit tracking-tight text-foreground">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
            Manage your public profile, social links, notifications, and security.
          </p>
        </div>

        {/* Quick Accordion Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExpandAll}
            className="px-3 py-1.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[11px] font-bold transition-colors cursor-pointer"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="px-3 py-1.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[11px] font-bold transition-colors cursor-pointer"
          >
            Collapse all
          </button>
        </div>
      </div>
    </div>
  );
}
