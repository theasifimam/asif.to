"use client";

import {
  TrendingUp,
  Users,
  FileText,
  Clock,
  BookOpen,
  GraduationCap,
  BarChart3,
  ChevronRight,
  BrainCircuit,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGetDashboardStatsQuery } from "@/redux/services/dashboardApi";

const ICON_MAP = {
  Users,
  Clock,
  TrendingUp,
  FileText,
  BookOpen,
  GraduationCap,
};

export default function DashboardPage() {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetDashboardStatsQuery();
  const dashboardData = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
          Loading Course Analytics...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-zinc-900 dark:text-white">
          Connection Issue
        </h3>
        <p className="text-xs text-zinc-500 font-semibold">
          Unable to fetch course analytics. Please retry.
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-full px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const activeGrowth = dashboardData?.growthAnalytics?.allTime || {
    reads: "0",
    growth: "+0%",
    label: "Course Readership",
    subtext: "No data",
    chartData: [],
  };
  const chartItems = (
    Array.isArray(activeGrowth.chartData) ? activeGrowth.chartData : []
  ).map((item) => ({
    ...item,
    value: Math.max(0, Number(item?.value) || 0),
  }));
  const chartMax = Math.max(0, ...chartItems.map((item) => item.value));

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto text-zinc-800 dark:text-zinc-300 font-sans">
      {/* High-Impact Hero Banner - Course First */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-8 sm:p-10 shadow-xl shadow-blue-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-2 right-12 w-28 h-28 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold tracking-wider uppercase mb-3 text-white">
            <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Course Platform Control Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight font-outfit">
            Course Learning & Engagements
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed font-medium">
            Monitor real-time course readership growth across days, months, and
            years. Manage chapters, student completion rates, and curriculum
            analytics.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3 w-full md:w-auto">
          <Link
            href="/courses"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-blue-600 font-extrabold text-xs uppercase tracking-wider hover:bg-blue-50 transition-all shadow-md active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Courses</span>
          </Link>
          <Link
            href="/quiz"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur-md text-white font-extrabold text-xs uppercase tracking-wider hover:bg-white/25 transition-all active:scale-95"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Quiz Builder</span>
          </Link>
        </div>
      </section>

      {/* Course Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(dashboardData?.stats || []).map((stat, i) => {
          const StatIcon = ICON_MAP[stat.icon] || BookOpen;
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={stat.label}
            >
              <div className="p-6 rounded-4xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <StatIcon className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[11px] font-extrabold tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="text-3xl font-black font-outfit text-zinc-900 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium mt-1">
                    {stat.description}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Real all-time readership by course */}
      <section className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Readership Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black font-outfit text-zinc-900 dark:text-white tracking-tight">
                Course Readership
              </h2>
              <span className="group/tooltip relative inline-flex" tabIndex={0}>
                <Info className="h-4 w-4 text-zinc-400" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-6 z-30 hidden w-64 -translate-x-1/2 rounded-xl bg-zinc-950 p-3 text-[11px] font-medium normal-case leading-relaxed text-white shadow-xl group-hover/tooltip:block group-focus/tooltip:block"
                >
                  The bars compare real all-time chapter visits between courses.
                  This is not a date trend because historical chapter-view dates
                  were not recorded.
                </span>
              </span>
            </div>
          </div>
          <span className="rounded-full bg-blue-500/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            All-time captured data
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Metrics */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
              {activeGrowth.label}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black font-outfit text-zinc-900 dark:text-white tracking-tight">
                {activeGrowth.reads}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {activeGrowth.subtext}
            </p>

            <p className="mt-3 border-t border-zinc-100 pt-4 text-[11px] leading-relaxed text-zinc-400 dark:border-zinc-800">
              A read is recorded whenever a public chapter page increments its
              view counter. Repeat visits are included.
            </p>
          </div>

          {/* Right Visual Bar Chart Visualization */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-950/60 p-5 sm:p-6 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-1">
              <span>Reads by course</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10">
                Actual view counters
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 sm:gap-5 pt-3">
              {chartItems.length > 0 ? (
                chartItems.map((item) => {
                  const heightPercent =
                    chartMax > 0
                      ? Math.max(12, Math.round((item.value / chartMax) * 100))
                      : 12;
                  return (
                    <div
                      key={item.id || item.label}
                      className="group/bar relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                      tabIndex={0}
                    >
                      {/* Bar area without full-height background track */}
                      <div className="w-full flex-1 flex items-end justify-center">
                        {/* Thick Plain Primary Color Rounded Pill Bar */}
                        <div
                          aria-label={`${item.label}: ${item.value.toLocaleString()} reads`}
                          className="w-full max-w-[36px] sm:max-w-[52px] rounded-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 transition-all duration-500 ease-out shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-500/30 active:scale-[0.98] cursor-pointer min-h-[22px]"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <span className="max-w-full truncate text-[10px] sm:text-[11px] font-extrabold text-zinc-400 transition-colors group-hover/bar:text-blue-600 dark:group-hover/bar:text-blue-400 text-center">
                        {item.shortLabel || item.label}
                      </span>

                      {/* Modern Tooltip */}
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-11 left-1/2 z-30 hidden w-max max-w-56 -translate-x-1/2 rounded-2xl bg-zinc-950/95 backdrop-blur-md px-3.5 py-2.5 text-center text-[11px] font-semibold text-white shadow-2xl border border-zinc-800 group-hover/bar:block group-focus/bar:block"
                      >
                        <strong className="block text-xs font-black text-blue-400 mb-0.5">
                          {item.label}
                        </strong>
                        <span className="text-zinc-300 font-bold">
                          {item.value.toLocaleString()}
                        </span>{" "}
                        all-time chapter reads
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                  No readership data available
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Grid: Top Courses & Technology Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Performing Courses */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-black font-outfit tracking-tight text-zinc-900 dark:text-white">
                Top Performing Courses
              </h2>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All Courses</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {(dashboardData?.topCourses || []).map((course, i) => (
              <div
                key={course.id}
                className="p-4 sm:p-6 rounded-3xl sm:rounded-4xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-blue-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs group min-w-0"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    0{i + 1}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {course.techId}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          course.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black font-outfit text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 sm:line-clamp-2 mt-0.5">
                      {course.subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs font-bold text-zinc-400 mt-2">
                      <span>{course.chapterCount} Chapters</span>
                      <span>&bull;</span>
                      <span>
                        {course.publicationRate || "0%"} Chapters Published
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm sm:text-lg font-black font-outfit text-zinc-900 dark:text-white">
                    {course.formattedReads} reads
                  </span>
                  <Link
                    href={`/courses/${course.id}`}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500/10 hover:bg-blue-600 text-blue-600 hover:text-white dark:text-blue-400 dark:hover:text-white text-xs font-extrabold transition-all"
                  >
                    Manage Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack & Platform Ecosystem */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Tech Distribution */}
          <div className="p-6 sm:p-7 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                Curriculum Focus
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-outfit text-zinc-900 dark:text-white">
                  Technology Distribution
                </h3>
                <span
                  className="group/tooltip relative inline-flex"
                  tabIndex={0}
                >
                  <Info className="h-4 w-4 text-zinc-400" />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute right-0 top-6 z-30 hidden w-64 rounded-xl bg-zinc-950 p-3 text-[11px] font-medium leading-relaxed text-white shadow-xl group-hover/tooltip:block group-focus/tooltip:block"
                  >
                    Each bar is the technology’s share of all published course
                    chapters. For example, 25% means one quarter of the
                    published curriculum belongs to that technology.
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {(dashboardData?.techDistribution || []).map((item) => {
                const percentage = Math.min(
                  100,
                  Math.max(0, Number(item.percentage) || 0),
                );

                return (
                  <div
                    key={item.techId}
                    className="group/progress relative flex flex-col gap-1.5"
                    tabIndex={0}
                  >
                    <div className="flex justify-between gap-3 text-xs font-bold">
                      <span className="text-zinc-700 dark:text-zinc-200">
                        {item.label}
                      </span>
                      <span className="text-zinc-900 dark:text-white font-extrabold text-right">
                        {item.chapters} Chapters ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full min-w-1 rounded-full transition-[width] duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color || "#2563eb",
                        }}
                      />
                    </div>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full right-0 z-30 mb-2 hidden w-60 rounded-xl bg-zinc-950 px-3 py-2 text-[11px] font-medium leading-relaxed text-white shadow-xl group-hover/progress:block group-focus/progress:block"
                    >
                      {item.label} has {item.chapters} published{" "}
                      {item.chapters === 1 ? "chapter" : "chapters"},
                      representing {percentage}% of{" "}
                      {dashboardData?.counts?.publishedChapters || 0} published
                      chapters.
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Platform Ecosystem Secondary Counts */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col p-2 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase">
                  Quizzes
                </span>
                <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white">
                  {dashboardData?.counts?.quizzes || 0}
                </span>
              </div>
              <div className="flex flex-col p-2 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase">
                  Flashcards
                </span>
                <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white">
                  {dashboardData?.counts?.flashcards || 0}
                </span>
              </div>
              <div className="flex flex-col p-2 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase">
                  Cheatsheets
                </span>
                <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white">
                  {dashboardData?.counts?.cheatsheets || 0}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
