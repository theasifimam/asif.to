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
      className="fixed inset-0 z-100 bg-black/40 backdrop-blur-md dark:bg-black/60 p-3 sm:p-6 flex flex-col items-center pt-[6vh] sm:pt-[10vh] overflow-y-auto"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl flex flex-col gap-3 relative"
        onKeyDown={keyDown}
      >
        {/* Floating Pill Capsule Search Input Island */}
        <div
          role="search"
          className="flex items-center gap-3 w-full rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-4.5 py-3 sm:py-3.5 border border-zinc-200/80 dark:border-zinc-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/40 transition-all"
        >
          <Search
            className="h-5 w-5 text-zinc-400 dark:text-zinc-400 shrink-0 ml-0.5"
            aria-hidden="true"
          />
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
            onClick={onClose}
            aria-label="Close search"
            className="hidden sm:inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            Esc
          </button>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="sm:hidden rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Floating Pill Shaped Category Tab Bar Island */}
        {query && !loading && !error && (
          <div
            role="tablist"
            aria-label="Search result categories"
            className="self-center flex items-center gap-1.5 overflow-x-auto rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-1.5 shadow-xl shadow-black/15 border border-zinc-200/80 dark:border-zinc-800/80 ring-1 ring-black/5 dark:ring-white/10 max-w-full scrollbar-none"
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
                      : "text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
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

        {/* Floating Results & History Islands Container (Transparent Surroundings) */}
        {(query || loading || error || recent.length > 0) && (
          <div
            id="global-search-results"
            role="listbox"
            className="flex-1 overflow-y-auto max-h-[58vh] sm:max-h-[64vh] flex flex-col gap-2.5 p-1 scrollbar-none"
            aria-live="polite"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 text-sm text-zinc-500">
                <LoaderCircle className="h-5 w-5 animate-spin text-blue-500" />{" "}
                Loading search index…
              </div>
            ) : error ? (
              <div className="py-12 text-center rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 text-sm text-red-600">
                {error}
              </div>
            ) : query ? (
              results.length ? (
                <>
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
                    className="flex items-center justify-center gap-2 rounded-4xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-3.5 text-sm font-bold text-blue-600 shadow-md shadow-black/5 dark:shadow-black/20 border border-zinc-200/80 dark:border-zinc-800/80 ring-1 ring-black/5 dark:ring-white/10 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:shadow-lg transition"
                  >
                    View all results <ArrowRight className="h-4 w-4" />
                  </a>
                </>
              ) : (
                <div className="py-12 px-4 text-center rounded-4xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-lg border border-zinc-200/80 dark:border-zinc-800/80">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    No results for “{query}”
                  </p>
                  <p className="mt-1.5 text-sm text-zinc-500">
                    Try fewer words or a related developer term.
                  </p>
                  <button
                    onClick={() => setQuery("")}
                    className="mt-4 text-sm font-bold text-blue-600 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-2 py-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Recent searches
                  </span>
                  {recent.length > 0 && (
                    <button
                      onClick={() => {
                        clearRecentSearches();
                        setRecent([]);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear all
                    </button>
                  )}
                </div>
                {recent.map((value) => (
                  <div
                    key={value}
                    className="flex items-center rounded-4xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-1 sm:p-1.5 shadow-md shadow-black/5 dark:shadow-black/20 border border-zinc-200/80 dark:border-zinc-800/80 ring-1 ring-black/5 dark:ring-white/10 hover:border-blue-500/50 hover:shadow-lg transition-all"
                  >
                    <button
                      onClick={() => setQuery(value)}
                      className="flex flex-1 items-center gap-3 p-2.5 text-left text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                      {value}
                    </button>
                    <button
                      aria-label={`Remove ${value}`}
                      onClick={() => {
                        removeRecentSearch(value);
                        setRecent(getRecentSearches());
                      }}
                      className="p-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
  );
}
