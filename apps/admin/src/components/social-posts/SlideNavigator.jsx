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
    <div className="flex gap-2 overflow-x-auto py-3">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`group min-w-36 rounded-xl p-3 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800  ${
            activeId === slide.id ? "border-primary bg-primary/5" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(slide.id)}
            className="w-full text-left"
          >
            <div className="text-[10px] font-bold text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="truncate text-xs font-semibold">
              {slide.title || slide.eyebrow || slide.template}
            </div>
          </button>

          <div className="mt-2 flex gap-2 opacity-70 group-hover:opacity-100">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(index, index - 1)}
            >
              <ChevronLeft size={14} />
            </button>

            <button
              type="button"
              disabled={index === slides.length - 1}
              onClick={() => onMove(index, index + 1)}
            >
              <ChevronRight size={14} />
            </button>

            <button type="button" onClick={() => onDuplicate(slide.id)}>
              <Copy size={14} />
            </button>

            <button type="button" onClick={() => onDelete(slide.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onAdd()}
        className="grid min-w-24 place-items-center rounded-xl border border-dashed text-muted-foreground hover:bg-muted"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
