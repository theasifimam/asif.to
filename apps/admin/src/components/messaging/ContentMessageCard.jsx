"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookMarked,
  BookOpen,
  FileText,
  HelpCircle,
  Layers3,
  StickyNote,
} from "lucide-react";

export const CONTENT_TYPE_CONFIG = {
  course: {
    Icon: BookOpen,
    label: "Course",
    badge: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/20",
    iconBox: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
  },
  chapter: {
    Icon: BookMarked,
    label: "Chapter",
    badge: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 border-violet-500/20",
    iconBox: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",
  },
  topic: {
    Icon: Layers3,
    label: "Topic",
    badge: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-500/20",
    iconBox: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300",
  },
  article: {
    Icon: FileText,
    label: "Article",
    badge: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20",
    iconBox: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  question: {
    Icon: HelpCircle,
    label: "Interview Question",
    badge: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20",
    iconBox: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  cheatsheet: {
    Icon: StickyNote,
    label: "Cheatsheet",
    badge: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-300 border-pink-500/20",
    iconBox: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-300",
  },
};

export default function ContentMessageCard({
  item,
  mine = false,
  onRemove = null,
  compact = false,
}) {
  if (!item) return null;

  const config = CONTENT_TYPE_CONFIG[item.type] || CONTENT_TYPE_CONFIG.article;
  const Icon = config.Icon;
  const href = item.adminUrl || `/articles`;

  const CardWrapper = onRemove ? "div" : Link;
  const wrapperProps = onRemove
    ? { className: "relative group" }
    : {
        href,
        className:
          "block group transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.99] text-left",
      };

  return (
    <div className={`my-1.5 w-full ${compact ? "max-w-64" : "max-w-72 sm:max-w-80"}`}>
      <CardWrapper {...wrapperProps}>
        <div
          className={`flex items-start gap-3 rounded-2xl p-3 border transition-all shadow-xs select-none ${
            mine
              ? "bg-white/15 border-white/25 text-white backdrop-blur-md hover:bg-white/20"
              : "bg-white dark:bg-[#18181c] border-zinc-200/90 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:border-blue-500/40 dark:hover:border-blue-500/40"
          }`}
        >
          {/* Icon Box */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              mine
                ? "bg-white/20 border-white/30 text-white"
                : `${config.iconBox} border-current/15`
            }`}
          >
            <Icon size={18} />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  mine
                    ? "bg-white/20 border-white/30 text-white"
                    : config.badge
                }`}
              >
                {config.label}
              </span>
              {(item.category || item.technology || item.course) && (
                <span
                  className={`truncate text-[10px] font-semibold ${
                    mine ? "text-blue-100" : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  · {item.category || item.technology || item.course}
                </span>
              )}
            </div>

            <h4
              className={`line-clamp-2 text-xs font-bold leading-snug tracking-tight ${
                mine ? "text-white" : "text-zinc-950 dark:text-white"
              }`}
            >
              {item.title}
            </h4>

            {item.description && (
              <p
                className={`mt-0.5 line-clamp-1 text-[10.5px] leading-normal ${
                  mine ? "text-blue-100/80" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {item.description}
              </p>
            )}

            {!onRemove && (
              <div
                className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${
                  mine ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                }`}
              >
                <span>Open in Admin</span>
                <ArrowUpRight
                  size={12}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            )}
          </div>
        </div>
      </CardWrapper>
    </div>
  );
}
