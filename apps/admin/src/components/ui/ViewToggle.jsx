"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export function ViewToggle({
  view = "table",
  onViewChange,
  className = "",
}) {
  const mobileDefaultApplied = useRef(false);

  useEffect(() => {
    if (mobileDefaultApplied.current) return;
    mobileDefaultApplied.current = true;

    const hasExplicitView = new URLSearchParams(window.location.search).has("view");
    if (
      !hasExplicitView &&
      window.matchMedia("(max-width: 1023px)").matches &&
      (view === "table" || view === "list")
    ) {
      onViewChange?.("card");
    }
  }, [onViewChange, view]);

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-2xl border border-zinc-200/80 bg-zinc-100 p-0.5 dark:border-zinc-800/80 dark:bg-zinc-900 lg:h-9 lg:rounded-xl",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onViewChange("list")}
        className={cn(
          "flex h-full flex-1 items-center justify-center gap-1.5 rounded-[14px] px-3 text-xs font-bold transition-all cursor-pointer sm:flex-initial sm:rounded-lg",
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
          "flex h-full flex-1 items-center justify-center gap-1.5 rounded-[14px] px-3 text-xs font-bold transition-all cursor-pointer sm:flex-initial sm:rounded-lg",
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
