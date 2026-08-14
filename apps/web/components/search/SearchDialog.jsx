"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  Clock,
  Trash2,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import SearchResult from "./SearchResult";
import { FILTER_LABELS, FILTERS, rankResults } from "@/lib/search/rankResults";
import {
  clearRecentSearches,
  getRecentSearches,
  rememberSearch,
  removeRecentSearch,
} from "@/lib/search/recentSearches";
import { trackSearch } from "@/lib/search/analytics";

let indexPromise;
const loadIndex = () =>
  (indexPromise ||= fetch("/api/search-index")
    .then((response) => {
      if (!response.ok) throw new Error("Search unavailable");
      return response.json();
    })
    .then((body) => body.items || []));

export default function SearchDialog({
  open,
  onClose,
  triggerRef,
  initialQuery = "",
}) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(0);
  const [activeType, setActiveType] = useState("all");
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);
  const allResults = useMemo(
    () => rankResults(items, query, { limit: 100 }),
    [items, query],
  );
  const counts = useMemo(
    () =>
      allResults.reduce(
        (values, item) => ({
          ...values,
          [item.type]: (values[item.type] || 0) + 1,
        }),
        {},
      ),
    [allResults],
  );
  const results = useMemo(
    () =>
      (activeType === "all"
        ? allResults
        : allResults.filter((item) => item.type === activeType)
      ).slice(0, 9),
    [activeType, allResults],
  );

  useEffect(() => {
    if (!open) return;
    Promise.resolve().then(() => setRecent(getRecentSearches()));
    loadIndex()
      .then(setItems)
      .catch(() => setError("Search is temporarily unavailable."))
      .finally(() => setLoading(false));
    requestAnimationFrame(() => inputRef.current?.focus());
    trackSearch("search_opened");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
      trigger?.focus();
    };
  }, [open, triggerRef]);

  if (!open || typeof document === "undefined") return null;
  const choose = (item) => {
    rememberSearch(query);
    trackSearch("search_result_clicked");
    location.assign(item.url);
  };
  const keyDown = (event) => {
    if (event.key === "Escape") onClose();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter" && results[selected]) {
      event.preventDefault();
      choose(results[selected]);
    }
  };
  return createPortal(
    <div
      className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm p-0 sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Search asif.to"
        onKeyDown={keyDown}
        className="mx-auto flex h-full sm:h-auto sm:max-h-[82vh] w-full max-w-2xl flex-col bg-white dark:bg-zinc-900 sm:mt-[7vh] sm:rounded-4xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
          <Search className="h-5 w-5 text-zinc-400" aria-hidden="true" />
          <label htmlFor="global-search-input" className="sr-only">
            Search tutorials, topics, questions
          </label>
          <input
            id="global-search-input"
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
              setActiveType("all");
            }}
            aria-controls="global-search-results"
            aria-activedescendant={
              results[selected] ? `search-result-${selected}` : undefined
            }
            placeholder="Search tutorials, topics, questions..."
            className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-zinc-400"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {query && !loading && !error && (
          <div
            role="tablist"
            aria-label="Search result categories"
            className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800 scrollbar-none"
          >
            {FILTERS.filter((value) => value === "all" || counts[value]).map(
              (value) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={activeType === value}
                  onClick={() => {
                    setActiveType(value);
                    setSelected(0);
                    trackSearch("search_filter_selected");
                  }}
                  className={`shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activeType === value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{FILTER_LABELS[value]}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      activeType === value
                        ? "bg-white/20 text-white"
                        : "bg-zinc-200/80 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {value === "all" ? allResults.length : counts[value]}
                  </span>
                </button>
              ),
            )}
          </div>
        )}
        <div
          id="global-search-results"
          role="listbox"
          className="flex-1 overflow-y-auto p-3"
          aria-live="polite"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Loading search
              index…
            </div>
          ) : error ? (
            <p className="py-16 text-center text-sm text-red-600">{error}</p>
          ) : query ? (
            results.length ? (
              <div className="space-y-1">
                <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {activeType === "all"
                    ? "Top results"
                    : FILTER_LABELS[activeType]}
                </p>
                {results.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.preventDefault();
                      choose(item);
                    }}
                  >
                    <SearchResult
                      id={`search-result-${index}`}
                      item={item}
                      query={query}
                      selected={index === selected}
                      onSelect={() => setSelected(index)}
                    />
                  </div>
                ))}
                <a
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => rememberSearch(query)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  View all results <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="font-bold">No results for “{query}”</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Try fewer words or a related developer term.
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-4 text-sm font-bold text-blue-600"
                >
                  Clear search
                </button>
              </div>
            )
          ) : (
            <div>
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Recent searches
              </p>
              {recent.length ? (
                recent.map((value) => (
                  <div
                    key={value}
                    className="flex items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <button
                      onClick={() => setQuery(value)}
                      className="flex flex-1 items-center gap-3 p-3 text-left text-sm"
                    >
                      <Clock className="h-4 w-4 text-zinc-400" />
                      {value}
                    </button>
                    <button
                      aria-label={`Remove ${value}`}
                      onClick={() => {
                        removeRecentSearch(value);
                        setRecent(getRecentSearches());
                      }}
                      className="p-3"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="px-3 py-10 text-center text-sm text-zinc-500">
                  Search courses, lessons, questions, cheatsheets, and practice.
                </p>
              )}
              {recent.length > 0 && (
                <button
                  onClick={() => {
                    clearRecentSearches();
                    setRecent([]);
                  }}
                  className="mx-3 mt-2 flex items-center gap-2 text-xs font-bold text-zinc-500"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear recent searches
                </button>
              )}
            </div>
          )}
        </div>
        <div className="hidden sm:flex justify-end border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 text-[10px] text-zinc-400">
          ↑↓ Navigate · Enter Open · Esc Close
        </div>
      </section>
    </div>,
    document.body,
  );
}
