"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import SaveButton from "@/components/articles/SaveButton";
import Footer from "@/components/layout/Footer";
import TechStackGrid from "@/components/home/TechStackGrid";
import RevisionFlashcards from "@/components/home/RevisionFlashcards";
import { TECH_STACKS } from "@/lib/tutorialData";
import {
  Search,
  Sparkles,
  BookOpen,
  ChevronRight,
  Play,
  FileCode,
  Layers,
  MessageSquareText,
  Code2,
  ArrowRight,
} from "lucide-react";

export default function HomePageClient({ courses = [] }) {
  const [selectedTech, setSelectedTech] = useState(null);
  const [activeTab, setActiveTab] = useState("COURSES");
  const allCourses = courses;

  const filteredCourses = useMemo(() => {
    return allCourses.filter((c) => {
      const matchesTech = !selectedTech || c.techId === selectedTech;
      return matchesTech;
    });
  }, [allCourses, selectedTech]);

  const activeTechIds = useMemo(() => {
    return Array.from(new Set(allCourses.map((c) => c.techId)));
  }, [allCourses]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/70 dark:bg-[#0b0f19] text-foreground transition-colors duration-300 pb-24 sm:pb-16 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 flex flex-col gap-8 sm:gap-12 min-w-0">
        
        {/* Serene Editorial Hero Section */}
        <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-12 shadow-xl shadow-blue-500/10 border border-blue-500/20 min-w-0">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-20 w-40 h-40 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 min-w-0 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-black tracking-wider uppercase mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">
                asif.to • Developer Education & Workspace
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Master Web & Full-Stack Development on{" "}
              <span className="text-blue-200 underline decoration-blue-300 decoration-wavy decoration-2">
                asif.to
              </span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-2xl leading-relaxed font-medium">
              Step-by-step full-stack coding tutorials, instant syntax cheatsheets, interactive code playgrounds, and interview preparation.
            </p>

            {/* Instant Search Bar */}
            <div className="relative mt-6 sm:mt-8 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search courses, hooks, syntax, MongoDB queries..."
                readOnly
                aria-label="Open global search"
                onFocus={() => window.dispatchEvent(new CustomEvent("asif:open-search"))}
                onClick={() => window.dispatchEvent(new CustomEvent("asif:open-search"))}
                className="w-full h-12 sm:h-14 pl-12 pr-16 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs sm:text-sm shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 font-semibold cursor-pointer border border-white/40 dark:border-zinc-800"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 sm:block">⌘K</kbd>
            </div>

            {/* Quick Action Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-5 sm:mt-6">
              <button
                onClick={() => setActiveTab("COURSES")}
                className={`h-9 shrink-0 inline-flex items-center gap-1.5 px-4 rounded-full text-xs font-bold transition-all ${
                  activeTab === "COURSES"
                    ? "bg-white text-blue-600 shadow-md"
                    : "bg-white/15 text-white hover:bg-white/20"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Step-by-Step Courses</span>
              </button>

              <Link
                href="/run"
                className="h-9 shrink-0 inline-flex items-center gap-1.5 px-4 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/25 transition-all whitespace-nowrap border border-white/20"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Playground</span>
              </Link>

              <Link
                href="/cheatsheets"
                className="h-9 shrink-0 inline-flex items-center gap-1.5 px-4 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/25 transition-all whitespace-nowrap border border-white/20"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Instant Cheatsheets</span>
              </Link>

              <Link
                href="/revision"
                className="h-9 shrink-0 inline-flex items-center gap-1.5 px-4 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/25 transition-all whitespace-nowrap border border-white/20"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Revision Deck</span>
              </Link>

              <a
                href="#interview-prep"
                className="h-9 shrink-0 inline-flex items-center gap-1.5 px-4 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/25 transition-all whitespace-nowrap border border-white/20"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Interview Prep</span>
              </a>
            </div>
          </div>
        </section>

        {/* 4 Feature Bento Cards (Airy & Minimalist) */}
        <section
          aria-labelledby="explore-learning"
          className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-4 min-w-0"
        >
          <h2 id="explore-learning" className="sr-only">
            Explore learning resources
          </h2>
          {[
            {
              href: "#courses",
              icon: BookOpen,
              label: "Courses",
              detail: "Structured lessons",
              color: "text-blue-600 bg-blue-500/10 dark:bg-blue-500/20 dark:text-blue-400",
            },
            {
              href: "/practice",
              icon: Code2,
              label: "Code practice",
              detail: "Edit & run code",
              color: "text-indigo-600 bg-indigo-500/10 dark:bg-indigo-500/20 dark:text-indigo-400",
            },
            {
              href: "#interview-prep",
              icon: MessageSquareText,
              label: "Interviews",
              detail: "Q&A library",
              color: "text-purple-600 bg-purple-500/10 dark:bg-purple-500/20 dark:text-purple-400",
            },
            {
              href: "/cheatsheets",
              icon: FileCode,
              label: "Cheatsheets",
              detail: "Quick syntax",
              color: "text-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20 dark:text-emerald-400",
            },
          ].map(({ href, icon: Icon, label, detail, color }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col justify-between p-5 sm:p-6 rounded-3xl border border-zinc-200/70 bg-white shadow-xs transition-all hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-md dark:border-zinc-800/70 dark:bg-zinc-900 min-h-[120px] sm:min-h-[135px]"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${color}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="mt-3 text-xs sm:text-sm font-black text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {label}
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  {detail}
                </p>
              </div>
            </Link>
          ))}
        </section>

        {/* Tech Stack Selector Grid */}
        <TechStackGrid
          selectedTech={selectedTech}
          onSelectTech={setSelectedTech}
          activeTechIds={activeTechIds}
          courses={allCourses}
          isLoading={false}
        />

        {/* Structured Courses Catalog */}
        <section id="courses" className="w-full scroll-mt-24 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-foreground truncate">
                Structured Learning Tracks
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                Follow sequential chapter lessons from start to finish
              </p>
            </div>

            <Link
              href="/cheatsheets"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View Cheatsheets</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Courses Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filteredCourses.map((course, idx) => {
              const tech = TECH_STACKS.find((t) => t.id === course.techId);
              const rankNum = course.rank || idx + 1;

              return (
                <div
                  key={course._id || course.id}
                  className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 shadow-xs hover:shadow-lg border border-zinc-200/70 dark:border-zinc-800/70 transition-all duration-300 min-w-0 overflow-hidden"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 text-xs mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          #{rankNum} Popular
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${tech?.badgeBg || "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
                        >
                          {tech?.name || course.techId}
                        </span>
                      </div>
                      {course.duration && (
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {course.duration}
                        </span>
                      )}
                    </div>

                    <Link href={`/courses/${course.slug}`}>
                      <h3 className="font-extrabold text-lg sm:text-xl text-foreground leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-5 leading-relaxed font-medium">
                      {course.subtitle}
                    </p>

                    {/* Chapter count badge & syllabus link */}
                    <div className="flex items-center justify-between text-xs font-bold mb-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-[11px] sm:text-xs">
                          {course.chapterCount ?? course.chapters?.length ?? 0}{" "}
                          Lessons
                        </span>
                      </div>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] sm:text-xs"
                      >
                        View Syllabus &rarr;
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2.5 mt-auto">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex flex-1 h-11 items-center justify-center gap-2 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Course</span>
                      </Link>
                      <SaveButton
                        itemId={course._id}
                        itemType="course"
                        label="Save"
                        size="sm"
                        className="shrink-0 h-11 px-4 rounded-full"
                      />
                    </div>
                    <Link
                      href={`/${course.slug}/interview-questions`}
                      className="flex h-9 items-center justify-center gap-2 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <MessageSquareText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Interview Q&A</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interview Prep Course Bento Grid */}
        <section
          id="interview-prep"
          className="scroll-mt-24 rounded-3xl sm:rounded-[2.5rem] bg-white dark:bg-zinc-900 p-6 sm:p-10 shadow-xs border border-zinc-200/70 dark:border-zinc-800/70 overflow-hidden min-w-0"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <MessageSquareText className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]">
                  Interview Preparation
                </span>
              </div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Practice questions by course
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Open a course to view interview-ready answers, topics, and code solutions.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {allCourses.slice(0, 4).map((course) => (
              <Link
                key={course._id || course.id}
                href={`/${course.slug}/interview-questions`}
                className="group flex items-center justify-between gap-3 rounded-2xl sm:rounded-3xl bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-5 transition-all hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-500/40 min-h-[64px] min-w-0 overflow-hidden border border-zinc-200/70 dark:border-zinc-800/70"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs sm:text-sm font-black text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-zinc-500 truncate">
                    Course interview questions &rarr;
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Swipeable Mobile Revision Deck */}
        <RevisionFlashcards selectedTech={selectedTech} />
      </main>

      <Footer />
    </div>
  );
}
