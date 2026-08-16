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
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";

const ICON_MAP = {
  Users,
  Clock,
  TrendingUp,
  FileText,
  BookOpen,
  GraduationCap,
};

const STAT_THEMES = {
  // Course Reads / Engagement -> Light Sky Blue / Deep Navy Tint
  BookOpen: {
    bg: "bg-sky-50/75 dark:bg-[#0c1524]",
    border: "border-sky-200/70 dark:border-sky-900/40",
    borderHover: "hover:border-sky-300 dark:hover:border-sky-600/60",
    glow: "from-sky-400/20 via-sky-400/5 to-transparent",
    iconContainer:
      "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30",
    trendBadge:
      "bg-sky-100/90 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200 border border-sky-200/80 dark:border-sky-500/30",
  },
  // Active Courses / Curriculum -> Light Mint Emerald / Deep Forest Tint
  GraduationCap: {
    bg: "bg-emerald-50/75 dark:bg-[#0a1a14]",
    border: "border-emerald-200/70 dark:border-emerald-900/40",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-600/60",
    glow: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    iconContainer:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30",
    trendBadge:
      "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-500/30",
  },
  // Avg Completion Rate / Performance -> Light Warm Amber / Deep Amber Tint
  TrendingUp: {
    bg: "bg-amber-50/75 dark:bg-[#1a1308]",
    border: "border-amber-200/70 dark:border-amber-900/40",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-600/60",
    glow: "from-amber-400/20 via-amber-400/5 to-transparent",
    iconContainer:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30",
    trendBadge:
      "bg-amber-100/90 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 border border-amber-200/80 dark:border-amber-500/30",
  },
  // Enrolled Learners / Community -> Light Soft Purple / Deep Violet Tint
  Users: {
    bg: "bg-purple-50/75 dark:bg-[#140d22]",
    border: "border-purple-200/70 dark:border-purple-900/40",
    borderHover: "hover:border-purple-300 dark:hover:border-purple-600/60",
    glow: "from-purple-400/20 via-purple-400/5 to-transparent",
    iconContainer:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30",
    trendBadge:
      "bg-purple-100/90 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200 border border-purple-200/80 dark:border-purple-500/30",
  },
};

