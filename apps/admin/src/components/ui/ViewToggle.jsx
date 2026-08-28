"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewToggle({
  view = "table",
  onViewChange,
  className = "",
}) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-xl border border-zinc-200/80 bg-zinc-100 p-0.5 dark:border-zinc-800/80 dark:bg-zinc-900",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onViewChange("list")}
        className={cn(
          "flex h-full flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg px-2 sm:px-3 text-xs font-bold transition-all cursor-pointer",
          view === "table" || view === "list"
            ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
        )}
        title="List View"
        aria-label="List View"
      >
        <List size={14} />
        <span className="hidden sm:inline">List</span>
      </button>
      <button
        type="button"
        onClick={() => onViewChange("card")}
        className={cn(
          "flex h-full flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg px-2 sm:px-3 text-xs font-bold transition-all cursor-pointer",
          view === "card" || view === "grid"
            ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
        )}
        title="Card View"
        aria-label="Card View"
      >
        <LayoutGrid size={14} />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
}
