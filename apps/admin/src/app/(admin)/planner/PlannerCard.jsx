"use client";
/* eslint-disable react-hooks/refs -- dnd-kit exposes callback refs and stable listener props. */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CheckSquare2, GripVertical, Link2, Tag } from "lucide-react";
import { PRIORITY_STYLE, PRIORITY_DOT } from "./planner-constants";

export default function PlannerCard({ card, onOpen, overlay = false }) {
  const sortable = useSortable({ id: `card:${card._id}`, data: { type: "card", card }, disabled: overlay });
  const style = overlay ? undefined : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition, opacity: sortable.isDragging ? 0.35 : 1 };
  const complete = card.checklist?.filter((item) => item.completed).length || 0;
  const total = card.checklist?.length || 0;
  const overdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.columnName?.toLowerCase().includes("done");

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      onClick={() => onOpen?.(card)}
      className={`group relative cursor-pointer rounded-2xl border border-zinc-200/80 bg-white dark:bg-zinc-900/95 p-3 sm:p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-md dark:border-zinc-800 ${
        overlay ? "w-72 rotate-2 shadow-2xl z-50 pointer-events-none ring-2 ring-blue-500/40" : ""
      }`}
    >
      <div className="flex items-start gap-1.5 sm:gap-2">
        <button
          {...sortable.attributes}
          {...sortable.listeners}
          onClick={(event) => event.stopPropagation()}
          className="p-1 -ml-1.5 -mt-0.5 cursor-grab active:cursor-grabbing touch-none text-zinc-400 dark:text-zinc-600 opacity-80 md:opacity-0 transition md:group-hover:opacity-100 shrink-0 hover:text-zinc-600 dark:hover:text-zinc-300"
          aria-label="Drag card"
        >
          <GripVertical size={15} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 sm:mb-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
              {card.type}
            </span>
            {card.priority && card.priority !== "None" && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${PRIORITY_STYLE[card.priority]}`}>
                <span className={`h-1 w-1 rounded-full shrink-0 ${PRIORITY_DOT[card.priority] || "bg-zinc-400"}`} />
                {card.priority}
              </span>
            )}
          </div>
          <h3 className="font-outfit text-xs sm:text-sm font-extrabold leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {card.title}
          </h3>
          {card.labels?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.labels.slice(0, 3).map((label) => (
                <span
                  key={label._id}
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold border border-current/20"
                  style={{ backgroundColor: `${label.color}15`, color: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
          {(card.dueDate || total > 0 || card.parentCard) && (
            <div className="mt-2.5 flex items-center gap-3 text-[10.5px] font-semibold text-zinc-400 dark:text-zinc-500 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
              {card.dueDate && (
                <span className={`inline-flex items-center gap-1 ${overdue ? "text-rose-600 dark:text-rose-400 font-bold" : ""}`}>
                  <CalendarDays size={12} />
                  {new Date(card.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
              {total > 0 && (
                <span className="inline-flex items-center gap-1">
                  <CheckSquare2 size={12} />
                  {complete}/{total}
                </span>
              )}
              {card.parentCard && <Link2 size={12} className="text-zinc-400" />}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
