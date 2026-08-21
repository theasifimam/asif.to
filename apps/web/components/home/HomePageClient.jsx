"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Code2,
  FileCode,
  GraduationCap,
  HelpCircle,
  Layers,
  MessageSquareText,
  Play,
  Search,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SaveButton from "@/components/articles/SaveButton";
import RevisionFlashcards from "@/components/home/RevisionFlashcards";
import { TECH_STACKS } from "@/lib/tutorialData";

const FEATURES = [
  {
    title: "Multi-language Playground",
    description:
      "Write, edit and run HTML, CSS, JavaScript, React and Next.js code instantly.",
    href: "/run",
    icon: Code2,
    accent: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
  },
  {
    title: "Revision Flashcards",
    description:
      "Review important concepts quickly with focused, swipeable revision cards.",
    href: "/revision",
    icon: Layers,
    accent: "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400",
  },
  {
    title: "Practice Quizzes",
    description:
      "Check your understanding and find concepts that need another revision.",
    href: "/quiz",
    icon: HelpCircle,
    accent: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
  },
  {
    title: "Course Exams",
    description:
      "Test complete-course knowledge and use your result to showcase expertise.",
    href: "#course-exams",
    icon: Trophy,
    accent: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  },
  {
    title: "Interview Preparation",
    description:
      "Practice categorized questions with detailed, interview-ready answers.",
    href: "#interview-prep",
    icon: MessageSquareText,
    accent: "text-orange-600 bg-orange-500/10 dark:text-orange-400",
  },
  {
    title: "Developer Cheatsheets",
    description:
      "Keep syntax, commands and commonly used patterns within quick reach.",
    href: "/cheatsheets",
    icon: FileCode,
    accent: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  },
];

const LEARNING_STEPS = [
  [BookOpen, "Learn", "Structured lessons"],
  [Terminal, "Run", "Try code instantly"],
  [Layers, "Revise", "Use flashcards"],
  [HelpCircle, "Practice", "Take quizzes"],
  [MessageSquareText, "Prepare", "Interview Q&A"],
  [Trophy, "Prove", "Take the exam"],
];

