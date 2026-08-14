"use client";
import { highlightParts, TYPE_LABELS } from "@/lib/search/rankResults";
import {
  BookOpen,
  BookMarked,
  FileText,
  HelpCircle,
  Layers3,
  ListChecks,
  StickyNote,
  TerminalSquare,
} from "lucide-react";

const TYPE_APPEARANCE = {
  course: {
    Icon: BookOpen,
    accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  chapter: {
    Icon: BookMarked,
    accent:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  topic: {
    Icon: Layers3,
    accent: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  },
  article: {
    Icon: FileText,
    accent:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  question: {
    Icon: HelpCircle,
    accent:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  cheatsheet: {
    Icon: StickyNote,
    accent: "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  },
  practice: {
    Icon: TerminalSquare,
    accent:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  test: {
    Icon: ListChecks,
    accent: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

export default function SearchResult({ item, query, selected, onSelect, id }) {
  const appearance = TYPE_APPEARANCE[item.type] || TYPE_APPEARANCE.test;
  const Icon = appearance.Icon;
  return (
    <a
      id={id}
      href={item.url}
      role="option"
      aria-selected={selected}
      onMouseEnter={onSelect}
      className={`block rounded-2xl p-3 outline-none transition ${selected ? "bg-zinc-100 dark:bg-zinc-800/80 ring-2 ring-blue-500/40" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${appearance.accent}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${appearance.badge}`}
            >
              {TYPE_LABELS[item.type] || item.type}
            </span>
            {(item.course || item.category) && (
              <span className="truncate text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                {[item.course, item.category].filter(Boolean).join(" › ")}
              </span>
            )}
          </div>
          <div className="font-bold text-sm text-zinc-950 dark:text-white">
            {highlightParts(item.title, query).map((part, index) =>
              part.match ? (
                <mark
                  key={index}
                  className="bg-yellow-200/80 dark:bg-yellow-500/30 text-inherit rounded-sm"
                >
                  {part.text}
                </mark>
              ) : (
                <span key={index}>{part.text}</span>
              ),
            )}
          </div>
          {item.description && (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
