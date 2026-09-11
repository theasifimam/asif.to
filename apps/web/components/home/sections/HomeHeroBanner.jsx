"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Code2, Search } from "lucide-react";
import { QUICK_HUB_ITEMS } from "../homeConstants";

export default function HomeHeroBanner() {
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("asif:open-search"));
  };

  return (
    <section className="relative overflow-hidden rounded-4xl sm:rounded-[2.5rem] bg-zinc-950 text-white p-5 sm:p-9 shadow-xl border border-zinc-800 min-w-0">
      {/* Subtle Ambient Radial Glows */}
      <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] sm:text-[11px] font-black tracking-wider uppercase mb-3.5 text-zinc-300 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Developer Learning Platform
          </div>

          <h1 className="font-outfit text-2xl xs:text-3xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight leading-[1.1] text-balance">
            Learn. Practice. Revise.{" "}
            <span className="text-blue-400 drop-shadow-sm">
              Prove Your Skills.
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed font-medium text-zinc-400">
            Structured courses, a multi-language playground, flashcards,
            quizzes, interview preparation, cheatsheets and course exams — all
            in one focused developer platform.
          </p>

          <div className="mt-5 flex flex-col min-[360px]:flex-row items-stretch min-[360px]:items-center gap-2.5 *:flex-1">
            <a
              href="#courses"
              className="h-12 min-[360px]:h-11 inline-flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Start Learning
            </a>
            <Link
              href="/run"
              className="h-12 min-[360px]:h-11 inline-flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-black active:scale-95 transition-all"
            >
              <Code2 className="w-4 h-4 text-blue-400" />
              Playground
            </Link>
          </div>
        </div>

        {/* Quick Hub - Dark Glass Pills Grid */}
        <div className="w-full min-w-0">
          {/* Mobile (< sm): Touch Chip Row */}
          <div className="flex sm:hidden overflow-x-auto scrollbar-none gap-2 -mx-1 mb-[-12] px-1">
            {QUICK_HUB_ITEMS.map(([Icon, label, href]) => (
              <Link
                key={label}
                href={href}
                className="flex min-h-11 items-center gap-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 px-3.5 text-[11px] font-bold text-zinc-200 shrink-0 hover:bg-zinc-800 hover:border-blue-500/40 active:scale-95 transition-all shadow-xs"
              >
                <Icon className="w-3.5 h-3.5 text-blue-400" />
                {label}
              </Link>
            ))}
          </div>

          {/* Tablet/Desktop (>= sm): 4-Column Dark Glass Grid */}
          <div className="hidden sm:grid grid-cols-4 lg:grid-cols-2 gap-2 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-3 backdrop-blur-md">
            {QUICK_HUB_ITEMS.map(([Icon, label, href]) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800/80 px-3 py-2 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/90 hover:border-blue-500/40 active:scale-95 transition-all truncate"
              >
                <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Global Search Input */}
      <div className="relative z-10 mt-5 sm:mt-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          readOnly
          aria-label="Open global search"
          placeholder="Search courses, concepts, interview questions, cheatsheets..."
          onFocus={openSearch}
          onClick={openSearch}
          className="w-full h-12 pl-11 pr-14 rounded-full bg-zinc-900/90 text-white placeholder:text-zinc-500 text-xs sm:text-sm border border-zinc-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 font-semibold cursor-pointer"
        />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400 border border-zinc-700">
          ⌘K
        </kbd>
      </div>
    </section>
  );
}
