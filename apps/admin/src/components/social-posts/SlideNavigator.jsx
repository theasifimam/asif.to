"use client";

import { ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";

export default function SlideNavigator({
  slides,
  activeId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
}) {
  return (
    <div className="flex gap-2.5 overflow-x-auto py-2.5 scrollbar-none">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`group min-w-36 rounded-2xl p-3.5 bg-zinc-50/60 dark:bg-zinc-900/60 border transition-all ${
            activeId === slide.id
              ? "border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/20"
              : "border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(slide.id)}
            className="w-full text-left cursor-pointer"
          >
            <div className="text-[10px] font-extrabold text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="truncate text-xs font-bold mt-0.5">
              {slide.title || slide.eyebrow || slide.template}
            </div>
          </button>

          <div className="mt-2.5 flex items-center justify-between gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                title="Move Left"
              >
                <ChevronLeft size={13} />
              </button>

              <button
                type="button"
                disabled={index === slides.length - 1}
                onClick={() => onMove(index, index + 1)}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                title="Move Right"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDuplicate(slide.id)}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                title="Duplicate Slide"
              >
                <Copy size={13} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(slide.id)}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                title="Delete Slide"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onAdd()}
        className="grid min-w-24 place-items-center rounded-2xl border border-dashed border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer shrink-0"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
