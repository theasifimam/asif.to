"use client";

import { LayoutGrid, List } from "lucide-react";

export function ViewToggle({
  view = "table",
  onViewChange,
  className = "flex-1",
}) {
  return (
    <div
      className={
        "inline-flex items-center rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900 shrink-0 " +
        className
      }
    >
      <button
        type="button"
        onClick={() => onViewChange("table")}
        className={`flex items-center gap-1.5 h-11 rounded-xl px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
          view === "table" || view === "list"
            ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        }`}
        title="List View"
        aria-label="List View"
      >
        <List size={15} />
        <span className="hidden sm:inline">List</span>
      </button>
      <button
        type="button"
        onClick={() => onViewChange("card")}
        className={`flex items-center gap-1.5 rounded-xl h-11 px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
          view === "card" || view === "grid"
            ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        }`}
        title="Card View"
        aria-label="Card View"
      >
        <LayoutGrid size={15} />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
}
