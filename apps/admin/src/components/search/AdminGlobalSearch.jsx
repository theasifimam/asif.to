"use client";
import LogoLoader from "@/components/ui/LogoLoader";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  FileText,
  HelpCircle,
  Layers3,
  Search,
  StickyNote,
  X,
} from "lucide-react";
import { rankAdminResults, SEARCH_TYPES } from "@/lib/admin-search";

let indexRequest;
const fetchIndex = () =>
  (indexRequest ||= fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/index`, {
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) throw new Error();
      return response.json();
    })
    .then((body) => body.data?.items || []));
const TYPE_APPEARANCE = {
  course: {
    Icon: BookOpen,
    label: "Course",
    box: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  chapter: {
    Icon: BookMarked,
    label: "Chapter",
    box: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  topic: {
    Icon: Layers3,
    label: "Topic",
    box: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  },
  article: {
    Icon: FileText,
    label: "Article",
    box: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  question: {
    Icon: HelpCircle,
    label: "Interview Question",
    box: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  cheatsheet: {
    Icon: StickyNote,
    label: "Cheatsheet",
    box: "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  },
};

export default function AdminGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const allResults = useMemo(
    () => rankAdminResults(items, query),
    [items, query],
  );
  const counts = useMemo(
    () =>
      allResults.reduce(
        (result, item) => ({
          ...result,
          [item.type]: (result[item.type] || 0) + 1,
        }),
        {},
      ),
    [allResults],
  );
  const results = useMemo(
    () =>
      (type === "all"
        ? allResults
        : allResults.filter((item) => item.type === type)
      ).slice(0, 12),
    [allResults, type],
  );
  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    addEventListener("keydown", handler);
    return () => removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    Promise.resolve().then(() => setLoading(true));
    fetchIndex()
      .then(setItems)
      .catch(() => setError("Admin search is temporarily unavailable."))
      .finally(() => setLoading(false));
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = overflow;
      trigger?.focus();
    };
  }, [open]);
  const close = () => setOpen(false);
  const navigate = (item) => {
    close();
    router.push(item.adminUrl);
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((value) => Math.max(0, value - 1));
    } else if (event.key === "Enter" && results[selected]) {
      event.preventDefault();
      navigate(results[selected]);
    }
  };
  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Search admin content"
        className="flex h-10 min-w-10 items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50 px-3.5 text-zinc-600 transition-colors duration-200 hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-blue-500/15 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Search className="h-4 w-4" />
        <span className="hidden text-xs font-bold sm:inline">Search</span>
        <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[9px] text-zinc-400 dark:bg-zinc-800 md:inline">
          ⌘K
        </kbd>
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-100 bg-black/40 backdrop-blur-xs dark:bg-black/60 p-3 sm:p-6 flex flex-col items-center pt-[6vh] sm:pt-[10vh] overflow-y-auto"
            onMouseDown={(event) =>
              event.target === event.currentTarget && close()
            }
          >
            <div
              className="w-full max-w-2xl flex flex-col gap-3 relative"
              onKeyDown={onKeyDown}
            >
              {/* Floating Pill Capsule Search Input Island */}
              <div
                role="search"
                className="flex w-full items-center gap-3 rounded-full border border-zinc-200/80 bg-white px-4.5 py-3 shadow-[0_20px_60px_-28px_rgba(0,0,0,.4)] transition-all focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/15 dark:border-zinc-700/80 dark:bg-zinc-900 sm:py-3.5"
              >
                <Search className="h-5 w-5 text-zinc-400 dark:text-zinc-400 shrink-0 ml-0.5" />
                <label htmlFor="admin-global-search" className="sr-only">
                  Search courses, topics, articles, and questions
                </label>
                <input
                  id="admin-global-search"
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setType("all");
                    setSelected(0);
                  }}
                  placeholder="Search courses, topics, articles, questions..."
                  className="min-w-0 flex-1 bg-transparent text-base sm:text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium outline-none"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="rounded-full p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={close}
                  aria-label="Close search"
                  className="hidden sm:inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                >
                  Esc
                </button>
                <button
                  onClick={close}
                  aria-label="Close search"
                  className="sm:hidden rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Floating Pill Shaped Category Tab Bar Island */}
              {query && (
                <div
                  role="tablist"
                  aria-label="Admin search categories"
                  className="self-center flex items-center gap-1.5 overflow-x-auto rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-1.5 shadow-xl shadow-black/15 border border-zinc-200/80 dark:border-zinc-800/80 ring-1 ring-black/5 dark:ring-white/10 max-w-full scrollbar-none"
                >
                  {Object.entries(SEARCH_TYPES)
                    .filter(([value]) => value === "all" || counts[value])
                    .map(([value, label]) => (
                      <button
                        key={value}
                        role="tab"
                        aria-selected={type === value}
                        onClick={() => {
                          setType(value);
                          setSelected(0);
                        }}
                        className={`shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          type === value
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span>{label}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                            type === value
                              ? "bg-white/20 text-white"
                              : "bg-zinc-200/80 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {value === "all" ? allResults.length : counts[value]}
                        </span>
                      </button>
                    ))}
                </div>
              )}

              {/* Floating Results Islands Container (Transparent Surroundings) */}
              {(query || loading || error) && (
                <div
                  role="listbox"
                  aria-live="polite"
                  className="flex-1 overflow-y-auto max-h-[58vh] sm:max-h-[64vh] flex flex-col gap-2.5 p-1 scrollbar-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 py-12 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 text-sm text-zinc-500">
                      <LogoLoader className="h-5 w-5  text-blue-500"  />{" "}
                      Loading content…
                    </div>
                  ) : error ? (
                    <div className="py-12 text-center rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 text-sm text-red-500">
                      {error}
                    </div>
                  ) : !query ? (
                    <div className="py-12 text-center rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 text-sm text-zinc-500">
                      Find content and open its management screen.
                    </div>
                  ) : results.length ? (
                    <div className="flex flex-col gap-2.5 rounded-3xl">
                      {results.map((item, index) => {
                        const appearance =
                          TYPE_APPEARANCE[item.type] || TYPE_APPEARANCE.article;
                        const Icon = appearance.Icon;
                        return (
                          <button
                            key={item.id}
                            role="option"
                            aria-selected={selected === index}
                            onMouseEnter={() => setSelected(index)}
                            onClick={() => navigate(item)}
                            className={`w-full rounded-4xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-3.5 text-left shadow-md shadow-black/5 dark:shadow-black/20 border border-zinc-200/80 dark:border-zinc-800/80 ring-1 ring-black/5 dark:ring-white/10 transition-all duration-150 ${
                              selected === index
                                ? "ring-2 ring-blue-500 border-blue-500/80 shadow-xl shadow-blue-500/10 scale-[1.01] -translate-y-0.5"
                                : "hover:border-blue-500/50 hover:shadow-lg hover:scale-[1.005]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${appearance.box}`}
                                aria-hidden="true"
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="mb-1 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${appearance.badge}`}
                                  >
                                    {appearance.label}
                                  </span>
                                  {(item.course || item.category) && (
                                    <span className="truncate text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                      {[item.course, item.category]
                                        .filter(Boolean)
                                        .join(" › ")}
                                    </span>
                                  )}
                                </span>
                                <span className="block text-sm font-bold text-zinc-950 dark:text-white">
                                  {item.title}
                                </span>
                                {item.description && (
                                  <span className="mt-1 block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {item.description}
                                  </span>
                                )}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 px-4 text-center rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 text-sm text-zinc-500">
                      No matching admin content.
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Quick Navigation Hints Island */}
              <div className="self-center hidden sm:flex items-center gap-3 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl px-4 py-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 shadow-md border border-zinc-200/80 dark:border-zinc-800/80 ring-1 ring-black/5 dark:ring-white/10 select-none">
                <span>↑↓ Navigate</span>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span>↵ Open</span>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <span>Esc Close</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
