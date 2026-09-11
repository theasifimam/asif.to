"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Play,
} from "lucide-react";
import SaveButton from "@/components/articles/SaveButton";
import { SafeCourseCover } from "../SafeCovers";
import { getTechColorClasses } from "../homeUtils";
import { TECH_STACKS } from "@/lib/tutorialData";

export default function HomeCoursesSection({
  courses = [],
  filteredCourses = [],
  activeTechs = [],
  selectedTech,
  onSelectTech,
  coursesScrollRef,
  canScrollLeft,
  canScrollRight,
  onScrollCourses,
}) {
  return (
    <section id="courses" className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <GraduationCap className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
              Structured Learning
            </span>
          </div>
          <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
            Explore Courses & Tracks
          </h2>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Pick a technology and follow step-by-step lessons from fundamentals
            to advanced patterns.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            All Published Courses <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onScrollCourses("left")}
              disabled={!canScrollLeft}
              aria-label="Previous courses"
              className="flex h-11 w-11 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-xs transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onScrollCourses("right")}
              disabled={!canScrollRight}
              aria-label="Next courses"
              className="flex h-11 w-11 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-xs transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tech Stack Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectTech(null)}
          className={`h-11 sm:h-9 shrink-0 rounded-full border px-4 text-[11px] font-black transition-all cursor-pointer ${
            !selectedTech
              ? "bg-blue-600 border-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-zinc-700"
          }`}
        >
          All courses
        </button>
        {activeTechs.map((tech) => (
          <button
            key={tech.id}
            type="button"
            onClick={() => onSelectTech(tech.id)}
            className={`h-11 sm:h-9 shrink-0 rounded-full border px-4 text-[11px] font-black transition-all cursor-pointer ${
              selectedTech === tech.id
                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-zinc-700"
            }`}
          >
            {tech.name}
          </button>
        ))}
      </div>

      {/* Dribbble Horizontal Slidable Course Cards */}
      <div
        ref={coursesScrollRef}
        className="mt-3 flex gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory py-1.5 -mx-1 px-1 min-w-0"
      >
        {filteredCourses.map((course, idx) => {
          const tech = TECH_STACKS.find((item) => item.id === course.techId);
          const rankNum = course.rank || idx + 1;
          const lessonCount =
            course.chapterCount ?? course.chapters?.length ?? 0;
          const techColors = getTechColorClasses(course.techId);

          return (
            <article
              key={course._id || course.id}
              className={`group flex w-67.5 xs:w-[300px] sm:w-82.5 md:w-87.5 shrink-0 snap-start flex-col justify-between rounded-4xl sm:rounded-[2.5rem] border bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${techColors.card}`}
            >
              <div>
                <SafeCourseCover
                  thumbnail={course.thumbnail}
                  title={course.title}
                  techName={tech?.name || course.techId}
                  slug={course.slug}
                />

                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    #{rankNum} Popular
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[9.5px] font-bold ${techColors.badge}`}
                  >
                    {tech?.name || course.techId}
                  </span>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 px-2.5 py-0.5 text-[9.5px] font-bold text-zinc-500 dark:text-zinc-400">
                    {lessonCount} Lessons
                  </span>
                </div>

                <Link href={`/courses/${course.slug}`}>
                  <h3 className="font-outfit text-base sm:text-lg font-black leading-snug text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mt-3">
                    {course.title}
                  </h3>
                </Link>
                <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {course.subtitle}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                <SaveButton
                  itemId={course._id}
                  itemType="course"
                  label="Save"
                  size="sm"
                  className="h-8.5 shrink-0 px-3 text-xs"
                />

                <Link
                  href={`/courses/${course.slug}`}
                  className={`h-8.5 inline-flex items-center gap-1.5 rounded-full px-4 text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 ${techColors.btn}`}
                >
                  <Play className="w-3 h-3 fill-current" /> Start Track
                </Link>
              </div>
            </article>
          );
        })}

        {/* Catalog Bento Card */}
        <article className="group relative flex w-67.5 xs:w-[300px] sm:w-82.5 md:w-87.5 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-4xl sm:rounded-[2.5rem] border border-blue-500/25 dark:border-blue-500/20 bg-linear-to-br from-blue-600/10 via-indigo-600/10 to-violet-600/10 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-500/50 transition-all duration-300">
          <div className="flex flex-col">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="h-5.5 w-5.5" />
              </div>
              <span className="rounded-full bg-blue-500/15 border border-blue-500/20 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {courses.length > 3
                  ? `+${courses.length - 3} More`
                  : "Full Catalog"}
              </span>
            </div>

            <h3 className="font-outfit text-base sm:text-lg font-black tracking-tight text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Explore Full Curriculum
            </h3>

            <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-600 dark:text-zinc-300 line-clamp-2">
              Browse our full interactive curriculum across React, Next.js,
              JavaScript, TypeScript, CSS, Node.js, and more.
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {activeTechs.slice(0, 5).map((tech) => (
                <span
                  key={tech.id}
                  className="rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-2.5 py-0.5 text-[9.5px] font-bold text-zinc-600 dark:text-zinc-300"
                >
                  {tech.name}
                </span>
              ))}
              {activeTechs.length > 5 && (
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[9.5px] font-bold text-zinc-400">
                  +{activeTechs.length - 5}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {courses.length} Published Courses
            </span>
            <Link
              href="/courses"
              className="h-8.5 inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