export default function HomePageClient({ courses = [] }) {
  const [selectedTech, setSelectedTech] = useState(null);

  const activeTechs = useMemo(() => {
    const ids = new Set(courses.map((course) => course.techId));
    return TECH_STACKS.filter((tech) => ids.has(tech.id));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!selectedTech) return courses;
    return courses.filter((course) => course.techId === selectedTech);
  }, [courses, selectedTech]);

  const firstCourse = courses[0];
  const examHref = firstCourse ? `/courses/${firstCourse.slug}` : "#courses";

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("asif:open-search"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6 sm:gap-8 min-w-0">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-5 sm:p-8 shadow-xl shadow-blue-500/15">
          <div className="absolute -right-12 -bottom-14 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -top-16 right-24 h-44 w-44 rounded-full bg-blue-300/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid gap-5 md:grid-cols-[1.35fr_.65fr] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/10 text-[10px] sm:text-[11px] font-black tracking-wider uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Learn coding by doing, revising and proving
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-[2.65rem] font-black tracking-tight leading-[1.08]">
                Learn. Practice. Revise.{" "}
                <span className="text-yellow-300">Prove Your Skills.</span>
              </h1>

              <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed font-medium text-blue-100">
                Structured courses, a multi-language playground, flashcards,
                quizzes, interview preparation, cheatsheets and course exams —
                all in one focused developer learning platform.
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <a
                  href="#courses"
                  className="h-11 inline-flex items-center justify-center gap-2 px-5 rounded-full bg-white text-blue-600 hover:bg-blue-50 text-xs font-black shadow-lg active:scale-95 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  Start Learning
                </a>
                <Link
                  href="/run"
                  className="h-11 inline-flex items-center justify-center gap-2 px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black active:scale-95 transition-all"
                >
                  <Code2 className="w-4 h-4" />
                  Open Playground
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-3xl bg-white/10 border border-white/15 p-3 backdrop-blur-sm">
              {[
                [BookOpen, "Courses"],
                [Code2, "Playground"],
                [Layers, "Flashcards"],
                [HelpCircle, "Quizzes"],
                [MessageSquareText, "Interviews"],
                [Trophy, "Exams"],
              ].map(([Icon, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-[11px] font-bold"
                >
                  <Icon className="w-3.5 h-3.5 text-yellow-300" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              readOnly
              aria-label="Open global search"
              placeholder="Search courses, concepts, interview questions, cheatsheets..."
              onFocus={openSearch}
              onClick={openSearch}
              className="w-full h-12 pl-11 pr-14 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs sm:text-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/30 font-semibold"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">
              ⌘K
            </kbd>
          </div>
        </section>

        {/* Best features */}
        <section aria-labelledby="best-features">
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                Built for active learning
              </span>
            </div>
            <h2
              id="best-features"
              className="mt-1 text-lg sm:text-2xl font-black tracking-tight"
            >
              More than tutorials — everything you need to master a technology
            </h2>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Understand the concept, experiment with it, revise it, test
              yourself and prepare to explain it confidently.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(
              ({ title, description, href, icon: Icon, accent }) => (
                <Link
                  key={title}
                  href={title === "Course Exams" ? examHref : href}
                  className="group flex min-h-44 flex-col justify-between rounded-3xl border border-zinc-200/70 bg-white p-4 sm:p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  <div>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 text-sm sm:text-base font-black group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {title}
                    </h3>
                    <p className="mt-1 text-[11px] sm:text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                      {description}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-black text-blue-600 dark:text-blue-400">
                    Explore{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ),
            )}
          </div>
        </section>

        {/* Courses — single discovery area replacing Technologies & Frameworks duplication */}
        <section id="courses" className="scroll-mt-24">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <GraduationCap className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                  Structured learning
                </span>
              </div>
              <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
                Explore Courses
              </h2>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Pick a technology and follow its lessons from fundamentals to
                advanced topics.
              </p>
            </div>
            <Link
              href="/cheatsheets"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Quick reference <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedTech(null)}
              className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-black transition-all ${
                !selectedTech
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-300"
              }`}
            >
              All courses
            </button>
            {activeTechs.map((tech) => (
              <button
                key={tech.id}
                type="button"
                onClick={() => setSelectedTech(tech.id)}
                className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-black transition-all ${
                  selectedTech === tech.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-300"
                }`}
              >
                {tech.name}
              </button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredCourses.map((course, idx) => {
              const tech = TECH_STACKS.find(
                (item) => item.id === course.techId,
              );
              const rankNum = course.rank || idx + 1;

              return (
                <article
                  key={course._id || course.id}
                  className="group flex flex-col justify-between rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        #{rankNum} Most Read
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
                      >
                        {tech?.name || course.techId}
                      </span>
                    </div>

                    <Link href={`/courses/${course.slug}`}>
                      <h3 className="text-base sm:text-lg font-extrabold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {course.subtitle}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-3 text-[11px] font-bold text-zinc-400">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        {course.chapterCount ??
                          course.chapters?.length ??
                          0}{" "}
                        Lessons
                      </span>
                      {course.duration && <span>{course.duration}</span>}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Start
                        Course
                      </Link>
                      <SaveButton
                        itemId={course._id}
                        itemType="course"
                        label="Save"
                        size="sm"
                        className="h-11 shrink-0 px-4"
                      />
                    </div>
                    <Link
                      href={`/${course.slug}/interview-questions`}
                      className="flex h-9 items-center justify-center gap-2 rounded-full text-xs font-bold text-orange-600 hover:bg-orange-500/10 dark:text-orange-400 transition-colors"
                    >
                      <MessageSquareText className="w-3.5 h-3.5" /> Interview
                      Questions
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Learning loop */}
        <section className="rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 p-4 sm:p-7 shadow-xs">
          <div className="mx-auto max-w-xl text-center">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
              One learning loop
            </span>
            <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
              Learn → Practice → Master
            </h2>
            <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              The platform is designed to take you from first explanation to
              confident recall and real interview readiness.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {LEARNING_STEPS.map(([Icon, label, detail], index) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3 text-center"
              >
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-2 block text-xs font-black">
                  {index + 1}. {label}
                </span>
                <span className="mt-0.5 block text-[10px] font-medium text-zinc-500">
                  {detail}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Playground preview */}
        <section className="grid gap-4 md:grid-cols-[.9fr_1.1fr] rounded-3xl sm:rounded-[2.5rem] bg-linear-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-blue-500/15 p-4 sm:p-7">
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Code2 className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                Code Playground
              </span>
            </div>
            <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
              Don't just read code. Run it.
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
              Experiment in the browser with HTML, CSS, JavaScript, React and
              Next.js without leaving your learning flow.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["HTML", "CSS", "JavaScript", "React", "Next.js"].map(
                (language) => (
                  <span
                    key={language}
                    className="rounded-full border border-blue-500/15 bg-white/80 dark:bg-zinc-900 px-2.5 py-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-300"
                  >
                    {language}
                  </span>
                ),
              )}
            </div>
            <Link
              href="/run"
              className="mt-5 h-11 w-fit inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-xs font-black text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Try the Playground
            </Link>
          </div>

          <div className="min-h-64 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500">
                playground.js
              </span>
            </div>
            <div className="grid min-h-52 grid-cols-[1fr_.8fr]">
              <pre className="overflow-hidden whitespace-pre-wrap border-r border-zinc-800 p-4 text-[10px] sm:text-[11px] leading-6 text-zinc-300">{`const skills = [
  "learn",
  "practice",
  "revise"
];

console.log(
  skills.join(" → ")
);`}</pre>
              <div className="bg-zinc-900/60 p-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                  Output
                </span>
                <p className="mt-3 text-[10px] sm:text-[11px] font-mono leading-5 text-emerald-400">
                  learn → practice → revise
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Revision, quiz and exam */}
        <section id="course-exams" className="scroll-mt-24">
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <BrainCircuit className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                Make knowledge stick
              </span>
            </div>
            <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
              Revise, test yourself and prove what you know
            </h2>
            <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Flashcards build recall, quizzes expose weak areas and course
              exams provide a deeper final assessment.
            </p>
          </div>

          <RevisionFlashcards selectedTech={selectedTech} />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/quiz"
              className="group rounded-3xl border border-blue-500/15 bg-linear-to-br from-blue-600/10 to-indigo-600/5 p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <HelpCircle className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-4 text-base font-black">Practice Quiz</h3>
              <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                Quickly check concepts, find weak areas and revise before moving
                ahead.
              </p>
            </Link>

            <Link
              href={examHref}
              className="group rounded-3xl border border-amber-500/15 bg-linear-to-br from-amber-500/10 to-orange-500/5 p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                  <Trophy className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-amber-600 transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-4 text-base font-black">Course Exam</h3>
              <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                Finish a course, take its exam and demonstrate complete-course
                expertise.
              </p>
            </Link>
          </div>
        </section>

        {/* Interview preparation */}
        <section
          id="interview-prep"
          className="scroll-mt-24 rounded-3xl sm:rounded-[2.5rem] bg-linear-to-br from-orange-500/10 via-rose-500/10 to-amber-500/10 p-4 sm:p-7 border border-orange-500/15 shadow-xs"
        >
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
              <MessageSquareText className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]">
                Interview Prep
              </span>
            </div>
            <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
              Turn course knowledge into interview answers
            </h2>
            <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Practice categorized questions, detailed answers, coding problems
              and real-world scenarios by course.
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {courses.slice(0, 4).map((course) => (
              <Link
                key={course._id || course.id}
                href={`/${course.slug}/interview-questions`}
                className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl sm:rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-900/90 p-3.5 sm:p-4 shadow-xs transition-all hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs sm:text-sm font-black group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {course.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                    Practice interview questions →
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-orange-500 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-blue-600 p-5 sm:p-7 text-white shadow-lg shadow-blue-500/15">
          <div className="absolute -right-10 -bottom-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
                Choose one technology. Start today.
              </span>
              <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
                Build understanding you can actually use.
              </h2>
              <p className="mt-1 max-w-xl text-xs font-medium text-blue-100">
                Learn the concept, run the code, revise it, test it and prepare
                to explain it confidently.
              </p>
            </div>
            <a
              href="#courses"
              className="h-11 shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 text-xs font-black text-blue-600 shadow-md hover:bg-blue-50 active:scale-95 transition-all"
            >
              Explore Courses <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
