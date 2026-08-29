"use client";
import LogoLoader from "@/components/ui/LogoLoader";
import { useEffect, useMemo, useState, useDeferredValue } from "react";
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  BookOpen,
  HelpCircle,
  StickyNote,
  TerminalSquare,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchResult from "./SearchResult";
import { FILTER_LABELS, FILTERS, rankResults } from "@/lib/search/rankResults";
import { rememberSearch } from "@/lib/search/recentSearches";
import { trackSearch } from "@/lib/search/analytics";

const POPULAR_SEARCHES = [
  "React Hooks",
  "Next.js App Router",
  "JavaScript Closures",
  "TypeScript Generics",
  "CSS Flexbox & Grid",
  "Node.js Streams",
  "MongoDB Aggregation",
  "System Design",
];

export default function SearchPageClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") || "");
  const [type, setType] = useState(params.get("type") || "all");
  const [technology, setTechnology] = useState(
    params.get("technology") || "all",
  );
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    fetch("/api/search-index")
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((body) => setItems(body.items || []))
      .catch(() => setError("Search is temporarily unavailable."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams();
      if (query.trim()) next.set("q", query.trim());
      if (type !== "all") next.set("type", type);
      if (technology !== "all") next.set("technology", technology);
      router.replace(`/search${next.size ? `?${next}` : ""}`, {
        scroll: false,
      });
    }, 180);
    return () => clearTimeout(timer);
  }, [query, type, technology, router]);

  useEffect(() => {
    if (!deferredQuery.trim()) return;
    const timer = setTimeout(() => rememberSearch(deferredQuery), 700);
    return () => clearTimeout(timer);
  }, [deferredQuery]);

  const technologies = useMemo(
    () => [
      "all",
      ...new Set(
        items
          .map((item) => item.technology)
          .filter(Boolean)
          .map(String),
      ),
    ],
    [items],
  );

  const allFilteredByTech = useMemo(
    () =>
      technology === "all"
        ? items
        : items.filter(
            (item) =>
              String(item.technology).toLowerCase() ===
              technology.toLowerCase(),
          ),
    [items, technology],
  );

  const allRanked = useMemo(
    () =>
      rankResults(allFilteredByTech, deferredQuery, {
        type: "all",
        limit: 300,
      }),
    [allFilteredByTech, deferredQuery],
  );

  const counts = useMemo(
    () =>
      allRanked.reduce(
        (acc, item) => ({
          ...acc,
          [item.type]: (acc[item.type] || 0) + 1,
        }),
        {},
      ),
    [allRanked],
  );

  const results = useMemo(
    () =>
      type === "all"
        ? allRanked
        : allRanked.filter((item) => item.type === type),
    [allRanked, type],
  );

  const selectFilter = (value) => {
    setType(value);
    trackSearch("search_filter_selected");
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-10 shadow-xl shadow-blue-500/15">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute top-2 right-12 w-32 h-32 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span>asif.to Search Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Find what you want to learn
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-blue-100/90 font-medium">
            Explore interactive courses, lessons, interview questions,
            cheatsheets, and coding exercises across fullstack technologies.
          </p>
        </div>
      </div>

      {/* Floating Search Input Pill Capsule */}
      <div className="relative">
        <label htmlFor="search-page-input" className="sr-only">
          Search all asif.to content
        </label>
        <div className="flex items-center gap-3.5 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl px-5 py-4 shadow-xl shadow-black/5 dark:shadow-black/20 border border-zinc-200/80 dark:border-zinc-800/80 ring-1 ring-black/5 dark:ring-white/10 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/40 transition-all">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            id="search-page-input"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “react useEffect”, “nextjs routes”, “binary search”…"
            className="min-w-0 flex-1 bg-transparent text-base sm:text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs and Technology Pill Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full scrollbar-none"
          aria-label="Search result categories"
        >
          {FILTERS.filter((value) => value === "all" || counts[value]).map(
            (value) => {
              const isSelected = type === value;
              const count =
                value === "all" ? allRanked.length : counts[value] || 0;
              return (
                <button
                  key={value}
                  role="tab"
                  onClick={() => selectFilter(value)}
                  aria-selected={isSelected}
                  className={`shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800/80"
                  }`}
                >
                  <span>{FILTER_LABELS[value]}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-zinc-200/80 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>

        {technologies.length > 2 && (
          <div className="flex items-center gap-2">
            <label htmlFor="search-technology" className="sr-only">
              Filter by Technology
            </label>
            <select
              id="search-technology"
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              className="rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Technologies</option>
              {technologies
                .slice(1)
                .sort()
                .map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Results Content */}
      <div className="mt-2" aria-live="polite">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 rounded-4xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-lg text-sm text-zinc-500">
            <LogoLoader className="h-6 w-6  text-blue-500"  />
            <span className="font-semibold">Loading search index…</span>
          </div>
        ) : error ? (
          <div className="rounded-4xl bg-red-50/80 dark:bg-red-950/30 backdrop-blur-xl border border-red-200 dark:border-red-900/50 p-8 text-center text-red-700 dark:text-red-300 shadow-md">
            <p className="font-bold">{error}</p>
          </div>
        ) : !deferredQuery.trim() ? (
          <div className="rounded-4xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-8 sm:p-12 shadow-xl shadow-black/5 dark:shadow-black/20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 mb-4 shadow-inner">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Start with a topic, concept, or interview question
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500 max-w-md mx-auto">
              Type anything into the search bar above or choose a popular
              suggestion below:
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
              {POPULAR_SEARCHES.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setQuery(topic)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 transition shadow-sm"
                >
                  <span>{topic}</span>
                  <ArrowRight className="h-3 w-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        ) : results.length ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <p className="text-xs font-bold text-zinc-500">
                {results.length} {results.length === 1 ? "result" : "results"}{" "}
                for “{deferredQuery}”
              </p>
              {type !== "all" && (
                <button
                  onClick={() => setType("all")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Show all categories
                </button>
              )}
            </div>

            <div role="list" className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {results.map((item) => (
                <div
                  role="listitem"
                  key={item.id}
                  onClick={() => trackSearch("search_result_clicked")}
                >
                  <SearchResult item={item} query={deferredQuery} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-4xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-10 sm:p-14 text-center shadow-xl">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              No exact results for “{deferredQuery}”
            </p>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
              Check the spelling, try broader keywords, or clear any active
              technology filters.
            </p>
            <button
              onClick={() => {
                setType("all");
                setTechnology("all");
              }}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
