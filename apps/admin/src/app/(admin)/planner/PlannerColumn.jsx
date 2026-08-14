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
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.3 : 1,
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
      className={`flex h-full w-[85vw] max-w-[300px] xs:w-[320px] shrink-0 snap-center md:w-[300px] flex-col rounded-3xl border border-zinc-200/70 bg-zinc-100/75 p-2 dark:border-zinc-800 dark:bg-zinc-900/60 ${className || ""}`}
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
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h2 className="min-w-0 flex-1 truncate text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
          {column.name}
        </h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-zinc-500 dark:bg-zinc-800">
          {cards.length}
        </span>
        <div className="relative group/menu">
          <button className="rounded-lg p-1 text-zinc-400 hover:bg-white dark:hover:bg-zinc-800">
            <MoreHorizontal size={16} />
          </button>
          <div className="invisible absolute right-0 top-7 z-30 w-36 rounded-xl border border-zinc-200 bg-white p-1 opacity-0 shadow-lg group-focus-within/menu:visible group-focus-within/menu:opacity-100 group-hover/menu:visible group-hover/menu:opacity-100 dark:border-zinc-800 dark:bg-zinc-950">
            <button
              onClick={() => onRename(column)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Pencil size={13} /> Rename
            </button>
            <button
              onClick={() => onArchive(column)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Archive size={13} /> Archive
            </button>
          </div>
        </div>
      </header>
      <div
        ref={droppable.setNodeRef}
        className={`min-h-24 flex-1 space-y-2 overflow-y-auto px-1 pb-2 transition-all ${droppable.isOver ? "rounded-2xl bg-blue-500/10 ring-2 ring-blue-500/30" : ""}`}
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
          className="rounded-2xl bg-white p-2 shadow-sm dark:bg-zinc-950"
        >
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Card title"
            className="min-h-16 w-full resize-none bg-transparent p-1 text-sm outline-none"
          />
          <div className="flex gap-2">
            <button className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
              Add card
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-2 text-xs text-zinc-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold text-zinc-500 hover:bg-white hover:text-zinc-900 dark:hover:bg-zinc-950 dark:hover:text-white"
        >
          <Plus size={15} /> Add card
        </button>
      )}
    </section>
  );
}
