"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  FileText,
  HelpCircle,
  Layers3,
  LoaderCircle,
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
        className="flex h-10 min-w-10 items-center gap-2 rounded-xl bg-zinc-100 px-3 text-zinc-600 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
            className="fixed inset-0 z-100 bg-black/55 p-0 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) =>
              event.target === event.currentTarget && close()
            }
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Search admin content"
              onKeyDown={onKeyDown}
              className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-zinc-950 sm:mt-[7vh] sm:h-auto sm:max-h-[82vh] sm:rounded-3xl"
            >
              <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <Search className="h-5 w-5 text-zinc-400" />
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
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
                />
                <button
                  onClick={close}
                  aria-label="Close search"
                  className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {query && (
                <div
                  role="tablist"
                  aria-label="Admin search categories"
                  className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-zinc-200 p-2.5 dark:border-zinc-800 scrollbar-none"
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
                        className={`shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                          type === value
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
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
              <div
                role="listbox"
                aria-live="polite"
                className="flex-1 overflow-y-auto p-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-20 text-sm text-zinc-500">
                    <LoaderCircle className="h-5 w-5 animate-spin" /> Loading
                    content…
                  </div>
                ) : error ? (
                  <p className="py-20 text-center text-sm text-red-500">
                    {error}
                  </p>
                ) : !query ? (
                  <p className="py-20 text-center text-sm text-zinc-500">
                    Find content and open its management screen.
                  </p>
                ) : results.length ? (
                  <div className="space-y-1">
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
                          className={`w-full rounded-2xl p-3 text-left transition ${selected === index ? "bg-zinc-100 ring-2 ring-blue-500/30 dark:bg-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-900/70"}`}
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
                                  <span className="truncate text-[10px] font-semibold text-zinc-500">
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
                                <span className="mt-1 block truncate text-[11px] text-zinc-500">
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
                  <p className="py-20 text-center text-sm text-zinc-500">
                    No matching admin content.
                  </p>
                )}
              </div>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
