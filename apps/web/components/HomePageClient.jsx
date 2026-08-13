"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import SaveButton from "@/components/SaveButton";
import Footer from "@/components/Footer";
import TechStackGrid from "@/components/home/TechStackGrid";
import RevisionFlashcards from "@/components/home/RevisionFlashcards";
import { TECH_STACKS } from "@/lib/tutorialData";
import {
  Search,
  Sparkles,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Play,
  FileCode,
  Layers,
  MessageSquareText,
  Code2,
} from "lucide-react";

export default function HomePageClient({ courses = [] }) {
  const [selectedTech, setSelectedTech] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("COURSES"); // COURSES | CHEATSHEETS
  const allCourses = courses;

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

  const activeTechIds = useMemo(() => {
    return Array.from(new Set(allCourses.map((c) => c.techId)));
  }, [allCourses]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-5 sm:gap-6 min-w-0">
        {/* Modern High-Impact Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-5 sm:p-8 shadow-xl shadow-blue-500/15 min-w-0">
          <div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute top-2 right-12 w-28 h-28 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-black tracking-wider uppercase mb-3 max-w-full truncate">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span className="truncate">
                asif.to • Step-by-Step Coding Tutorials & Cheatsheets
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Master React, Next.js, Node & MongoDB on{" "}
              <span className="underline decoration-yellow-300 decoration-wavy decoration-2">
                asif.to
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-xl leading-relaxed font-medium">
              Your go-to hub for structured web development tutorials, instant
              syntax cheatsheets, interactive revision flashcards, and practice
              quizzes designed for phone & desktop.
            </p>

            {/* Instant Search Bar */}
            <div className="relative mt-4 sm:mt-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search courses, hooks, syntax, MongoDB queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-12 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs sm:text-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/30 font-semibold"
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
            <div className="flex items-center gap-2 mt-4 sm:mt-5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              <button
                onClick={() => setActiveTab("COURSES")}
                className={`h-9 shrink-0 inline-flex items-center gap-1.5 px-3.5 rounded-full text-xs font-bold transition-all ${
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
                className="h-9 shrink-0 inline-flex items-center gap-1.5 px-3.5 rounded-full text-xs font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap shadow-md"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Playground</span>
              </Link>

              <Link
                href="/cheatsheets"
                className="h-9 shrink-0 inline-flex items-center gap-1.5 px-3.5 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/20 transition-all whitespace-nowrap"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Instant Cheatsheets</span>
              </Link>

              <Link
                href="/revision"
                className="h-9 shrink-0 inline-flex items-center gap-1.5 px-3.5 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/20 transition-all whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Revision Deck</span>
              </Link>

              <a
                href="#interview-prep"
                className="h-9 shrink-0 inline-flex items-center gap-1.5 px-3.5 rounded-full text-xs font-bold bg-white/15 text-white hover:bg-white/20 transition-all whitespace-nowrap"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Interview Prep</span>
              </a>
            </div>
          </div>
        </section>

        {/* 4 Feature Cards */}
        <section
          aria-labelledby="explore-learning"
          className="grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-4 min-w-0"
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
              color: "text-blue-600 bg-blue-500/10",
            },
            {
              href: "/practice",
              icon: Code2,
              label: "Code practice",
              detail: "Edit and run code",
              color: "text-purple-600 bg-purple-500/10",
            },
            {
              href: "#interview-prep",
              icon: MessageSquareText,
              label: "Interviews",
              detail: "Q&A library",
              color: "text-orange-600 bg-orange-500/10",
            },
            {
              href: "/cheatsheets",
              icon: FileCode,
              label: "Cheatsheets",
              detail: "Quick syntax",
              color: "text-emerald-600 bg-emerald-500/10",
            },
          ].map(({ href, icon: Icon, label, detail, color }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-3xl border border-zinc-200/70 bg-white shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 min-h-[105px] sm:min-h-[115px]"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl ${color}`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div>
                <h3 className="mt-2 text-xs sm:text-sm font-black text-foreground group-hover:text-blue-600 transition-colors truncate">
                  {label}
                </h3>
                <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-zinc-500 truncate">
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

        {/* Structured Courses Section */}
        <section id="courses" className="w-full mt-2 scroll-mt-24 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black tracking-tight text-foreground truncate">
                Popular Structured Courses
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
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

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((course, idx) => {
              const tech = TECH_STACKS.find((t) => t.id === course.techId);
              const rankNum = course.rank || idx + 1;

              return (
                <div
                  key={course._id || course.id}
                  className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl sm:rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm hover:shadow-md border border-zinc-200/70 dark:border-zinc-800/70 transition-all duration-300 min-w-0 overflow-hidden"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 text-xs mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          #{rankNum} Most Read
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
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
                      <h3 className="font-extrabold text-base sm:text-lg text-foreground leading-snug mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.8rem]">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-medium min-h-[2.2rem]">
                      {course.subtitle}
                    </p>

                    {/* Chapter count badge & syllabus link */}
                    <div className="flex items-center justify-between text-xs font-bold mb-4 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[11px]">
                          {course.chapterCount ?? course.chapters?.length ?? 0}{" "}
                          Lessons
                        </span>
                      </div>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                      >
                        View Syllabus &rarr;
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex flex-1 h-11 items-center justify-center gap-2 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Course</span>
                      </Link>
                      <SaveButton
                        itemId={course._id}
                        itemType="course"
                        label="Save"
                        size="sm"
                        className="shrink-0 h-11 px-4"
                      />
                    </div>
                    <Link
                      href={`/${course.slug}/interview-questions`}
                      className="flex h-9 items-center justify-center gap-2 rounded-full text-xs font-bold text-orange-600 hover:bg-orange-500/10 dark:text-orange-400 transition-colors"
                    >
                      <MessageSquareText className="w-3.5 h-3.5" />
                      <span>Interview Questions</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interview Prep Course Cards */}
        <section
          id="interview-prep"
          className="scroll-mt-24 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-orange-500/10 via-rose-500/10 to-amber-500/10 p-4 sm:p-7 shadow-xs border border-orange-500/15 overflow-hidden min-w-0"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <MessageSquareText className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]">
                  Interview Prep
                </span>
              </div>
              <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight text-foreground">
                Practice questions by course
              </h2>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Open a course to get interview-ready answers, topics, and code
                solutions.
              </p>
            </div>
          </div>
          <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
            {allCourses.slice(0, 4).map((course) => (
              <Link
                key={course._id || course.id}
                href={`/${course.slug}/interview-questions`}
                className="group flex items-center justify-between gap-3 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-zinc-900/90 p-3.5 sm:p-4 transition-all hover:bg-white hover:shadow-md dark:hover:bg-zinc-900 shadow-xs min-h-[64px] min-w-0 overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs sm:text-sm font-black text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {course.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-zinc-500 truncate">
                    Course interview questions &rarr;
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-orange-500 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Swipeable Mobile Revision Deck */}
        <RevisionFlashcards selectedTech={selectedTech} />

        {/* Practice Quiz Callout Banner */}
        <section className="flex flex-col sm:flex-row items-center justify-between p-5 sm:p-7 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/15 shadow-xs overflow-hidden min-w-0 gap-4">
          <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-foreground truncate">
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
            className="w-full sm:w-auto h-11 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center inline-flex items-center justify-center transition-all shadow-md shadow-blue-500/25 active:scale-95 shrink-0"
          >
            Start Quiz Mode
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
