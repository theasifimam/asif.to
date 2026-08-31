"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers,
  Search,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { TECH_STACKS } from "@/lib/tutorialData";
import { getImageUrl } from "@/lib/config";

const DEFAULT_THEME = {
  cardBg:
    "bg-blue-50/75 dark:bg-blue-950/25 hover:bg-blue-50 dark:hover:bg-blue-950/40",
  border:
    "border-blue-200/80 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-500",
  badgeBg:
    "bg-blue-100/90 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/50",
  titleHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
  btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
  iconColor: "text-blue-600 dark:text-blue-400",
};

const TECH_THEMES = {
  reactjs: DEFAULT_THEME,
  nextjs: DEFAULT_THEME,
  javascript: DEFAULT_THEME,
  typescript: DEFAULT_THEME,
  css: DEFAULT_THEME,
  nodejs: DEFAULT_THEME,
  mongodb: DEFAULT_THEME,
  expressjs: DEFAULT_THEME,
  tailwindcss: DEFAULT_THEME,
  default: DEFAULT_THEME,
};

function getCardTheme(course) {
  const techId = course.techId?.toLowerCase();
  return TECH_THEMES[techId] || TECH_THEMES.default;
}

export default function CoursesClient({ initialCourses = [] }) {
  const [selectedTech, setSelectedTech] = useState("");
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    let list = initialCourses;

    if (selectedTech) {
      list = list.filter(
        (c) =>
          c.techId?.toLowerCase() === selectedTech.toLowerCase() ||
          c.slug?.toLowerCase().includes(selectedTech.toLowerCase()),
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.subtitle?.toLowerCase().includes(q) ||
          c.techId?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [initialCourses, selectedTech, search]);

  const totalChapters = useMemo(() => {
    return initialCourses.reduce(
      (acc, c) => acc + (c.chapterCount || c.chapters?.length || 0),
      0,
    );
  }, [initialCourses]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-24 sm:px-6 md:px-8">
      <nav className="mb-4 flex items-center gap-2 text-xs font-bold text-zinc-400">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-700 dark:text-zinc-200">Courses</span>
      </nav>

      {/* Top Mode Switcher Bar */}
      <div className="mb-7 flex flex-wrap items-center justify-center sm:justify-start gap-2 p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs w-fit">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <BookOpen className="w-4 h-4" />
          <span>Courses</span>
        </div>
        <Link
          href="/revision"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <Layers className="w-4 h-4 text-purple-500" />
          <span>Flashcards Deck</span>
        </Link>
        <Link
          href="/quiz"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-emerald-500" />
          <span>Practice Quiz</span>
        </Link>
      </div>

      {/* Hero Banner Section */}
      <section className="rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Interactive Learning Tracks</span>
          </div>

          <h1 className="font-outfit text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
            All Published Courses & Curriculum Roadmaps
          </h1>

          <p className="mt-3 text-xs sm:text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Master full-stack web development with structured hands-on courses.
            Every course features interactive code playgrounds, syntax guides,
            and real-world projects.
          </p>

          {/* Quick Stats Pill Strip */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>{initialCourses.length} Published Courses</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>{totalChapters}+ Interactive Lessons</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>100% Free & Open Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar Section */}
      <section className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search courses by topic, framework, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-11 pr-5 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-xs"
          />
        </div>

        {/* Tech Stack Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTech("")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedTech === ""
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-500"
            }`}
          >
            All Technologies
          </button>
          {TECH_STACKS.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelectedTech(tech.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedTech === tech.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-500"
              }`}
            >
              <span>{tech.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="mt-8">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => {
              const slug = course.slug || course.id || course._id;
              const lessonCount =
                course.chapterCount ?? course.chapters?.length ?? 0;
              const theme = getCardTheme(course);

              return (
                <article
                  key={course._id || course.id || slug}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-4xl sm:rounded-[2.5rem] border bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 ${theme.border}`}
                >
                  {/* Card Top Info */}
                  <div>
                    {course.thumbnail ? (
                      <Link
                        href={`/courses/${slug}`}
                        className="relative mb-3.5 block w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 aspect-[2.1/1] border border-zinc-200/60 dark:border-zinc-800"
                      >
                        <Image
                          src={getImageUrl(course.thumbnail)}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-103"
                          unoptimized
                        />
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${slug}`}
                        className="relative mb-3.5 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/10 via-cyan-500/5 to-white dark:to-zinc-900 aspect-[2.1/1] border border-blue-500/20 transition-all group-hover:border-blue-500/40"
                      >
                        <div className="relative z-10 flex flex-col items-center gap-1.5 p-3 text-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <span className="font-outfit text-xs font-black tracking-tight text-zinc-900 dark:text-white line-clamp-1">
                            {course.title}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                            {course.techId?.toUpperCase() || "DEVELOPER TRACK"}
                          </span>
                        </div>
                      </Link>
                    )}

                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider border ${theme.badgeBg}`}
                      >
                        {course.techId
                          ? course.techId.toUpperCase()
                          : "DEVELOPER"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Online Track</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`font-outfit text-base sm:text-lg font-black tracking-tight text-zinc-950 dark:text-white ${theme.titleHover} transition-colors line-clamp-2 mt-2`}
                    >
                      <Link href={`/courses/${slug}`}>{course.title}</Link>
                    </h3>

                    {/* Subtitle / Description */}
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                      {course.description ||
                        course.subtitle ||
                        `Master ${course.title} with step-by-step interactive lessons and syntax guides on asif.to.`}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <BookOpen className={`w-4 h-4 ${theme.iconColor}`} />
                      <span>{lessonCount} Lessons</span>
                    </div>

                    <Link
                      href={`/courses/${slug}`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer ${theme.btn}`}
                    >
                      <span>Start Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-4xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
            <BookOpen className="w-12 h-12 text-zinc-400 mb-3" />
            <h3 className="text-lg font-bold font-outfit text-zinc-900 dark:text-white">
              No Courses Found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              No published courses matched your filter search criteria. Try
              clearing the search or selecting another technology.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedTech("");
              }}
              className="mt-5 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
