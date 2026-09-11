"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  HelpCircle,
  MessageSquareText,
  Trophy,
} from "lucide-react";
import RevisionFlashcards from "@/components/home/RevisionFlashcards";

export default function HomeInterviewPrep({
  courses = [],
  selectedTech,
  examHref,
}) {
  return (
    <section id="interview-prep" className="scroll-mt-24 space-y-6 min-w-0">
      {/* Interview Questions Showcase */}
      <div className="rounded-4xl sm:rounded-[2.5rem] bg-linear-to-br from-orange-500/10 via-rose-500/10 to-amber-500/10 p-3.5 xs:p-5 sm:p-7 border border-orange-500/15 shadow-sm min-w-0 overflow-hidden">
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
            <MessageSquareText className="h-4 w-4" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]">
              Interview Preparation
            </span>
          </div>
          <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            Turn course knowledge into interview answers
          </h2>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Practice categorized questions, detailed answers, coding problems
            and real-world scenarios.
          </p>
        </div>

        <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 w-full min-w-0">
          {courses.slice(0, 4).map((course) => (
            <Link
              key={course._id || course.id}
              href={`/${course.slug}/interview-questions`}
              className="group flex items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-3 sm:p-4 shadow-xs hover:shadow-md transition-all active:scale-[0.99] w-full min-w-0 overflow-hidden"
            >
              <div className="flex h-9.5 w-9.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 group-hover:scale-105 transition-transform">
                <MessageSquareText className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="font-outfit block truncate text-xs sm:text-sm font-black text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {course.title}
                </span>
                <span className="mt-0.5 block truncate text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Practice interview Q&As &rarr;
                </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-orange-500 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* Flashcards & Exams Widget */}
      <div id="course-exams" className="scroll-mt-24 space-y-4">
        <div className="mb-2">
          <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <BrainCircuit className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
              Make Knowledge Stick
            </span>
          </div>
          <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
            Revision Flashcards, Quizzes & Course Exams
          </h2>
        </div>

        <RevisionFlashcards selectedTech={selectedTech} />

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/quiz"
            className="group rounded-3xl border border-blue-500/20 bg-linear-to-br from-blue-600/10 to-indigo-600/5 p-5 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <HelpCircle className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="font-outfit mt-4 text-base font-black text-zinc-900 dark:text-white">
              Practice Quizzes
            </h3>
            <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
              Quickly check concepts, find weak areas and revise before moving
              ahead.
            </p>
          </Link>

          <Link
            href={examHref}
            className="group rounded-3xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 to-orange-500/5 p-5 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <Trophy className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-amber-600 transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="font-outfit mt-4 text-base font-black text-zinc-900 dark:text-white">
              Course Exams
            </h3>
            <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
              Finish a course, take its exam and demonstrate complete-course
              expertise.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
