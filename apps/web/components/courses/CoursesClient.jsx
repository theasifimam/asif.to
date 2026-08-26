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
  Clock,
} from "lucide-react";
import { TECH_STACKS } from "@/lib/tutorialData";
import { getImageUrl } from "@/lib/config";

const COURSE_CARD_THEMES = [
  {
    cardBg:
      "bg-blue-50/75 dark:bg-blue-950/25 hover:bg-blue-50 dark:hover:bg-blue-950/40",
    border:
      "border-blue-200/80 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-500",
    badgeBg:
      "bg-blue-100/90 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/50",
    titleHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    cardBg:
      "bg-emerald-50/75 dark:bg-emerald-950/25 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
    border:
      "border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-500",
    badgeBg:
      "bg-emerald-100/90 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50",
    titleHover:
      "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    cardBg:
      "bg-purple-50/75 dark:bg-purple-950/25 hover:bg-purple-50 dark:hover:bg-purple-950/40",
    border:
      "border-purple-200/80 dark:border-purple-900/50 hover:border-purple-400 dark:hover:border-purple-500",
    badgeBg:
      "bg-purple-100/90 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/50",
    titleHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    btn: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    cardBg:
      "bg-amber-50/75 dark:bg-amber-950/25 hover:bg-amber-50 dark:hover:bg-amber-950/40",
    border:
      "border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500",
    badgeBg:
      "bg-amber-100/90 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50",
    titleHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    cardBg:
      "bg-rose-50/75 dark:bg-rose-950/25 hover:bg-rose-50 dark:hover:bg-rose-950/40",
    border:
      "border-rose-200/80 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500",
    badgeBg:
      "bg-rose-100/90 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50",
    titleHover: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    cardBg:
      "bg-sky-50/75 dark:bg-sky-950/25 hover:bg-sky-50 dark:hover:bg-sky-950/40",
    border:
      "border-sky-200/80 dark:border-sky-900/50 hover:border-sky-400 dark:hover:border-sky-500",
    badgeBg:
      "bg-sky-100/90 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50",
    titleHover: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
    btn: "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    cardBg:
      "bg-indigo-50/75 dark:bg-indigo-950/25 hover:bg-indigo-50 dark:hover:bg-indigo-950/40",
    border:
      "border-indigo-200/80 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-500",
    badgeBg:
      "bg-indigo-100/90 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50",
    titleHover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    cardBg:
      "bg-teal-50/75 dark:bg-teal-950/25 hover:bg-teal-50 dark:hover:bg-teal-950/40",
    border:
      "border-teal-200/80 dark:border-teal-900/50 hover:border-teal-400 dark:hover:border-teal-500",
    badgeBg:
      "bg-teal-100/90 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/50",
    titleHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
    btn: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
];

function getCardTheme(course, index) {
  const key = course.techId || course.slug || course.id || index.toString();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const themeIndex = Math.abs(hash + index) % COURSE_CARD_THEMES.length;
  return COURSE_CARD_THEMES[themeIndex];
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
              const theme = getCardTheme(course, idx);

              return (
                <div
                  key={course._id || course.id || slug}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-4xl sm:rounded-4xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 ${theme.cardBg} ${theme.border}`}
                >
                  {/* Card Top Info */}
                  <div>
                    {course.thumbnail ? (
                      <Link
                        href={`/courses/${slug}`}
                        className="relative mb-3 block w-full overflow-hidden rounded-xl md:rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 aspect-[2.1/1] border border-zinc-200/60 dark:border-zinc-800"
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
                        className="relative mb-3 flex w-full flex-col items-center justify-center overflow-hidden rounded-4xl md:rounded-4xl bg-linear-to-br from-zinc-100 via-blue-50/40 to-indigo-50/50 dark:from-zinc-800/80 dark:via-zinc-900 dark:to-zinc-950 aspect-[2.1/1] border border-zinc-200/70 dark:border-zinc-800 transition-all group-hover:border-blue-500/40"
                      >
                        <div className="relative z-10 flex flex-col items-center gap-1.5 p-3 text-center">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80 group-hover:scale-105 group-hover:border-blue-500 transition-all">
                            <GraduationCap className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-outfit text-xs font-black tracking-tight text-zinc-800 dark:text-zinc-200 line-clamp-1">
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
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${theme.badgeBg}`}
                      >
                        {course.techId
                          ? course.techId.toUpperCase()
                          : "DEVELOPER"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/50">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Online</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className={`font-outfit text-sm sm:text-base font-bold tracking-tight text-zinc-950 dark:text-white ${theme.titleHover} transition-colors line-clamp-1`}
                    >
                      <Link href={`/courses/${slug}`}>{course.title}</Link>
                    </h3>

                    {/* Subtitle / Description */}
                    <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed line-clamp-2">
                      {course.description ||
                        course.subtitle ||
                        `Master ${course.title} with step-by-step interactive lessons and syntax guides on asif.to.`}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      <BookOpen className={`w-3.5 h-3.5 ${theme.iconColor}`} />
                      <span>{lessonCount} Lessons</span>
                    </div>

                    <Link
                      href={`/courses/${slug}`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold shadow-xs transition-transform active:scale-95 cursor-pointer ${theme.btn}`}
                    >
                      <span>Start Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
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
