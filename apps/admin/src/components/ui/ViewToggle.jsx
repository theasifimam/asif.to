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
        "inline-flex h-10 sm:h-11 items-center rounded-2xl border border-zinc-200/80 bg-zinc-100 p-1 dark:border-zinc-800/80 dark:bg-zinc-900",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onViewChange("list")}
        className={cn(
          "flex h-full flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 text-xs font-bold transition-all cursor-pointer",
          view === "table" || view === "list"
            ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
        )}
        title="List View"
        aria-label="List View"
      >
        <List size={14} />
        <span>List</span>
      </button>
      <button
        type="button"
        onClick={() => onViewChange("card")}
        className={cn(
          "flex h-full flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl px-3 sm:px-3.5 text-xs font-bold transition-all cursor-pointer",
          view === "card" || view === "grid"
            ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
        )}
        title="Card View"
        aria-label="Card View"
      >
        <LayoutGrid size={14} />
        <span>Cards</span>
      </button>
    </div>
  );
}
