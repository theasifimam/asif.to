"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TECH_STACKS } from "@/lib/tutorialData";
import { useGetCourseBySlugQuery } from "@/lib/api/courseApi";
import {
  ArrowLeft,
  Play,
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  FileCode,
} from "lucide-react";

export default function CourseOverviewPage() {
  const params = useParams();
  const courseId = params?.courseId;

  const { data, isLoading, isError } = useGetCourseBySlugQuery(courseId, {
    skip: !courseId,
  });
  const course = data?.data;
  const tech = course ? TECH_STACKS.find((t) => t.id === course.techId) : null;
  const firstChapterSlug = course?.chapters?.[0]?.slug || "ch-1";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 pb-24 sm:pb-12">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
          <div className="h-8 w-40 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-64 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 animate-pulse shadow-md" />
          <div className="h-48 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 animate-pulse shadow-sm" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-4xl bg-white dark:bg-zinc-900/90 animate-pulse shadow-sm"
            />
          ))}
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 pb-24 sm:pb-12">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">
            Course not found.
          </p>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline"
          >
            ← Back to All Courses
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Back Button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </Link>
        </div>

        {/* Course Hero Banner */}
        <section className="p-6 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span
              className={`font-bold px-3 py-1 rounded-full ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
            >
              {tech?.name || course.techId} Course
            </span>
            <div className="flex items-center gap-3 text-zinc-400 font-bold">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-blue-500" />
                {course.chapters.length} Lessons
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-xs sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {course.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href={`/courses/${courseId}/${firstChapterSlug}`}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Learning Course (Lesson 1)</span>
            </Link>

            <Link
              href="/cheatsheets"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 text-xs font-bold transition-all active:scale-95"
            >
              <FileCode className="w-4 h-4" />
              <span>View {tech?.name} Cheatsheet</span>
            </Link>
          </div>
        </section>

        {/* What You Will Learn Section */}
        <section className="p-6 sm:p-8 rounded-[2.5rem] bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            What You Will Learn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-foreground font-medium">
            {(course.learningOutcomes?.length
              ? course.learningOutcomes
              : [
                  `Fundamental to advanced core concepts of ${tech?.name || course.techId}`,
                  "Hands-on code examples & interactive syntax breakdowns",
                  "Real-world challenge problems & interview takeaways",
                  "Best practices for performance, scalability & clean code",
                ]
            ).map((outcome, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{outcome}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Course Index / Syllabus / Table of Contents */}
        <section className="space-y-4 mt-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
              Course Index & Syllabus ({course.chapters.length} Chapters)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Click any chapter below to jump directly to that lesson
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {course.chapters.map((ch, idx) => (
              <Link
                key={ch._id || ch.slug}
                href={`/courses/${courseId}/${ch.slug}`}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-200 ${
                  idx === 0 ? "rounded-t-[2.5rem]" : ""
                } ${idx === course.chapters.length - 1 ? "rounded-b-[2.5rem]" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-2xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/25">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 font-medium">
                      {ch.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 self-end sm:self-auto shrink-0">
                  <span>Start Lesson</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
