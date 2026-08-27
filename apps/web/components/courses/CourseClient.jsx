"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileChapterIndex from "@/components/courses/MobileChapterIndex";
import { TECH_STACKS } from "@/lib/tutorialData";
import {
  useGetCourseBySlugQuery,
  useGetCheatsheetsQuery,
} from "@/lib/api/courseApi";
import {
  ArrowLeft,
  Play,
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  FileCode,
  Brain,
  Layers,
  GraduationCap,
  MessagesSquare,
} from "lucide-react";
import SaveButton from "@/components/articles/SaveButton";
import AuthorIdentityCard from "@/components/authors/AuthorIdentityCard";
// ASIF_COURSE_LEARNING_FLOW_V1:course-progress-imports
import CourseProgressSummary, {
  ChapterStageProgress,
} from "@/components/courses/CourseProgressSummary";
import { useCourseProgress } from "@/lib/courseProgress";

export default function CourseClient({ initialData }) {
  const params = useParams();
  const courseId = params?.courseId;

  const { data, isLoading, isError } = useGetCourseBySlugQuery(courseId, {
    skip: !courseId,
  });
  const { data: cheatsheetsData } = useGetCheatsheetsQuery();
  const course = data?.data || initialData;
  const cheatsheets = cheatsheetsData?.data || [];
  const courseCheatsheet = cheatsheets.find(
    (cs) => cs.techId === course?.techId,
  );
  const isInitialLoading = !course && isLoading;
  const activeCourseSlug = course?.slug || courseId;
  const tech = course ? TECH_STACKS.find((t) => t.id === course.techId) : null;
  const firstChapterSlug = course?.chapters?.[0]?.slug || "ch-1";
  const examEnabled = Boolean(course?.examEnabled);
  const examSettings = course?.examSettings || {};
  // ASIF_COURSE_LEARNING_FLOW_V1:course-progress-hook
  const courseProgress = useCourseProgress(
    activeCourseSlug,
    course?.chapters || [],
  );
  const continueHref =
    courseProgress?.nextAction?.href ||
    `/${activeCourseSlug}/${firstChapterSlug}`;

  if (isInitialLoading) {
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
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-28 sm:pb-24">
      <Header />
      <MobileChapterIndex
        chapters={course.chapters}
        activeCourseSlug={activeCourseSlug}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 pt-36 sm:pt-44 flex flex-col gap-6">
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
        <section className="relative p-5 sm:p-9 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-5">
          {/* Floating Intentional Top-Right Bookmark Button */}
          <div className="absolute -top-3 right-4 sm:right-9 z-20">
            <SaveButton
              itemId={course._id}
              itemType="course"
              label="Save Course"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs border border-zinc-200/80 dark:border-zinc-700/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-md hover:shadow-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs pr-28 sm:pr-36">
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

          {/* Heading */}
          <h1 className="font-outfit text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-zinc-950 dark:text-white">
            {course.title}
          </h1>

          <p className="text-xs sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {course.subtitle}
          </p>

          {/* Main Primary Hero Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
            {/* Primary Action Button - Solid Primary Color without Gradient */}
            {/* ASIF_COURSE_LEARNING_FLOW_V1:course-primary-action */}
            <Link
              href={continueHref}
              className="group flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 active:scale-95 transition-all duration-200"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 text-white fill-current translate-x-0.5" />
              </div>
              {/* ASIF_COURSE_LEARNING_FLOW_V1:course-primary-label */}
              <span>
                {courseProgress?.overallProgress > 0
                  ? "Continue Learning"
                  : "Start (Lesson 1)"}
              </span>
            </Link>

            {/* Final Exam CTA - Secondary Button in Primary Blue Outline Style */}
            {examEnabled ? (
              <Link
                href={`/courses/${activeCourseSlug}/final-exam`}
                className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-blue-600 dark:border-blue-500 bg-transparent text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-xs sm:text-sm font-black active:scale-95 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span>Take Final Exam</span>
              </Link>
            ) : (
              <div
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200/40 dark:border-zinc-800/40 text-zinc-400 dark:text-zinc-500 text-xs font-bold cursor-not-allowed opacity-60"
                aria-disabled="true"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Final Exam Coming Soon</span>
              </div>
            )}
          </div>

          {/* Structured 4-Column Secondary Tools Bar with Primary Blue Rounded Outline Buttons */}
          <div className="mt-2 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block px-1">
              Course Tools & Resources
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
              {/* Cheatsheet Button */}
              {courseCheatsheet ? (
                <Link
                  href={`/cheatsheets/${courseCheatsheet.slug}`}
                  className="group flex items-center justify-center gap-2 px-3.5 py-3 rounded-full border border-blue-600/40 dark:border-blue-500/40 bg-transparent hover:bg-blue-50/70 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 text-xs font-bold active:scale-95 transition-all duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileCode className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">Cheatsheet</span>
                </Link>
              ) : (
                <div
                  className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-400 dark:text-zinc-500 text-xs font-bold cursor-not-allowed opacity-60"
                  aria-disabled="true"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span className="truncate">Cheatsheet Soon</span>
                </div>
              )}

              {/* Practice Quiz */}
              <Link
                href="/quiz"
                className="group flex items-center justify-center gap-2 px-3.5 py-3 rounded-full border border-blue-600/40 dark:border-blue-500/40 bg-transparent hover:bg-blue-50/70 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 text-xs font-bold active:scale-95 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Practice Quiz</span>
              </Link>

              {/* Flashcards */}
              <Link
                href="/revision"
                className="group flex items-center justify-center gap-2 px-3.5 py-3 rounded-full border border-blue-600/40 dark:border-blue-500/40 bg-transparent hover:bg-blue-50/70 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 text-xs font-bold active:scale-95 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Flashcards</span>
              </Link>

              {/* Interview Questions */}
              <Link
                href={`/${activeCourseSlug}/interview-questions`}
                className="group flex items-center justify-center gap-2 px-3.5 py-3 rounded-full border border-blue-600/40 dark:border-blue-500/40 bg-transparent hover:bg-blue-50/70 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 text-xs font-bold active:scale-95 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MessagesSquare className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">Interview Q&A</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ASIF_COURSE_LEARNING_FLOW_V1:course-progress-summary */}
        <CourseProgressSummary course={course} progress={courseProgress} />

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

        <AuthorIdentityCard
          author={course.author}
          publishedAt={course.createdAt}
          updatedAt={course.updatedAt}
          compact
        />

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

          {/* Master Unified Container Card for Chapters */}
          <div className="overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md border border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {course.chapters.map((ch, idx) => {
              const displayTitle = ch.title.replace(/^\d+[\.\s\-]+/, "");
              const chapterNumber = String(idx + 1).padStart(2, "0");
              const progressItem = courseProgress?.chapterMap?.[String(ch._id)];

              return (
                <div
                  key={ch._id || ch.slug}
                  className="group relative p-4 sm:p-5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Chapter Number Badge */}
                    <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-black text-xs sm:text-sm flex items-center justify-center border border-blue-500/20">
                      {chapterNumber}
                    </div>

                    {/* Content Block */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <Link
                        href={`/${activeCourseSlug}/${ch.slug}`}
                        className="block group/link"
                      >
                        <h3 className="font-outfit font-extrabold text-base sm:text-lg text-foreground group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors leading-snug">
                          {displayTitle}
                        </h3>
                      </Link>

                      {ch.summary && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                          {ch.summary}
                        </p>
                      )}

                      {/* ASIF_COURSE_LEARNING_FLOW_V1:chapter-stage-progress */}
                      <ChapterStageProgress progress={progressItem} />
                    </div>
                  </div>

                  {/* Right Action Row */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                    <SaveButton
                      itemId={ch._id}
                      itemType="chapter"
                      label="Save"
                      size="sm"
                      className="rounded-full px-3.5 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-none shadow-none"
                    />

                    <Link
                      href={`/${activeCourseSlug}/${ch.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md active:scale-95 transition-all group/btn"
                    >
                      <span>Start Lesson</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {examEnabled ? (
              <Link
                href={`/courses/${activeCourseSlug}/final-exam`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 hover:from-blue-500/10 hover:to-purple-500/10 transition-colors duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/25">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-extrabold text-base sm:text-lg text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Final Exam - Certification Test
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                      {examSettings.questionCount || 20} questions ·{" "}
                      {examSettings.durationMinutes || 30} minutes · Proctored ·
                      Earn your certificate
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs hover:shadow-md active:scale-95 transition-all self-end sm:self-center shrink-0">
                  <span>Take Exam</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ) : (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/60 opacity-80"
                aria-disabled="true"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-extrabold text-base text-zinc-500 dark:text-zinc-400">
                      Final Exam - Coming Soon
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                      The certification exam for this course is being prepared.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-400 self-end sm:self-center shrink-0">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
