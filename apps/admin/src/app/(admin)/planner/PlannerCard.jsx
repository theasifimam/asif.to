"use client";
/* eslint-disable react-hooks/refs -- dnd-kit exposes callback refs and stable listener props. */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CheckSquare2, GripVertical, Link2 } from "lucide-react";
import { PRIORITY_STYLE } from "./planner-constants";

export default function PlannerCard({ card, onOpen, overlay = false }) {
  const sortable = useSortable({ id: `card:${card._id}`, data: { type: "card", card }, disabled: overlay });
  const style = overlay ? undefined : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition, opacity: sortable.isDragging ? 0.35 : 1 };
  const complete = card.checklist?.filter((item) => item.completed).length || 0;
  const total = card.checklist?.length || 0;
  const overdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.columnName?.toLowerCase().includes("done");

  return (
    <article ref={sortable.setNodeRef} style={style} onClick={() => onOpen?.(card)} className={`group relative cursor-pointer rounded-2xl border border-zinc-200/80 bg-white p-3 sm:p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-800 ${overlay ? "w-72 rotate-2 shadow-2xl z-50 pointer-events-none" : ""}`}>
      <div className="flex items-start gap-1.5 sm:gap-2">
        <button
          {...sortable.attributes}
          {...sortable.listeners}
          onClick={(event) => event.stopPropagation()}
          className="p-1.5 -ml-2 -mt-1 cursor-grab active:cursor-grabbing touch-none text-zinc-400 dark:text-zinc-500 opacity-80 md:opacity-0 transition md:group-hover:opacity-100 shrink-0"
          aria-label="Drag card"
        >
          <GripVertical size={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 sm:mb-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">{card.type}</span>
            {card.priority !== "None" && <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${PRIORITY_STYLE[card.priority]}`}>{card.priority}</span>}
          </div>
          <h3 className="text-xs sm:text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-100">{card.title}</h3>
          {card.labels?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{card.labels.slice(0, 3).map((label) => <span key={label._id} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${label.color}20`, color: label.color }}>{label.name}</span>)}</div>}
          {(card.dueDate || total > 0 || card.parentCard) && <div className="mt-2.5 sm:mt-3 flex items-center gap-3 text-[11px] font-semibold text-zinc-500">
            {card.dueDate && <span className={`flex items-center gap-1 ${overdue ? "text-red-600 dark:text-red-400" : ""}`}><CalendarDays size={12} />{new Date(card.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
            {total > 0 && <span className="flex items-center gap-1"><CheckSquare2 size={12} />{complete}/{total}</span>}
            {card.parentCard && <Link2 size={12} />}
          </div>}
        </div>
      </div>
    </article>
  );
}
