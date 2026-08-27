"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileCode,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  Layers3,
  MessageSquareText,
  Newspaper,
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
import { useGetArticlesQuery } from "@/lib/api/articlesApi";
import { useGetPublicTopicsQuery } from "@/lib/api/topicsApi";
import { getImageUrl } from "@/lib/config";
import { format } from "date-fns";

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

function getTopicHref(topic) {
  if (!topic) return "#";
  const courseSlug = topic.course?.slug || "courses";
  if (
    topic.type === "interview" &&
    topic.category?.slug &&
    topic.category.slug !== topic.slug
  ) {
    return `/${encodeURIComponent(courseSlug)}/${encodeURIComponent(topic.category.slug)}/${encodeURIComponent(topic.slug)}`;
  }
  return `/${encodeURIComponent(courseSlug)}/${encodeURIComponent(topic.slug)}`;
}

function getArticleHref(article) {
  if (!article) return "/articles";
  const slug = article.slug || article._id;
  return `/articles/${encodeURIComponent(slug)}-${encodeURIComponent(article._id || article.id)}`;
}

const getTechColorClasses = (techId) => {
  const colors = {
    reactjs: {
      card: "border-blue-200/70 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-blue-500/10",
      btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    },
    nextjs: {
      card: "border-amber-200/70 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-amber-500/10",
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
    },
    javascript: {
      card: "border-emerald-200/70 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-emerald-500/10",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
    },
    css: {
      card: "border-purple-200/70 dark:border-purple-900/50 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-purple-500/10",
      btn: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20",
    },
    typescript: {
      card: "border-teal-200/70 dark:border-teal-900/50 hover:border-teal-300 dark:hover:border-teal-800 hover:shadow-teal-500/10",
      btn: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20",
    },
    nodejs: {
      card: "border-green-200/70 dark:border-green-900/50 hover:border-green-300 dark:hover:border-green-800 hover:shadow-green-500/10",
      btn: "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20",
    },
    mongodb: {
      card: "border-emerald-200/70 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-emerald-500/10",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
    },
    expressjs: {
      card: "border-zinc-300/70 dark:border-zinc-700/50 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-zinc-500/10",
      btn: "bg-zinc-700 hover:bg-zinc-800 text-white shadow-zinc-500/20",
    },
    tailwindcss: {
      card: "border-sky-200/70 dark:border-sky-900/50 hover:border-sky-300 dark:hover:border-sky-800 hover:shadow-sky-500/10",
      btn: "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20",
    },
  };

  return (
    colors[techId] || {
      card: "border-zinc-200/70 dark:border-zinc-800/70 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md",
      btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    }
  );
};

