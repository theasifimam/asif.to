"use client";

import React, { useState, useMemo } from "react";
// ASIF_COURSE_LEARNING_FLOW_V1:revision-imports
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { recordCourseStage } from "@/lib/courseProgress";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RevisionFlashcards from "@/components/home/RevisionFlashcards";
import { TECH_STACKS } from "@/lib/tutorialData";
import { useGetCoursesQuery } from "@/lib/api/courseApi";
import { getImageUrl } from "@/lib/config";
import {
  Layers,
  Sparkles,
  BookOpen,
  HelpCircle,
  Search,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

export default function RevisionPage() {
  // ASIF_COURSE_LEARNING_FLOW_V1:revision-query-state
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCourse = searchParams.get("course");
  const initialChapter = searchParams.get("chapter");

  const [selectedTech, setSelectedTech] = useState(initialCourse || null);
  const [selectedChapterId, setSelectedChapterId] = useState(
    initialChapter || null,
  );
  const [search, setSearch] = useState("");

  const { data: coursesResponse } = useGetCoursesQuery();
  const courses = coursesResponse?.data || [];

  // Filter courses based on search & tech filter
  const filteredCourses = useMemo(() => {
    let list = courses;
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
          c.techId?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [courses, selectedTech, search]);

  const activeCourseObj = courses.find(
    (c) =>
      c.slug === selectedTech ||
      c.techId === selectedTech ||
      c._id === selectedTech,
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold text-zinc-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-200">
            Revision Flashcards
          </span>
        </nav>

        {/* Top Mode Switcher Bar */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs w-fit">
          <Link
            href="/courses"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Courses</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Layers className="w-4 h-4" />
            <span>Flashcards Deck</span>
          </div>
          <Link
            href="/quiz"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <span>Practice Quiz</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <Layers className="h-3.5 w-3.5" />
              <span>Interactive Active-Recall Flashcards</span>
            </div>

            <h1 className="font-outfit text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
              Course Revision & Interview Decks
            </h1>

            <p className="mt-3 text-xs sm:text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Select a course deck below to flip through essential syntax, core
              concepts, framework hooks, and interview answers organized by
              course.
            </p>

            {/* Quick Stats Pill Strip */}
            <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>{courses.length} Course Decks</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Spaced Active Recall</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>100% Mobile Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search flashcards by course or tech stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-11 pr-5 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                setSelectedTech(null);
                setSelectedChapterId(null);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                !selectedTech
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-500"
              }`}
            >
              All Tech Decks
            </button>
            {TECH_STACKS.map((tech) => (
              <button
                key={tech.id}
                onClick={() => {
                  setSelectedTech(tech.id);
                  setSelectedChapterId(null);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTech === tech.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-500"
                }`}
              >
                {tech.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── Active Flashcard Deck Player (When Selected or Default) ── */}
        <div id="active-flashcard-player" className="scroll-mt-24">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs mb-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>
                  {activeCourseObj ? activeCourseObj.title : "All Courses"}{" "}
                  Flashcard Deck:
                </strong>{" "}
                Tap card to reveal answer. Flip through cards for spaced recall
                revision.
              </span>
            </div>
            {selectedTech && (
              <button
                onClick={() => {
                  setSelectedTech(null);
                  setSelectedChapterId(null);
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="max-w-3xl mx-auto">
            {/* ASIF_COURSE_LEARNING_FLOW_V1:revision-deck */}
            <RevisionFlashcards
              selectedTech={selectedTech}
              selectedChapterId={selectedChapterId}
              onDeckComplete={() => {
                if (selectedTech && selectedChapterId) {
                  recordCourseStage({
                    courseSlug: selectedTech,
                    chapterId: selectedChapterId,
                    stage: "revise",
                    completed: true,
                  });
                }
              }}
            />
          </div>
        </div>

        {/* ── Course Flashcard Decks Grid (Categorized like Courses are shown) ── */}
        <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                Browse Flashcard Decks by Course
              </h2>
            </div>
            <span className="text-[11px] font-bold text-zinc-400">
              Select course to view its flashcard deck
            </span>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const slug = course.slug || course.id || course._id;
                const isSelected =
                  selectedTech === course.slug ||
                  selectedTech === course.techId ||
                  selectedTech === course._id;

                return (
                  <article
                    key={course._id || slug}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-4xl border bg-white dark:bg-zinc-900/90 p-5 shadow-xs transition-all hover:shadow-md ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20"
                        : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-400"
                    }`}
                  >
                    <div>
                      {/* Thumbnail or Fallback Icon Header */}
                      {course.thumbnail ? (
                        <div className="relative mb-3.5 block w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 aspect-[2.2/1] border border-zinc-200/60 dark:border-zinc-800">
                          <Image
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-103"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="relative mb-3.5 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900 aspect-[2.2/1] border border-blue-500/20">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Layers className="h-5 w-5" />
                          </div>
                          <span className="mt-1 font-outfit text-xs font-black tracking-tight text-zinc-900 dark:text-white">
                            {course.title.split(":")[0]}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider bg-blue-100/90 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50">
                          {course.techId
                            ? course.techId.toUpperCase()
                            : "FLASHCARD DECK"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-blue-700 dark:text-blue-300 bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                          <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          <span>Active Recall</span>
                        </span>
                      </div>

                      <h3 className="font-outfit text-base font-black tracking-tight text-zinc-950 dark:text-white line-clamp-1 mt-1">
                        {course.title}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                        {course.description ||
                          `Practice key syntax, formulas, and concepts for ${course.title} with active recall cards.`}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <span>{course.chapterCount || 10}+ Cards</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTech(course.slug || course.techId);
                          setSelectedChapterId(null);
                          setTimeout(() => {
                            document
                              .getElementById("active-flashcard-player")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }, 50);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-blue-500/20"
                            : "bg-zinc-900 text-white hover:bg-blue-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-blue-600 dark:hover:text-white"
                        }`}
                      >
                        <span>
                          {isSelected ? "Practicing Deck" : "Start Deck"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
              <Layers className="w-10 h-10 text-zinc-400 mb-2" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                No Flashcard Decks Found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                No flashcard decks matched your filter search criteria.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedTech(null);
                }}
                className="mt-4 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* Revision Tips Box */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex items-start gap-4 border border-zinc-200/80 dark:border-zinc-800">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-extrabold text-foreground text-sm">
              Mobile Revision Best Practice
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Try recalling the answer or syntax in your head before flipping
              the card. Revisit saved cards 10 minutes before your technical
              interviews!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
