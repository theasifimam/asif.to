"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JobsHeroSearch({ fixed = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams?.get("keyword") || "";
  
  const [expanded, setExpanded] = useState(false);
  const [keyword, setKeyword] = useState(initialKeyword);
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

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!keyword.trim() && !expanded) {
      setExpanded(true);
      return;
    }
    
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    } else {
      params.delete("keyword");
    }

    const basePath = fixed.location
      ? `/jobs/location/${fixed.location}`
      : fixed.category
        ? `/jobs/category/${fixed.category}`
        : "/jobs";

    const targetUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    router.push(targetUrl);
  };

  const clearSearch = () => {
    setKeyword("");
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("keyword");
    
    const basePath = fixed.location
      ? `/jobs/location/${fixed.location}`
      : fixed.category
        ? `/jobs/category/${fixed.category}`
        : "/jobs";
        
    const targetUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    router.push(targetUrl);
    setExpanded(false);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="absolute right-4 top-4 z-20 sm:right-7 sm:top-7 flex items-center justify-end"
    >
      <motion.div 
        initial={false}
        animate={{ width: expanded ? "240px" : "40px" }}
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
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search roles, skills..."
          className="h-full w-full bg-transparent pl-10 pr-10 text-xs sm:text-sm font-semibold outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
          onBlur={() => {
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
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent onBlur from firing before click
                clearSearch();
              }}
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </form>
  );
}
