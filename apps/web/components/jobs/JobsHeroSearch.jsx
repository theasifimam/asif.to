"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Building2, Code2, MapPin, Search, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_META = {
  skill: { icon: Code2, label: "Skill" },
  title: { icon: Briefcase, label: "Role" },
  company: { icon: Building2, label: "Company" },
  category: { icon: Tag, label: "Category" },
  location: { icon: MapPin, label: "Location" },
};

export default function JobsHeroSearch({ fixed = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams?.get("keyword") || "";
  const listId = useId();

  const [expanded, setExpanded] = useState(false);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    const kw = searchParams?.get("keyword") || "";
    setKeyword(kw);
    if (kw) {
      setExpanded(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  // Debounced suggestions; a newer keystroke cancels the previous request.
  useEffect(() => {
    const query = keyword.trim();
    if (!expanded || query.length < 2 || !process.env.NEXT_PUBLIC_API_URL) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/suggest?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : null))
        .then((result) => {
          setSuggestions(Array.isArray(result?.data) ? result.data : []);
          setActiveIndex(-1);
        })
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword, expanded]);

  const basePath = fixed.location
    ? `/jobs/location/${fixed.location}`
    : fixed.category
      ? `/jobs/category/${fixed.category}`
      : fixed.track === "tech"
        ? "/jobs/tech"
        : fixed.country
          ? `/jobs/country/${fixed.country}`
          : "/jobs";

  const searchFor = (text) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("page");
    if (text.trim()) params.set("keyword", text.trim());
    else params.delete("keyword");
    router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath);
  };

  const choose = (item) => {
    setOpen(false);
    if (item.type === "company" && item.slug) return router.push(`/jobs/company/${item.slug}`);
    if (item.type === "location" && item.slug) return router.push(`/jobs/location/${item.slug}`);
    if (item.type === "category" && item.slug) return router.push(`/jobs/category/${item.slug}`);
    setKeyword(item.label);
    return searchFor(item.label);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!keyword.trim() && !expanded) {
      setExpanded(true);
      return;
    }
    if (open && activeIndex >= 0 && suggestions[activeIndex]) {
      choose(suggestions[activeIndex]);
      return;
    }
    setOpen(false);
    searchFor(keyword);
  };

  const clearSearch = () => {
    setKeyword("");
    setSuggestions([]);
    setOpen(false);
    searchFor("");
    setExpanded(false);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showList = expanded && open && keyword.trim().length >= 2 && suggestions.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="absolute right-4 top-4 z-20 sm:right-7 sm:top-7 flex items-center justify-end"
    >
      <motion.div
        initial={false}
        animate={{ width: expanded ? "min(280px, calc(100vw - 6rem))" : "40px" }}
        className={`relative flex items-center overflow-hidden rounded-full shadow-sm h-10 transition-colors ${
          expanded
            ? "bg-white dark:bg-zinc-950 border border-blue-500/30"
            : "bg-white/95 dark:bg-zinc-900/90 border border-transparent"
        }`}
      >
        <button
          type={expanded ? "submit" : "button"}
          onClick={(e) => {
            if (!expanded) {
              e.preventDefault();
              setExpanded(true);
            }
          }}
          className="absolute left-0 flex h-10 w-10 items-center justify-center text-blue-600 transition hover:scale-105 active:scale-95 dark:text-blue-400 z-10"
          aria-label="Search jobs"
        >
          <Search className="h-4 w-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          placeholder="Search roles, skills, companies..."
          className="h-full w-full bg-transparent pl-10 pr-10 text-xs sm:text-sm font-semibold outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
          onBlur={() => {
            setOpen(false);
            if (!keyword.trim()) {
              setExpanded(false);
            }
          }}
        />

        <AnimatePresence>
          {expanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent onBlur from firing before click
                clearSearch();
              }}
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          {suggestions.map((item, index) => {
            const { icon: Icon, label } = TYPE_META[item.type] || TYPE_META.title;
            return (
              <li
                key={`${item.type}:${item.label}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => {
                  event.preventDefault(); // keep focus so the input does not collapse first
                  choose(item);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  index === activeIndex ? "bg-blue-50 dark:bg-blue-950/40" : ""
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-semibold">{item.label}</span>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                  {label}
                  {item.count > 1 ? ` · ${item.count}` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </form>
  );
}
