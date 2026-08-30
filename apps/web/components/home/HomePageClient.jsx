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

function SafeCourseCover({ thumbnail, title, techName, slug }) {
  const [hasError, setHasError] = useState(false);

  if (thumbnail && !hasError) {
    return (
      <Link
        href={`/courses/${slug}`}
        className="relative mb-3 block w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 aspect-[2.1/1] border border-zinc-200/60 dark:border-zinc-800"
      >
        <Image
          src={getImageUrl(thumbnail)}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-103"
          onError={() => setHasError(true)}
          unoptimized
        />
      </Link>
    );
  }

  return (
    <Link
      href={`/courses/${slug}`}
      className="relative mb-3 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-violet-500/15 dark:from-blue-900/30 dark:via-zinc-850 dark:to-indigo-950/40 aspect-[2.1/1] border border-zinc-200/70 dark:border-zinc-800 transition-all group-hover:border-blue-500/40 p-3"
    >
      <div className="relative z-10 flex items-center gap-2.5 w-full">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80 group-hover:scale-105 group-hover:border-blue-500 transition-all">
          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-outfit text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100 block truncate">
            {title}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block truncate">
            {techName || "Track"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SafeTopicCover({ image, title, topicType, courseTitle }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full aspect-[2.2/1] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-zinc-900 dark:from-emerald-950 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between p-3.5">
      {image && !hasError ? (
        <>
          <Image
            src={getImageUrl(image)}
            alt={title || "Guide"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        </>
      ) : (
        <Layers3 className="w-20 h-20 text-emerald-500/15 absolute -right-2 -bottom-2 pointer-events-none" />
      )}

      {/* Top Badges Row */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 w-full">
        <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
          {topicType === "interview" ? "Interview Q&A" : "Guide"}
        </span>
        {courseTitle && (
          <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold text-white/90 border border-white/20 truncate max-w-[140px] xs:max-w-[180px]">
            {courseTitle}
          </span>
        )}
      </div>
    </div>
  );
}

function SafeArticleCover({ image, title, categoryName }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full aspect-[2.2/1] overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 via-purple-900/15 to-zinc-950 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between p-3.5">
      {image && !hasError ? (
        <>
          <Image
            src={getImageUrl(image)}
            alt={title || "Article"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        </>
      ) : (
        <FileText className="w-20 h-20 text-purple-500/15 absolute -right-2 -bottom-2 pointer-events-none" />
      )}

      {/* Floating Category Badge */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-purple-300 border border-purple-500/30">
          {categoryName}
        </span>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "Multi-language Playground",
    description:
      "Write, edit and run HTML, CSS, JavaScript, React and Next.js code instantly.",
    href: "/run",
    icon: Code2,
    accent: "text-blue-600 bg-blue-500/10 dark:text-blue-400 border-blue-500/20",
  },
  {
    title: "Revision Flashcards",
    description:
      "Review important concepts quickly with focused, swipeable revision cards.",
    href: "/revision",
    icon: Layers,
    accent: "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    title: "Practice Quizzes",
    description:
      "Check your understanding and find concepts that need another revision.",
    href: "/quiz",
    icon: HelpCircle,
    accent: "text-purple-600 bg-purple-500/10 dark:text-purple-400 border-purple-500/20",
  },
  {
    title: "Course Exams",
    description:
      "Test complete-course knowledge and use your result to showcase expertise.",
    href: "#course-exams",
    icon: Trophy,
    accent: "text-amber-600 bg-amber-500/10 dark:text-amber-400 border-amber-500/20",
  },
  {
    title: "Interview Preparation",
    description:
      "Practice categorized questions with detailed, interview-ready answers.",
    href: "#interview-prep",
    icon: MessageSquareText,
    accent: "text-orange-600 bg-orange-500/10 dark:text-orange-400 border-orange-500/20",
  },
  {
    title: "Developer Cheatsheets",
    description:
      "Keep syntax, commands and commonly used patterns within quick reach.",
    href: "/cheatsheets",
    icon: FileCode,
    accent: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20",
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
      card: "border-blue-200/80 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-blue-500/10",
      btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    nextjs: {
      card: "border-amber-200/80 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-amber-500/10",
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    javascript: {
      card: "border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-emerald-500/10",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    css: {
      card: "border-purple-200/80 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-purple-500/10",
      btn: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25",
      badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    typescript: {
      card: "border-teal-200/80 dark:border-teal-900/60 hover:border-teal-400 dark:hover:border-teal-700 hover:shadow-teal-500/10",
      btn: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/25",
      badge: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    },
    nodejs: {
      card: "border-green-200/80 dark:border-green-900/60 hover:border-green-400 dark:hover:border-green-700 hover:shadow-green-500/10",
      btn: "bg-green-600 hover:bg-green-700 text-white shadow-green-500/25",
      badge: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    },
    mongodb: {
      card: "border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-emerald-500/10",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    expressjs: {
      card: "border-zinc-300/80 dark:border-zinc-700/60 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-zinc-500/10",
      btn: "bg-zinc-800 hover:bg-zinc-900 text-white shadow-zinc-500/25",
      badge: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
    },
    tailwindcss: {
      card: "border-sky-200/80 dark:border-sky-900/60 hover:border-sky-400 dark:hover:border-sky-700 hover:shadow-sky-500/10",
      btn: "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/25",
      badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    },
  };

  return (
    colors[techId] || {
      card: "border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md",
      btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
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
    const scrollAmount = Math.max(260, clientWidth * 0.75);
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

  const quickHubItems = [
    [BookOpen, "Courses", "#courses"],
    [Layers3, "Topics", "#topics"],
    [Code2, "Playground", "/run"],
    [FileText, "Articles", "#articles"],
    [Layers, "Flashcards", "#revision"],
    [HelpCircle, "Quizzes", "/quiz"],
    [MessageSquareText, "Interviews", "#interview-prep"],
    [Trophy, "Exams", "#course-exams"],
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-28 sm:pb-16 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3.5 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-8 sm:gap-14 min-w-0">
        {/* 1. HERO BANNER - DRIBBBLE BENTO CARD DESIGN */}
        <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-950 text-white p-5 xs:p-6 sm:p-9 shadow-xl border border-zinc-800 min-w-0">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] sm:text-[11px] font-black tracking-wider uppercase mb-3.5 text-zinc-300 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Developer Learning Platform
              </div>

              <h1 className="font-outfit text-2xl xs:text-3xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight leading-[1.1] text-balance">
                Learn. Practice. Revise.{" "}
                <span className="text-blue-400 drop-shadow-sm">
                  Prove Your Skills.
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed font-medium text-zinc-400">
                Structured courses, a multi-language playground, flashcards,
                quizzes, interview preparation, cheatsheets and course exams —
                all in one focused developer platform.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <a
                  href="#courses"
                  className="h-11 inline-flex items-center justify-center gap-2 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md active:scale-95 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  Start Learning
                </a>
                <Link
                  href="/run"
                  className="h-11 inline-flex items-center justify-center gap-2 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-black active:scale-95 transition-all"
                >
                  <Code2 className="w-4 h-4 text-blue-400" />
                  Open Playground
                </Link>
              </div>
            </div>

            {/* Quick Hub - Dark Glass Pills Grid */}
            <div className="w-full min-w-0">
              {/* Mobile (< sm): Touch Chip Row */}
              <div className="flex sm:hidden overflow-x-auto scrollbar-none gap-2 py-1 -mx-1 px-1">
                {quickHubItems.map(([Icon, label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 px-3.5 py-2.5 text-[11px] font-bold text-zinc-200 shrink-0 hover:bg-zinc-800 hover:border-blue-500/40 active:scale-95 transition-all shadow-xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Tablet/Desktop (>= sm): 4-Column Dark Glass Grid */}
              <div className="hidden sm:grid grid-cols-4 lg:grid-cols-2 gap-2 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-3 backdrop-blur-md">
                {quickHubItems.map(([Icon, label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800/80 px-3 py-2 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/90 hover:border-blue-500/40 active:scale-95 transition-all truncate"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Global Search Input */}
          <div className="relative z-10 mt-5 sm:mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              readOnly
              aria-label="Open global search"
              placeholder="Search courses, concepts, interview questions, cheatsheets..."
              onFocus={openSearch}
              onClick={openSearch}
              className="w-full h-12 pl-11 pr-14 rounded-full bg-zinc-900/90 text-white placeholder:text-zinc-500 text-xs sm:text-sm border border-zinc-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 font-semibold cursor-pointer"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400 border border-zinc-700">
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
              <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
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

          {/* Tech Stack Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSelectTech(null)}
              className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-black transition-all cursor-pointer ${
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
                onClick={() => handleSelectTech(tech.id)}
                className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-black transition-all cursor-pointer ${
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
                  className={`group flex w-[270px] xs:w-[300px] sm:w-[330px] md:w-[350px] shrink-0 snap-start flex-col justify-between rounded-[2rem] sm:rounded-[2.5rem] border bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${techColors.card}`}
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
            <article className="group relative flex w-[270px] xs:w-[300px] sm:w-[330px] md:w-[350px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-blue-500/25 dark:border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-violet-600/10 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-500/50 transition-all duration-300">
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

        {/* 3. INTERACTIVE BENTO SHOWCASE (DRIBBBLE 3-COLUMN BENTO GRID) */}
        <section className="scroll-mt-24 space-y-4">
          <div className="mb-2">
            <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                Interactive Learning Hub
              </span>
            </div>
            <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
              Everything You Need to Master Coding
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 min-w-0">
            {/* Top Row: Playground Hero Bento Card (Spans 2 columns on desktop) */}
            <div className="sm:col-span-2 lg:col-span-2 flex flex-col justify-between overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-950 text-white p-5 sm:p-6 border border-zinc-800 shadow-xl min-w-0">
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-blue-400">
                    <Code2 className="w-4 h-4" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
                      Browser Code Playground
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live IDE Sandbox
                  </span>
                </div>

                <h3 className="font-outfit mt-2 text-xl sm:text-2xl font-black tracking-tight">
                  Don't just read code.{" "}
                  <span className="text-blue-400">Run it live.</span>
                </h3>
                <p className="mt-1 text-xs leading-relaxed font-medium text-zinc-400">
                  Experiment instantly with HTML, CSS, JS, React and Next.js right
                  inside your browser with zero configuration.
                </p>

                {/* Code Editor Preview Window */}
                <div className="mt-3.5 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 font-mono text-[11px] shadow-inner">
                  <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-3 py-2 text-[10px] text-zinc-400 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="ml-2 font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md text-[9.5px]">App.jsx</span>
                    </div>
                    <span className="text-blue-400 text-[10px] font-bold">React 18</span>
                  </div>

                  <div className="p-3 text-zinc-300 space-y-1 text-[10.5px] leading-relaxed">
                    <div><span className="text-purple-400 font-bold">import</span> <span className="text-blue-300">React</span>, {"{"} <span className="text-amber-300">useState</span> {"}"} <span className="text-purple-400 font-bold">from</span> <span className="text-emerald-300">'react'</span>;</div>
                    <div><span className="text-purple-400 font-bold">export default function</span> <span className="text-amber-300">Counter</span>() {"{"}</div>
                    <div className="pl-3"><span className="text-purple-400 font-bold">const</span> [<span className="text-blue-300">count</span>, <span className="text-blue-300">setCount</span>] = <span className="text-amber-300">useState</span>(<span className="text-orange-300">0</span>);</div>
                    <div className="pl-3"><span className="text-purple-400 font-bold">return</span> (</div>
                    <div className="pl-6 text-zinc-400">&lt;<span className="text-blue-400">button</span> <span className="text-teal-300">onClick</span>={"{"}() =&gt; <span className="text-blue-300">setCount</span>(c =&gt; c + 1){"}"}&gt;</div>
                    <div className="pl-9 text-emerald-300">Clicked {"{"}count{"}"} times ✨</div>
                    <div className="pl-6 text-zinc-400">&lt;/<span className="text-blue-400">button</span>&gt;</div>
                    <div className="pl-3">);</div>
                    <div>{"}"}</div>
                  </div>

                  <div className="border-t border-zinc-800/80 bg-zinc-950/80 px-3 py-1.5 flex items-center justify-between text-[10px] font-sans text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      &gt; Console: Rendered in 12ms (0 errors)
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[9.5px] font-bold text-blue-300">⚡ Instant React & JS</span>
                  <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[9.5px] font-bold text-purple-300">🔥 Zero Setup</span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9.5px] font-bold text-emerald-300">🚀 Multi-language</span>
                </div>
              </div>

              <Link
                href="/run"
                className="mt-4 h-10 sm:h-11 w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 text-xs font-black shadow-md transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Open Code Playground
              </Link>
            </div>

            {/* Feature 1: Revision Flashcards */}
            <Link
              href="/revision"
              className="group flex flex-col justify-between rounded-[2rem] sm:rounded-[2.5rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-500/40 transition-all min-w-0"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Layers className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-outfit mt-4 text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Revision Flashcards
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                  Review important concepts quickly with focused, swipeable revision decks.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-indigo-500/15 flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400">
                <span>Swipeable Decks</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Feature 2: Interview Preparation */}
            <Link
              href="#interview-prep"
              className="group flex flex-col justify-between rounded-[2rem] sm:rounded-[2.5rem] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-orange-500/40 transition-all min-w-0"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 group-hover:scale-105 transition-transform">
                  <MessageSquareText className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-outfit mt-4 text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Interview Preparation
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                  Practice categorized questions with detailed, interview-ready answers.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-orange-500/15 flex items-center justify-between text-xs font-black text-orange-600 dark:text-orange-400">
                <span>Q&A Answer Keys</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Feature 3: Practice Quizzes */}
            <Link
              href="/quiz"
              className="group flex flex-col justify-between rounded-[2rem] sm:rounded-[2.5rem] border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all min-w-0"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                  <HelpCircle className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-outfit mt-4 text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Practice Quizzes
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                  Check your understanding and find concepts that need another revision.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-purple-500/15 flex items-center justify-between text-xs font-black text-purple-600 dark:text-purple-400">
                <span>Test Recall</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Feature 4: Developer Cheatsheets */}
            <Link
              href="/cheatsheets"
              className="group flex flex-col justify-between rounded-[2rem] sm:rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all min-w-0"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <FileCode className="h-5.5 w-5.5" />
                </div>
                <h3 className="font-outfit mt-4 text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Developer Cheatsheets
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                  Keep syntax, commands and commonly used patterns within quick reach.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-emerald-500/15 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
                <span>Quick Syntax</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* 4. TOPIC DEEP DIVES & GUIDES (DRIBBBLE UI CARDS - NO OVERFLOW OR PITCH BLACK BOXES) */}
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
                <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
                  Featured Guides & Concepts
                </h2>
                <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Focused conceptual guides, architecture breakdowns, and
                  step-by-step topics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2 min-w-0">
              {displayTopics.map((topic) => {
                const topicUrl = getTopicHref(topic);
                return (
                  <Link
                    key={topic._id || topic.slug}
                    href={topicUrl}
                    className="group flex flex-col justify-between rounded-[2rem] sm:rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all min-w-0 overflow-hidden"
                  >
                    <div>
                      {/* Top Row: Icon Glow Badge + Category/Course Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                          <Layers3 className="h-5.5 w-5.5" />
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5 min-w-0">
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            {topic.type === "interview"
                              ? "Interview Q&A"
                              : "Guide"}
                          </span>
                          {topic.course?.title && (
                            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 px-2.5 py-0.5 text-[9.5px] font-bold text-zinc-600 dark:text-zinc-300 truncate max-w-[130px] xs:max-w-[170px]">
                              {topic.course.title}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-outfit text-base sm:text-lg font-black leading-snug text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mt-4">
                        {topic.title}
                      </h3>

                      {topic.excerpt && (
                        <p className="line-clamp-2 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
                          {topic.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Bottom Divider Row */}
                    <div className="mt-5 pt-3 border-t border-emerald-500/15 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
                      <span className="inline-flex items-center gap-1">
                        <span>
                          {topic.type === "interview"
                            ? "Explore Q&A"
                            : "Read Guide"}
                        </span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      {topic.publishedAt && (
                        <span className="text-zinc-400 font-medium text-[10px]">
                          {format(
                            new Date(topic.publishedAt || topic.createdAt),
                            "MMM d, yyyy",
                          )}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. INTERVIEW PREP & REVISION STICKINESS (DRIBBBLE APP CARDS) */}
        <section id="interview-prep" className="scroll-mt-24 space-y-6 min-w-0">
          {/* Interview Questions Showcase */}
          <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-orange-500/10 via-rose-500/10 to-amber-500/10 p-3.5 xs:p-5 sm:p-7 border border-orange-500/15 shadow-sm min-w-0 overflow-hidden">
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
                Practice categorized questions, detailed answers, coding
                problems and real-world scenarios.
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
                className="group rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-5 transition-all hover:shadow-md"
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
                  Quickly check concepts, find weak areas and revise before
                  moving ahead.
                </p>
              </Link>

              <Link
                href={examHref}
                className="group rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 transition-all hover:shadow-md"
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
                <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
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
                    className="group flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-purple-500/40 hover:shadow-md"
                  >
                    <div>
                      <SafeArticleCover
                        image={article.image}
                        title={article.title}
                        categoryName={categoryName}
                      />

                      {/* Article Title */}
                      <h3 className="font-outfit text-sm sm:text-base font-black leading-snug text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 mt-3">
                        {article.title}
                      </h3>

                      <p className="line-clamp-2 text-[11px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
                        {article.subtitle ||
                          article.description ||
                          (article.content
                            ? article.content
                                .replace(/<[^>]*>?/gm, "")
                                .slice(0, 110)
                            : `Deep dive technical analysis into ${article.title} on asif.to.`)}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
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
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. ONE LEARNING LOOP STEPPER */}
        <section className="rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-5 sm:p-7 shadow-xs">
          <div className="mx-auto max-w-xl text-center">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
              Complete Learning Loop
            </span>
            <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
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
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-outfit mt-2 block text-xs font-black text-zinc-900 dark:text-white">
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
        <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-100">
                Choose one technology. Start today.
              </span>
              <h2 className="font-outfit mt-1 text-xl sm:text-2xl font-black tracking-tight">
                Build real software engineering skills.
              </h2>
              <p className="mt-1 max-w-xl text-xs font-medium text-blue-100/90 leading-relaxed">
                Learn the concept, run live code in the playground, test your
                recall with flashcards, and prepare for technical interviews.
              </p>
            </div>
            <a
              href="#courses"
              className="h-11 shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 text-xs font-black text-blue-700 hover:bg-blue-50 shadow-md active:scale-95 transition-all"
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
