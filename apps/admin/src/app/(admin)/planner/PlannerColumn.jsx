"use client";
/* eslint-disable react-hooks/refs -- dnd-kit exposes callback refs and stable listener props. */

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Archive,
  GripHorizontal,
  MoreHorizontal,
  Pencil,
  Plus,
} from "lucide-react";
import PlannerCard from "./PlannerCard";

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
    return `rgba(100, 116, 139, ${alpha})`;
  }
  let c = hex.substring(1);
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(100, 116, 139, ${alpha})`;
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export default function PlannerColumn({
  column,
  cards,
  onOpenCard,
  onAddCard,
  onRename,
  onArchive,
  className,
  innerRef,
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const sortable = useSortable({
    id: `column:${column._id}`,
    data: { type: "column", column },
  });
  const droppable = useDroppable({
    id: `drop:${column._id}`,
    data: { type: "column-drop", column },
  });

  const baseColor = column.color || "#3b82f6";
  const lightBg = hexToRgba(baseColor, 0.045);
  const lightBorder = hexToRgba(baseColor, 0.2);
  const darkBg = hexToRgba(baseColor, 0.09);
  const darkBorder = hexToRgba(baseColor, 0.28);

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.3 : 1,
    "--col-bg": lightBg,
    "--col-border": lightBorder,
    "--col-bg-dark": darkBg,
    "--col-border-dark": darkBorder,
  };

  const setRef = (node) => {
    sortable.setNodeRef(node);
    if (innerRef) {
      if (typeof innerRef === "function") innerRef(node);
      else innerRef.current = node;
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    await onAddCard(column._id, title.trim());
    setTitle("");
    setAdding(false);
  };

  return (
    <section
      ref={setRef}
      style={style}
      className={`flex h-full w-[85vw] max-w-75 xs:w-[320px] shrink-0 snap-center md:w-75 flex-col rounded-3xl border bg-(--col-bg) border-(--col-border) dark:bg-(--col-bg-dark) dark:border-(--col-border-dark) p-2 shadow-xs transition-colors ${className || ""}`}
    >
      <header className="group flex items-center gap-2 px-2 py-2.5">
        <button
          {...sortable.attributes}
          {...sortable.listeners}
          className="hidden md:block cursor-grab touch-none text-zinc-400"
          aria-label="Drag column"
        >
          <GripHorizontal size={16} />
        </button>
        <span
          className="h-2 w-2 rounded-full ring-2 ring-white dark:ring-zinc-900"
          style={{ backgroundColor: column.color }}
        />
        <h2 className="min-w-0 flex-1 truncate font-outfit text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          {column.name}
        </h2>
        <span className="rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-zinc-800 px-2 py-0.5 text-[10px] font-black text-zinc-600 dark:text-zinc-400 shadow-xs">
          {cards.length}
        </span>
        <div className="relative group/menu">
          <button className="rounded-lg p-1 text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors">
            <MoreHorizontal size={16} />
          </button>
          <div className="invisible absolute right-0 top-7 z-30 w-36 rounded-2xl border border-zinc-200 bg-white p-1 opacity-0 shadow-xl group-focus-within/menu:visible group-focus-within/menu:opacity-100 group-hover/menu:visible group-hover/menu:opacity-100 dark:border-zinc-800 dark:bg-zinc-950 transition-all">
            <button
              onClick={() => onRename(column)}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Pencil size={13} /> Rename
            </button>
            <button
              onClick={() => onArchive(column)}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Archive size={13} /> Archive
            </button>
          </div>
        </div>
      </header>
      <div
        ref={droppable.setNodeRef}
        className={`min-h-24 flex-1 space-y-2.5 overflow-y-auto px-1 pb-2 transition-all ${
          droppable.isOver ? "rounded-2xl bg-blue-500/10 ring-2 ring-blue-500/30" : ""
        }`}
      >
        <SortableContext
          items={cards.map((card) => `card:${card._id}`)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <PlannerCard
              key={card._id}
              card={{ ...card, columnName: column.name }}
              onOpen={onOpenCard}
            />
          ))}
        </SortableContext>
      </div>
      {adding ? (
        <form
          onSubmit={submit}
          className="rounded-2xl bg-white dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800 p-2.5 shadow-xs"
        >
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Card title..."
            className="min-h-16 w-full resize-none bg-transparent p-1 text-xs sm:text-sm font-medium outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          <div className="flex items-center gap-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
            <button className="rounded-full bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-black text-white shadow-xs transition-all active:scale-95 cursor-pointer">
              Add card
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300/80 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 px-3 py-2.5 text-xs font-bold text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-[0.99] cursor-pointer"
        >
          <Plus size={14} className="text-blue-500" />
          <span>Add card</span>
        </button>
      )}
    </section>
  );
}