export default function HomePageClient({
  courses = [],
  initialTopics = [],
  initialArticles = [],
}) {
  const [selectedTech, setSelectedTech] = useState(null);
  const coursesScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkCoursesScroll = useCallback(() => {
    if (!coursesScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = coursesScrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = coursesScrollRef.current;
    if (!el) return;
    checkCoursesScroll();
    el.addEventListener("scroll", checkCoursesScroll, { passive: true });
    window.addEventListener("resize", checkCoursesScroll);
    return () => {
      el.removeEventListener("scroll", checkCoursesScroll);
      window.removeEventListener("resize", checkCoursesScroll);
    };
  }, [checkCoursesScroll]);

  const scrollCourses = (direction) => {
    if (!coursesScrollRef.current) return;
    const { clientWidth } = coursesScrollRef.current;
    const scrollAmount = Math.max(300, clientWidth * 0.75);
    coursesScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleSelectTech = (techId) => {
    setSelectedTech(techId);
    if (coursesScrollRef.current) {
      coursesScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const { data: topicsResponse } = useGetPublicTopicsQuery(
    { limit: 12 },
    { skip: Boolean(initialTopics?.length > 0) },
  );
  const { data: articlesResponse } = useGetArticlesQuery(
    { limit: 6 },
    { skip: Boolean(initialArticles?.length > 0) },
  );

  const allTopics = useMemo(() => {
    if (initialTopics?.length) return initialTopics;
    return topicsResponse?.data?.topics || [];
  }, [initialTopics, topicsResponse]);

  const allArticles = useMemo(() => {
    if (initialArticles?.length) return initialArticles;
    return articlesResponse?.data || [];
  }, [initialArticles, articlesResponse]);

  const filteredTopics = useMemo(() => {
    if (!selectedTech) return allTopics;
    return allTopics.filter(
      (topic) =>
        topic.course?.techId === selectedTech ||
        topic.course?.slug === selectedTech,
    );
  }, [allTopics, selectedTech]);

  const displayTopics = (
    filteredTopics.length > 0 ? filteredTopics : allTopics
  ).slice(0, 6);
  const displayArticles = allArticles.slice(0, 6);

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

      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-8 sm:gap-12 min-w-0">
        {/* 1. HERO BANNER */}
        <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-blue-600 text-white p-6 sm:p-9 shadow-xl shadow-blue-500/15">
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.3fr_.7fr] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/10 text-[10px] sm:text-[11px] font-black tracking-wider uppercase mb-3.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Learn coding by doing, revising and proving
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-[2.65rem] font-black tracking-tight leading-[1.08]">
                Learn. Practice. Revise.{" "}
                <span className="text-yellow-300">Prove Your Skills.</span>
              </h1>

              <p className="mt-3.5 max-w-xl text-xs sm:text-sm leading-relaxed font-medium text-blue-100">
                Structured courses, a multi-language playground, flashcards,
                quizzes, interview preparation, cheatsheets and course exams —
                all in one focused developer learning platform.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
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

            {/* Quick Hub Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-3xl bg-white/10 border border-white/15 p-3 backdrop-blur-sm">
              {[
                [BookOpen, "Courses", "#courses"],
                [Layers3, "Topics", "#topics"],
                [Code2, "Playground", "/run"],
                [FileText, "Articles", "#articles"],
                [Layers, "Flashcards", "#revision"],
                [HelpCircle, "Quizzes", "/quiz"],
                [MessageSquareText, "Interviews", "#interview-prep"],
                [Trophy, "Exams", "#course-exams"],
              ].map(([Icon, label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-[11px] font-bold hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-yellow-300" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Interactive Global Search Input */}
          <div className="relative z-10 mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              readOnly
              aria-label="Open global search"
              placeholder="Search courses, concepts, interview questions, cheatsheets..."
              onFocus={openSearch}
              onClick={openSearch}
              className="w-full h-12 pl-11 pr-14 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs sm:text-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/30 font-semibold cursor-pointer"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">
              ⌘K
            </kbd>
          </div>
        </section>

        {/* 2. STRUCTURED COURSES SECTION */}
        <section id="courses" className="scroll-mt-24">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <GraduationCap className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                  Structured Learning
                </span>
              </div>
              <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
                Explore Courses & Tracks
              </h2>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Pick a technology and follow step-by-step lessons from
                fundamentals to advanced patterns.
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
                  onClick={() => scrollCourses("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous courses"
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-xs transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCourses("right")}
                  disabled={!canScrollRight}
                  aria-label="Next courses"
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-xs transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tech Stack Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSelectTech(null)}
              className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-black transition-all cursor-pointer ${
                !selectedTech
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-300"
              }`}
            >
              All courses
            </button>
            {activeTechs.map((tech) => (
              <button
                key={tech.id}
                type="button"
                onClick={() => handleSelectTech(tech.id)}
                className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-black transition-all cursor-pointer ${
                  selectedTech === tech.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-blue-300"
                }`}
              >
                {tech.name}
              </button>
            ))}
          </div>

          {/* Compact Course Cards Horizontally Slidable */}
          <div
            ref={coursesScrollRef}
            className="mt-3 flex gap-4 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory py-1.5 -mx-1 px-1 min-w-0"
          >
            {filteredCourses.map((course, idx) => {
              const tech = TECH_STACKS.find(
                (item) => item.id === course.techId,
              );
              const rankNum = course.rank || idx + 1;
              const lessonCount =
                course.chapterCount ?? course.chapters?.length ?? 0;
              const techColors = getTechColorClasses(course.techId);

              return (
                <article
                  key={course._id || course.id}
                  className={`group flex w-71.25 sm:w-[320px] md:w-85 shrink-0 snap-start flex-col justify-between rounded-3xl border bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-xs transition-all ${techColors.card}`}
                >
                  <div>
                    {course.thumbnail ? (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="relative mb-3 block w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 aspect-[2.1/1] border border-zinc-200/60 dark:border-zinc-800"
                      >
                        <Image
                          src={getImageUrl(course.thumbnail)}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-103"
                          unoptimized
                        />
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="relative mb-3 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-blue-50/50 dark:bg-zinc-800/80 aspect-[2.1/1] border border-zinc-200/70 dark:border-zinc-800 transition-all group-hover:border-blue-500/40"
                      >
                        <div className="relative z-10 flex items-center gap-2.5 p-3 text-left">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80 group-hover:scale-105 group-hover:border-blue-500 transition-all">
                            <GraduationCap className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-outfit text-xs font-black tracking-tight text-zinc-800 dark:text-zinc-200 block truncate">
                              {course.title}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block truncate">
                              {tech?.name ||
                                course.techId ||
                                "Interactive Course"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )}

                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        #{rankNum} Most Read
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
                      >
                        {tech?.name || course.techId}
                      </span>
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-500 dark:text-zinc-400">
                        {lessonCount} Lessons
                      </span>
                    </div>

                    <Link href={`/courses/${course.slug}`}>
                      <h3 className="text-sm sm:text-base font-extrabold leading-snug line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-[11px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {course.subtitle}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <SaveButton
                        itemId={course._id}
                        itemType="course"
                        label="Save"
                        size="sm"
                        className="h-8 shrink-0 px-2.5 text-[11px]"
                      />
                      <Link
                        href={`/${course.slug}/interview-questions`}
                        title="Interview Questions"
                        className="h-8 px-2.5 inline-flex items-center gap-1 rounded-full text-[10px] font-bold text-orange-600 hover:bg-orange-500/10 dark:text-orange-400 transition-colors border border-orange-200/50 dark:border-orange-900/30"
                      >
                        <MessageSquareText className="w-3 h-3" />
                        <span className="hidden xs:inline">Interview Q&A</span>
                      </Link>
                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      className={`h-8.5 inline-flex items-center gap-1.5 rounded-full px-3.5 text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 ${techColors.btn}`}
                    >
                      <Play className="w-3 h-3 fill-current" /> Start Course
                    </Link>
                  </div>
                </article>
              );
            })}

            {/* Catalog Pill Card */}
            <article className="group relative flex w-71.25 sm:w-[320px] md:w-85 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl border border-blue-500/25 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-500/50 transition-all duration-300">
              <div className="flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </span>
                  <span className="rounded-full bg-blue-500/15 border border-blue-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {courses.length > 3
                      ? `+${courses.length - 3} More Courses`
                      : "Catalog"}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Explore Full Curriculum
                </h3>

                <p className="mt-1 text-[11px] leading-relaxed font-medium text-zinc-600 dark:text-zinc-300 line-clamp-2">
                  Browse our full interactive curriculum across React, Next.js,
                  JavaScript, TypeScript, CSS, Node.js, and more.
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {activeTechs.slice(0, 5).map((tech) => (
                    <span
                      key={tech.id}
                      className="rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 text-[9px] font-bold text-zinc-600 dark:text-zinc-300"
                    >
                      {tech.name}
                    </span>
                  ))}
                  {activeTechs.length > 5 && (
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-400">
                      +{activeTechs.length - 5}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                  {courses.length} Courses
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

        {/* 3. INTERACTIVE BENTO SHOWCASE (PLAYGROUND + ENGINE) */}
        <section className="grid gap-4 md:grid-cols-[1.1fr_.9fr]">
          {/* Playground Bento Card */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-zinc-950 text-white p-5 sm:p-7 border border-zinc-800 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-400">
                <Code2 className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                  Browser Code Playground
                </span>
              </div>
              <h3 className="mt-2 text-xl sm:text-2xl font-black tracking-tight">
                Don't just read code.{" "}
                <span className="text-blue-400">Run it live.</span>
              </h3>
              <p className="mt-2 text-xs leading-relaxed font-medium text-zinc-400">
                Experiment instantly with HTML, CSS, JS, React and Next.js right
                inside your browser without configuration.
              </p>

              {/* Code Snippet Output Box */}
              <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 text-[10px] text-zinc-500 font-sans">
                  <span>playground.js</span>
                  <span className="text-emerald-400 font-bold">● Ready</span>
                </div>
                <pre className="text-blue-300">{`const app = "asif.to";
console.log(\`Mastering \${app}...\`);`}</pre>
                <div className="mt-2 pt-2 border-t border-zinc-800/60 text-emerald-400 text-[10px]">
                  &gt; Mastering asif.to...
                </div>
              </div>
            </div>

            <Link
              href="/run"
              className="mt-5 h-11 w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 text-xs font-black shadow-md transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Open Code Playground
            </Link>
          </div>

          {/* Ecosystem Tools Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(
              ({ title, description, href, icon: Icon, accent }) => (
                <Link
                  key={title}
                  href={title === "Course Exams" ? examHref : href}
                  className="group flex flex-col justify-between rounded-3xl border border-zinc-200/70 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  <div>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl ${accent}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <h4 className="mt-3 text-xs sm:text-sm font-black group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {title}
                    </h4>
                    <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {description}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400">
                    Explore{" "}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ),
            )}
          </div>
        </section>

        {/* 4. TOPIC DEEP DIVES & GUIDES */}
        {displayTopics.length > 0 && (
          <section id="topics" className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Layers3 className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                    Topic Deep Dives
                  </span>
                </div>
                <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
                  Featured Guides & Concepts
                </h2>
                <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Focused conceptual guides, architecture breakdowns, and
                  step-by-step topics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {displayTopics.map((topic) => {
                const topicUrl = getTopicHref(topic);
                return (
                  <Link
                    key={topic._id || topic.slug}
                    href={topicUrl}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md"
                  >
                    {/* Top Image Container with Dark Gradient & Overlay Title */}
                    <div className="relative w-full aspect-16/9.5 overflow-hidden bg-linear-to-br from-emerald-950 via-zinc-900 to-black">
                      {topic.image ? (
                        <Image
                          src={getImageUrl(topic.image)}
                          alt={topic.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-900/40 via-zinc-900 to-zinc-950" />
                      )}

                      {/* Dark Gradient Overlay for Maximum Text Readability */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

                      {/* Top Badges Floating Over Image */}
                      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
                        <span className="rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                          {topic.type === "interview"
                            ? "Interview Q&A"
                            : "Guide"}
                        </span>
                        {topic.course?.title && (
                          <span className="rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold text-white/90 border border-white/20 truncate max-w-42.5">
                            {topic.course.title}
                          </span>
                        )}
                        {topic.category?.name && (
                          <span className="rounded-full bg-black/50 backdrop-blur-md px-2 py-0.5 text-[9px] font-medium text-zinc-300 border border-white/10 hidden xs:inline-block">
                            {topic.category.name}
                          </span>
                        )}
                      </div>

                      {/* Title Overlay at Bottom of Image */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 z-10">
                        <h3 className="font-outfit text-sm sm:text-base font-black leading-snug text-white drop-shadow-md line-clamp-2 group-hover:text-emerald-300 transition-colors">
                          {topic.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content & Action Bar */}
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                      {topic.excerpt && (
                        <p className="line-clamp-2 text-[11px] leading-relaxed font-medium text-zinc-600 dark:text-zinc-400">
                          {topic.excerpt}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="inline-flex items-center gap-1">
                          <span>
                            {topic.type === "interview"
                              ? "Explore Q&A"
                              : "Read Guide"}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                        {topic.publishedAt && (
                          <span className="text-zinc-400 font-normal text-[10px]">
                            {format(
                              new Date(topic.publishedAt || topic.createdAt),
                              "MMM d, yyyy",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. INTERACTIVE BENTO SHOWCASE (PLAYGROUND + ENGINE) */}
        <section className="grid gap-4 md:grid-cols-[1.1fr_.9fr]">
          {/* Playground Bento Card */}
          <div className="flex flex-col justify-between overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-zinc-950 text-white p-5 sm:p-7 border border-zinc-800 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-400">
                <Code2 className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                  Browser Code Playground
                </span>
              </div>
              <h3 className="mt-2 text-xl sm:text-2xl font-black tracking-tight">
                Don't just read code.{" "}
                <span className="text-blue-400">Run it live.</span>
              </h3>
              <p className="mt-2 text-xs leading-relaxed font-medium text-zinc-400">
                Experiment instantly with HTML, CSS, JS, React and Next.js right
                inside your browser without configuration.
              </p>

              {/* Code Snippet Output Box */}
              <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 text-[10px] text-zinc-500 font-sans">
                  <span>playground.js</span>
                  <span className="text-emerald-400 font-bold">● Ready</span>
                </div>
                <pre className="text-blue-300">{`const app = "asif.to";
console.log(\`Mastering \${app}...\`);`}</pre>
                <div className="mt-2 pt-2 border-t border-zinc-800/60 text-emerald-400 text-[10px]">
                  &gt; Mastering asif.to...
                </div>
              </div>
            </div>

            <Link
              href="/run"
              className="mt-5 h-11 w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 text-xs font-black shadow-md transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Open Code Playground
            </Link>
          </div>

          {/* Ecosystem Tools Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(
              ({ title, description, href, icon: Icon, accent }) => (
                <Link
                  key={title}
                  href={title === "Course Exams" ? examHref : href}
                  className="group flex flex-col justify-between rounded-3xl border border-zinc-200/70 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  <div>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl ${accent}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <h4 className="mt-3 text-xs sm:text-sm font-black group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {title}
                    </h4>
                    <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {description}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400">
                    Explore{" "}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ),
            )}
          </div>
        </section>

        {/* 4. TOPIC DEEP DIVES & GUIDES */}
        {displayTopics.length > 0 && (
          <section id="topics" className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Layers3 className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                    Topic Deep Dives
                  </span>
                </div>
                <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
                  Featured Guides & Concepts
                </h2>
                <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Focused conceptual guides, architecture breakdowns, and
                  step-by-step topics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {displayTopics.map((topic) => {
                const topicUrl = getTopicHref(topic);
                return (
                  <Link
                    key={topic._id || topic.slug}
                    href={topicUrl}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 shadow-xs transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md"
                  >
                    {/* Top Image Container with Dark Gradient & Overlay Title */}
                    <div className="relative w-full aspect-16/9.5 overflow-hidden bg-linear-to-br from-emerald-950 via-zinc-900 to-black">
                      {topic.image ? (
                        <Image
                          src={getImageUrl(topic.image)}
                          alt={topic.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-900/40 via-zinc-900 to-zinc-950" />
                      )}

                      {/* Dark Gradient Overlay for Maximum Text Readability */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

                      {/* Top Badges Floating Over Image */}
                      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
                        <span className="rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                          {topic.type === "interview"
                            ? "Interview Q&A"
                            : "Guide"}
                        </span>
                        {topic.course?.title && (
                          <span className="rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-bold text-white/90 border border-white/20 truncate max-w-42.5">
                            {topic.course.title}
                          </span>
                        )}
                        {topic.category?.name && (
                          <span className="rounded-full bg-black/50 backdrop-blur-md px-2 py-0.5 text-[9px] font-medium text-zinc-300 border border-white/10 hidden xs:inline-block">
                            {topic.category.name}
                          </span>
                        )}
                      </div>

                      {/* Title Overlay at Bottom of Image */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 z-10">
                        <h3 className="font-outfit text-sm sm:text-base font-black leading-snug text-white drop-shadow-md line-clamp-2 group-hover:text-emerald-300 transition-colors">
                          {topic.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content & Action Bar */}
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                      {topic.excerpt && (
                        <p className="line-clamp-2 text-[11px] leading-relaxed font-medium text-zinc-600 dark:text-zinc-400">
                          {topic.excerpt}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="inline-flex items-center gap-1">
                          <span>
                            {topic.type === "interview"
                              ? "Explore Q&A"
                              : "Read Guide"}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                        {topic.publishedAt && (
                          <span className="text-zinc-400 font-normal text-[10px]">
                            {format(
                              new Date(topic.publishedAt || topic.createdAt),
                              "MMM d, yyyy",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. INTERVIEW PREP & REVISION STICKINESS */}
        <section id="interview-prep" className="scroll-mt-24 space-y-6">
          {/* Interview Questions Showcase */}
          <div className="rounded-3xl sm:rounded-[2.5rem] bg-linear-to-br from-orange-500/10 via-rose-500/10 to-amber-500/10 p-5 sm:p-7 border border-orange-500/15 shadow-xs">
            <div className="mb-4">
              <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <MessageSquareText className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]">
                  Interview Preparation
                </span>
              </div>
              <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
                Turn course knowledge into interview answers
              </h2>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Practice categorized questions, detailed answers, coding
                problems and real-world scenarios.
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {courses.slice(0, 4).map((course) => (
                <Link
                  key={course._id || course.id}
                  href={`/${course.slug}/interview-questions`}
                  className="group flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/90 dark:bg-zinc-900/90 p-3 sm:p-4 shadow-xs transition-all hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs sm:text-sm font-black group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {course.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-zinc-500">
                      Practice interview questions &rarr;
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
              <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
                Revision Flashcards, Quizzes & Course Exams
              </h2>
            </div>

            <RevisionFlashcards selectedTech={selectedTech} />

            <div className="grid gap-3 sm:grid-cols-2">
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
                <h3 className="mt-4 text-base font-black">Practice Quizzes</h3>
                <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                  Quickly check concepts, find weak areas and revise before
                  moving ahead.
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
                <h3 className="mt-4 text-base font-black">Course Exams</h3>
                <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                  Finish a course, take its exam and demonstrate complete-course
                  expertise.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. TECHNICAL ARTICLES & DISPATCHES */}
        {displayArticles.length > 0 && (
          <section id="articles" className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                    Technical Dispatches
                  </span>
                </div>
                <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
                  Latest Articles & System Design
                </h2>
                <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Technical analyses, architecture explorations, and system
                  design writeups.
                </p>
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline shrink-0"
              >
                View all articles <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayArticles.map((article) => {
                const articleUrl = getArticleHref(article);
                const categoryName =
                  article.topic?.[0]?.name || article.category || "Article";
                const authorName = article.author?.fullName || "Asif";
                const authorInitial = authorName.charAt(0).toUpperCase();

                return (
                  <Link
                    key={article._id || article.id}
                    href={articleUrl}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 shadow-xs transition-all hover:-translate-y-0.5 hover:border-purple-500/40 hover:shadow-md"
                  >
                    {/* Top Cover Image Box with Dark Gradient Overlay & Title */}
                    <div className="relative w-full aspect-16/9.5 overflow-hidden bg-linear-to-br from-purple-950 via-zinc-900 to-black">
                      {article.image ? (
                        <Image
                          src={getImageUrl(article.image)}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-purple-900/40 via-zinc-900 to-zinc-950" />
                      )}

                      {/* Dark Gradient Overlay for Maximum Text Contrast */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

                      {/* Top Floating Badge */}
                      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                        <span className="rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-300 border border-purple-500/30">
                          {categoryName}
                        </span>
                      </div>

                      {/* Title Overlay at Bottom of Image */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 z-10">
                        <h3 className="font-outfit text-sm sm:text-base font-black leading-snug text-white drop-shadow-md line-clamp-2 group-hover:text-purple-300 transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content & Author Action Bar */}
                    <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
                      <p className="line-clamp-2 text-[11px] leading-relaxed font-medium text-zinc-600 dark:text-zinc-400">
                        {article.subtitle ||
                          article.description ||
                          (article.content
                            ? article.content
                                .replace(/<[^>]*>?/gm, "")
                                .slice(0, 110)
                            : `Deep dive technical analysis into ${article.title} on asif.to.`)}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0 max-w-[65%]">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[9px] font-black text-purple-400 border border-purple-500/30">
                            {authorInitial}
                          </span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 truncate text-[11px]">
                            {authorName}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 shrink-0">
                          <span>Read</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. ONE LEARNING LOOP STEPPER */}
        <section className="rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 p-5 sm:p-7 shadow-xs">
          <div className="mx-auto max-w-xl text-center">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
              Complete Learning Loop
            </span>
            <h2 className="mt-1 text-lg sm:text-2xl font-black tracking-tight">
              Learn &rarr; Practice &rarr; Master
            </h2>
            <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              From initial conceptual explanation to instant code execution,
              active flashcard revision, and interview readiness.
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

        {/* 8. FINAL HIGH IMPACT CTA */}
        <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-blue-600 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
                Choose one technology. Start today.
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight">
                Build real software engineering skills.
              </h2>
              <p className="mt-1 max-w-xl text-xs font-medium text-blue-100 leading-relaxed">
                Learn the concept, run live code in the playground, test your
                recall with flashcards, and prepare for technical interviews.
              </p>
            </div>
            <a
              href="#courses"
              className="h-11 shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 text-xs font-black text-blue-600 hover:bg-blue-50 shadow-md active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Get Started Now
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
