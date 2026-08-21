"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
      <section className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-blue-500/20 bg-linear-to-br from-blue-600 via-indigo-700 to-zinc-950 p-8 sm:p-12 md:p-16 text-white shadow-2xl shadow-blue-600/20">
        {/* Decorative Ambient Background Orb */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-linear-to-br from-blue-400/30 to-indigo-400/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white border border-white/20 mb-6">
            <GraduationCap className="h-4 w-4 text-blue-300" />
            <span>Interactive Learning Tracks</span>
          </div>

          <h1 className="font-outfit text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white">
            All Published Courses & Curriculum Roadmaps
          </h1>

          <p className="mt-4 text-sm sm:text-base font-medium leading-relaxed text-blue-100 max-w-2xl">
            Master full-stack web development with structured hands-on courses.
            Every course features interactive code playgrounds, syntax guides,
            and real-world projects.
          </p>

          {/* Quick Stats Pill Strip */}
          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>{initialCourses.length} Published Courses</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <Layers className="w-3.5 h-3.5 text-emerald-300" />
              <span>{totalChapters}+ Interactive Lessons</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
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
            {filteredCourses.map((course) => {
              const slug = course.slug || course.id || course._id;
              const lessonCount =
                course.chapterCount ?? course.chapters?.length ?? 0;
              const isPublished = course.status === "published" || true;

              return (
                <div
                  key={course._id || course.id || slug}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-blue-500/50 transition-all duration-300"
                >
                  {/* Card Top Info */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                        {course.techId
                          ? course.techId.toUpperCase()
                          : "DEVELOPER"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Online</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-outfit text-xl font-bold tracking-tight text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <Link href={`/courses/${slug}`}>{course.title}</Link>
                    </h3>

                    {/* Subtitle / Description */}
                    <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-3">
                      {course.description ||
                        course.subtitle ||
                        `Master ${course.title} with step-by-step interactive lessons and syntax guides on asif.to.`}
                    </p>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>{lessonCount} Lessons</span>
                    </div>

                    <Link
                      href={`/courses/${slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-extrabold shadow-sm transition-transform active:scale-95 cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-[32px] border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
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
