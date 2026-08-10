"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TechStackGrid from "@/components/home/TechStackGrid";
import RevisionFlashcards from "@/components/home/RevisionFlashcards";
import CodeSnippetViewer from "@/components/CodeSnippetViewer";
import { TECH_STACKS } from "@/lib/tutorialData";
import { useGetCoursesQuery } from "@/lib/api/courseApi";
import {
  Search,
  Sparkles,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Play,
  FileCode,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const [selectedTech, setSelectedTech] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("COURSES"); // COURSES | CHEATSHEETS

  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery();
  const allCourses = coursesData?.data || [];

  // Filter courses based on selected tech and search query
  const filteredCourses = useMemo(() => {
    return allCourses.filter((c) => {
      const matchesTech = !selectedTech || c.techId === selectedTech;
      const matchesSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.techId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTech && matchesSearch;
    });
  }, [allCourses, selectedTech, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Modern High-Impact Hero Banner */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-9 shadow-xl shadow-blue-500/15">
          <div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute top-2 right-12 w-28 h-28 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Modern W3Schools Alternative for Developers</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Learn React, Next.js, Node, Express & MongoDB Step-by-Step
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-xl leading-relaxed font-medium">
              Structured step-by-step courses, instant syntax cheatsheets,
              interactive revision flashcards, and practice quizzes designed for
              phone & desktop.
            </p>

            {/* Instant Search Bar */}
            <div className="relative mt-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search courses, hooks, syntax, MongoDB queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs sm:text-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/30 font-semibold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Action Navigation Pills */}
            <div className="flex items-center gap-2.5 mt-5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab("COURSES")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === "COURSES"
                    ? "bg-white text-blue-600 shadow-md"
                    : "bg-white/15 text-white hover:bg-white/20"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Step-by-Step Courses</span>
              </button>

              <Link
                href="/cheatsheets"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/20 transition-all whitespace-nowrap"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Instant Cheatsheets</span>
              </Link>

              <Link
                href="/revision"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/20 transition-all whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Revision Deck</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Tech Stack Selector Grid */}
        <TechStackGrid
          selectedTech={selectedTech}
          onSelectTech={setSelectedTech}
        />

        {/* Structured Courses Section (W3Schools Style Modernized) */}
        <section className="w-full mt-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                Popular Structured Courses
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Follow sequential chapter lessons from start to finish
              </p>
            </div>

            <Link
              href="/cheatsheets"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All Cheatsheets</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Courses Grid */}
          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-52 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course, idx) => {
                const tech = TECH_STACKS.find((t) => t.id === course.techId);
                const firstChapterSlug =
                  course.chapters?.[0]?.slug ||
                  course.chapters?.[0]?.id ||
                  "ch-1";
                const courseSlug = course.slug || course.techId || course.id;
                const rankNum = course.rank || idx + 1;

                return (
                  <div
                    key={course._id || course.id}
                    className="group relative flex flex-col justify-between p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            #{rankNum} Most Read
                          </span>
                          <span
                            className={`font-bold px-3 py-1 rounded-full ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
                          >
                            {tech?.name || course.techId}
                          </span>
                        </div>
                        <span className="text-zinc-400 font-medium">
                          {course.duration}
                        </span>
                      </div>

                      <Link href={`/courses/${courseSlug}`}>
                        <h3 className="font-extrabold text-lg sm:text-xl text-foreground leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {course.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-medium">
                        {course.subtitle}
                      </p>

                      {/* Chapter count badge & syllabus link */}
                      <div className="flex items-center justify-between text-xs font-bold mb-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span>
                            {course.chapterCount ??
                              course.chapters?.length ??
                              0}{" "}
                            Interactive Lessons
                          </span>
                        </div>
                        <Link
                          href={`/courses/${courseSlug}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                        >
                          View Syllabus
                        </Link>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${courseSlug}/${firstChapterSlug}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Course (Lesson 1)</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Swipeable Mobile Revision Deck */}
        <RevisionFlashcards selectedTech={selectedTech} />

        {/* Practice Quiz Callout Banner */}
        <section className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-[2.5rem] bg-linear-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 shadow-sm">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-foreground">
                Ready to test your knowledge?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Take quick 5-minute interactive quizzes on React, Next.js &
                Express
              </p>
            </div>
          </div>

          <Link
            href="/quiz"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center transition-all shadow-md shadow-blue-500/25 active:scale-95"
          >
            Start Quiz Mode
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