const DEFAULT_STAT_THEME = {
  bg: "bg-sky-50/75 dark:bg-[#0c1524]",
  border: "border-sky-200/70 dark:border-sky-900/40",
  borderHover: "hover:border-sky-300 dark:hover:border-sky-600/60",
  glow: "from-sky-400/20 via-sky-400/5 to-transparent",
  iconContainer:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30",
  trendBadge:
    "bg-sky-100/90 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200 border border-sky-200/80 dark:border-sky-500/30",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    data: response,
    isLoading,
    isError,
    error,
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
    const errorMessage =
      error?.data?.message ||
      error?.error ||
      (error?.status === 401
        ? "Your session has expired. Please sign in again."
        : error?.status === 403
          ? "Access restricted. You need admin, editor, or author permissions."
          : "Unable to connect to the backend server. Please verify the API is running and retry.");

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-zinc-900 dark:text-white">
          Connection Issue
        </h3>
        <p className="text-xs text-zinc-500 font-semibold max-w-md">
          {errorMessage}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-full px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xs shadow-blue-500/20 cursor-pointer"
          >
            Retry Connection
          </button>
          {error?.status === 401 && (
            <Link
              href="/login"
              className="rounded-full px-6 py-2.5 bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-700 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
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
  const visibleStats = (dashboardData?.stats || []).filter(
    (stat) => stat.icon !== "Users" || hasPermission(user, "users.view"),
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:gap-8 p-4 font-sans text-zinc-800 dark:text-zinc-300 sm:p-6 md:p-8 lg:p-10">
      {/* High-Impact Hero Banner - Rich Modern Gradient Canvas */}
      <section className="relative flex flex-col items-start justify-between gap-6 overflow-hidden p-6 sm:p-8 md:flex-row md:items-center rounded-[28px] sm:rounded-[36px] border border-zinc-200/90 bg-linear-to-br from-white via-blue-50/30 to-indigo-50/40 shadow-xl shadow-blue-500/3 dark:border-white/8 dark:bg-linear-to-br dark:from-[#111319] dark:via-[#131622] dark:to-[#0f1118] dark:shadow-2xl dark:shadow-black/60">
        {/* Subtle dot matrix texture overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[16px_16px] opacity-70" />

        {/* Ambient Top-Right & Bottom-Left Lighting Meshes */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-linear-to-br from-blue-500/15 via-indigo-500/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-linear-to-tr from-sky-500/10 to-transparent blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 shadow-xs backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Platform Overview</span>
          </div>
          <h1 className="font-outfit text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.035em] text-zinc-950 dark:text-white">
            Course Learning & Engagements
          </h1>
          <p className="mt-2 max-w-xl text-xs sm:text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
            Monitor real-time course readership growth across days, months, and
            years. Manage chapters, student completion rates, and curriculum
            analytics.
          </p>
        </div>

        <div className="relative z-10 flex w-full flex-wrap items-center gap-2.5 md:w-auto">
          <Link
            href="/courses"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-[.985] md:flex-initial cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Courses</span>
          </Link>
          <Link
            href="/quiz"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-zinc-200/80 bg-white/90 px-5 py-3 text-xs font-bold text-zinc-700 shadow-xs backdrop-blur-md transition-all duration-200 hover:bg-zinc-50 hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[.985] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/9 dark:hover:border-white/20 md:flex-initial cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Quiz Builder</span>
          </Link>
        </div>
      </section>

      {/* Bento Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {visibleStats.map((stat, i) => {
          const StatIcon = ICON_MAP[stat.icon] || BookOpen;
          const theme = STAT_THEMES[stat.icon] || DEFAULT_STAT_THEME;

          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              key={stat.label}
              className="relative group"
            >
              <div
                className={`relative flex min-h-42 flex-col justify-between overflow-hidden p-6 rounded-[28px] sm:rounded-4xl border shadow-xs transition-all duration-300 ${theme.bg} ${theme.border} ${theme.borderHover} hover:shadow-xl hover:-translate-y-0.5`}
              >
                {/* Ultra-minimal ambient corner glow */}
                <div
                  className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-linear-to-br ${theme.glow} blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60`}
                />

                <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-xs transition-transform duration-200 group-hover:scale-105 ${theme.iconContainer}`}
                  >
                    <StatIcon className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${theme.trendBadge}`}
                  >
                    {stat.trend}
                  </span>
                </div>

                <div className="relative z-10 flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.18em]">
                    {stat.label}
                  </span>
                  <span className="text-3xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                    {stat.description}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Real all-time readership by course (Bento Feature Card) */}
      <section className="admin-surface flex flex-col gap-6 p-6 sm:p-8 rounded-[28px] sm:rounded-[36px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Readership Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight">
                Course Readership
              </h2>
              <span className="group/tooltip relative inline-flex" tabIndex={0}>
                <Info className="h-4 w-4 text-zinc-400" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-6 z-30 hidden w-64 -translate-x-1/2 rounded-2xl bg-zinc-950 p-3 text-[11px] font-medium normal-case leading-relaxed text-white shadow-xl group-hover/tooltip:block group-focus/tooltip:block"
                >
                  The bars compare real all-time chapter visits between courses.
                  This is not a date trend because historical chapter-view dates
                  were not recorded.
                </span>
              </span>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20 w-fit">
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
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.18em]">
              {activeGrowth.label}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight">
                {activeGrowth.reads}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {activeGrowth.subtext}
            </p>

            <p className="mt-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
              A read is recorded whenever a public chapter page increments its
              view counter. Repeat visits are included.
            </p>
          </div>

          {/* Right Visual Bar Chart Visualization */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-zinc-50/80 dark:bg-[#18181b]/70 p-5 sm:p-6 rounded-[28px] border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-1">
              <span>Reads by course</span>
              <span className="text-blue-600 dark:text-blue-400 font-black uppercase text-[9px] tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10">
                Actual counters
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
                      {/* Bar area */}
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div
                          aria-label={`${item.label}: ${item.value.toLocaleString()} reads`}
                          className="w-full max-w-9 sm:max-w-12 rounded-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 transition-all duration-300 ease-out shadow-xs cursor-pointer min-h-5"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <span className="max-w-full truncate text-[10px] sm:text-[11px] font-bold text-zinc-400 transition-colors group-hover/bar:text-blue-600 dark:group-hover/bar:text-blue-400 text-center">
                        {item.shortLabel || item.label}
                      </span>

                      {/* Tooltip */}
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
                        all-time reads
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

      {/* Bento Lower Grid: Top Courses & Technology Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Top Performing Courses (Bento Wide Card) */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black font-outfit tracking-tight text-zinc-950 dark:text-white">
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

          <div className="flex flex-col gap-3.5">
            {(dashboardData?.topCourses || []).map((course, i) => (
              <div
                key={course.id}
                className="admin-surface p-4 sm:p-6 rounded-[28px] sm:rounded-4xl transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group min-w-0"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    0{i + 1}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {course.techId}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          course.status === "published"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold font-outfit text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {course.subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-zinc-400 mt-2">
                      <span>{course.chapterCount} Chapters</span>
                      <span>&bull;</span>
                      <span>{course.publicationRate || "0%"} Published</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/80 gap-2">
                  <span className="text-sm sm:text-base font-black font-outfit text-zinc-950 dark:text-white">
                    {course.formattedReads} reads
                  </span>
                  <Link
                    href={`/courses/${course.id}`}
                    className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white text-xs font-bold transition-all"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack & Platform Ecosystem (Bento Column) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <div className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-lg sm:text-xl font-black font-outfit text-zinc-950 dark:text-white">
                Curriculum Focus
              </h3>
            </div>
          </div>

          <div className="admin-surface p-6 sm:p-7 rounded-[28px] sm:rounded-[36px] flex flex-col gap-6">
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
                      <span className="text-zinc-950 dark:text-white font-extrabold text-right">
                        {item.chapters} Chapters ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full min-w-1 rounded-full transition-[width] duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color || "#2563eb",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Platform Ecosystem Secondary Counts */}
            <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-2.5 text-center">
              <div className="flex flex-col p-2.5 bg-zinc-50 dark:bg-[#18181b]/70 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Quizzes
                </span>
                <span className="text-lg sm:text-xl font-black font-outfit text-zinc-950 dark:text-white mt-0.5">
                  {dashboardData?.counts?.quizzes || 0}
                </span>
              </div>
              <div className="flex flex-col p-2.5 bg-zinc-50 dark:bg-[#18181b]/70 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Flashcards
                </span>
                <span className="text-lg sm:text-xl font-black font-outfit text-zinc-950 dark:text-white mt-0.5">
                  {dashboardData?.counts?.flashcards || 0}
                </span>
              </div>
              <div className="flex flex-col p-2.5 bg-zinc-50 dark:bg-[#18181b]/70 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Cheats
                </span>
                <span className="text-lg sm:text-xl font-black font-outfit text-zinc-950 dark:text-white mt-0.5">
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
