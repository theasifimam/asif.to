"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookMarked,
  BookOpen,
  FileText,
  HelpCircle,
  Layers3,
  Loader2,
  Search,
  StickyNote,
  X,
} from "lucide-react";
import { rankAdminResults, SEARCH_TYPES } from "@/lib/admin-search";
import { CONTENT_TYPE_CONFIG } from "./ContentMessageCard";

let cachedIndex = null;
const fetchSearchIndex = () => {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/index`, {
    credentials: "include",
  })
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((body) => {
      cachedIndex = body.data?.items || [];
      return cachedIndex;
    })
    .catch(() => []);
};

export default function ContentAttachModal({ open, onClose, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchSearchIndex()
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const filteredItems = useMemo(() => {
    if (query.trim()) {
      return rankAdminResults(items, query.trim(), activeType);
    }
    return items
      .filter((item) => activeType === "all" || item.type === activeType)
      .slice(0, 30);
  }, [items, query, activeType]);

  if (!open) return null;

  const TABS = [
    { key: "all", label: "All" },
    { key: "article", label: "Articles" },
    { key: "course", label: "Courses" },
    { key: "chapter", label: "Chapters" },
    { key: "question", label: "Questions" },
    { key: "cheatsheet", label: "Cheatsheets" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className="flex h-[520px] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121215]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
          <div>
            <h3 className="font-outfit text-base font-bold text-zinc-950 dark:text-white">
              Attach Admin Content
            </h3>
            <p className="text-xs text-zinc-500">
              Share an article, course, chapter, cheatsheet, or question
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search content by title, topic, or keyword..."
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveType(tab.key)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  activeType === tab.key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-xs font-bold text-zinc-400">
              <Loader2 className="animate-spin" size={16} />
              <span>Loading admin content…</span>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const config =
                CONTENT_TYPE_CONFIG[item.type] || CONTENT_TYPE_CONFIG.article;
              const Icon = config.Icon;

              return (
                <button
                  key={`${item.type}-${item.id || item._id || item.adminUrl}`}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="flex w-full items-start gap-3 rounded-2xl border border-zinc-200/60 p-2.5 text-left transition hover:border-blue-500/50 hover:bg-blue-50/50 dark:border-zinc-800/80 dark:hover:border-blue-500/50 dark:hover:bg-blue-950/20 cursor-pointer group"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconBox}`}
                  >
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider border ${config.badge}`}
                      >
                        {config.label}
                      </span>
                      {(item.category || item.technology || item.course) && (
                        <span className="truncate text-[10px] text-zinc-400">
                          · {item.category || item.technology || item.course}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs font-bold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 truncate text-[10.5px] text-zinc-500 dark:text-zinc-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-zinc-400">
              <Search size={24} className="mb-2 opacity-40" />
              <span>No content found matching &quot;{query}&quot;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
