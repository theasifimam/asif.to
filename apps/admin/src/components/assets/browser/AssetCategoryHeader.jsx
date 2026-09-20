"use client";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "./AssetCategoryGrid";

export default function AssetCategoryHeader({
  scope,
  setScope,
  totalItems = 0,
}) {
  const cat = CATEGORIES.find((item) => item.scope === scope);
  if (!cat || scope === "all") return null;

  const Icon = cat.icon;

  return (
    <div className="mb-4 px-3 sm:px-4 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 p-3.5 sm:p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 backdrop-blur-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setScope("all")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white cursor-pointer"
            aria-label="Back to All Files"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                cat.accent,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-zinc-900 dark:text-white truncate">
                  {cat.label}
                </h1>
                <span className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 truncate">
                {cat.badge}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setScope("all")}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
        >
          ← All Files
        </button>
      </div>
    </div>
  );
}
