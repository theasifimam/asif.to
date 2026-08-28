"use client";

import { X } from "lucide-react";
import {
  DATE_LABELS,
  SCOPE_LABELS,
  SORT_LABELS,
  USAGE_LABELS,
} from "./constants";

export default function AssetActiveFilters({
  activeFilterCount,
  search,
  setSearch,
  scope,
  setScope,
  sort,
  setSort,
  usageFilter,
  setUsageFilter,
  uploaderFilter,
  setUploaderFilter,
  uploaders = [],
  dateFilter,
  setDateFilter,
  resetFilters,
}) {
  if (activeFilterCount <= 0 && !search) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 bg-zinc-50/50 px-4 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        Active Filters:
      </span>
      {scope !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          Category: {SCOPE_LABELS[scope] || scope}
          <button
            type="button"
            onClick={() => setScope("all")}
            className="hover:text-blue-950 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {search && (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200/60 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          Search: &ldquo;{search}&rdquo;
          <button
            type="button"
            onClick={() => setSearch("")}
            className="hover:text-zinc-950 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {sort !== "newest" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          Sort: {SORT_LABELS[sort]}
          <button
            type="button"
            onClick={() => setSort("newest")}
            className="hover:text-blue-950 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {usageFilter !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          Usage: {USAGE_LABELS[usageFilter]}
          <button
            type="button"
            onClick={() => setUsageFilter("all")}
            className="hover:text-blue-950 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {uploaderFilter !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          Uploaded by:{" "}
          {uploaders.find((u) => u._id === uploaderFilter)?.fullName || "User"}
          <button
            type="button"
            onClick={() => setUploaderFilter("all")}
            className="hover:text-blue-950 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {dateFilter !== "all" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          Date: {DATE_LABELS[dateFilter]}
          <button
            type="button"
            onClick={() => setDateFilter("all")}
            className="hover:text-blue-950 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          setSearch("");
          resetFilters();
        }}
        className="ml-auto text-xs font-bold text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
      >
        Clear all
      </button>
    </div>
  );
}
