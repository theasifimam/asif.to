"use client";

import { useState, useEffect } from "react";
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
  ListTodo,
  PenSquare,
  Tag,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGetDashboardStatsQuery } from "@/redux/services/dashboardApi";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import LogoLoader from "@/components/ui/LogoLoader";
import { kanbanApi } from "@/lib/api";

const ICON_MAP = {
  Users,
  Clock,
  TrendingUp,
  FileText,
  BookOpen,
  GraduationCap,
};

const STAT_THEMES = {
  // Course Reads / Engagement -> Sky / Cyan Mesh
  BookOpen: {
    bg: "bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-white dark:to-zinc-900/90",
    border: "border-sky-500/20 dark:border-sky-500/20",
    borderHover: "hover:border-sky-500/40 dark:hover:border-sky-500/40",
    iconContainer:
      "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20",
    trendBadge:
      "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30",
  },
  // Active Courses / Curriculum -> Emerald / Mint Mesh
  GraduationCap: {
    bg: "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-zinc-900/90",
    border: "border-emerald-500/20 dark:border-emerald-500/20",
    borderHover: "hover:border-emerald-500/40 dark:hover:border-emerald-500/40",
    iconContainer:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    trendBadge:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
  },
  // Avg Completion Rate / Performance -> Amber / Orange Mesh
  TrendingUp: {
    bg: "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white dark:to-zinc-900/90",
    border: "border-amber-500/20 dark:border-amber-500/20",
    borderHover: "hover:border-amber-500/40 dark:hover:border-amber-500/40",
    iconContainer:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    trendBadge:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
  },
  // Enrolled Learners / Community -> Purple / Violet Mesh
  Users: {
    bg: "bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90",
    border: "border-purple-500/20 dark:border-purple-500/20",
    borderHover: "hover:border-purple-500/40 dark:hover:border-purple-500/40",
    iconContainer:
      "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    trendBadge:
      "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
  },
};

const DEFAULT_STAT_THEME = {
  bg: "bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90",
  border: "border-blue-500/20 dark:border-blue-500/20",
  borderHover: "hover:border-blue-500/40 dark:hover:border-blue-500/40",
  iconContainer:
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  trendBadge:
    "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [plannerTasks, setPlannerTasks] = useState([]);
  const [plannerLoading, setPlannerLoading] = useState(true);

  useEffect(() => {
    async function fetchPlanner() {
      try {
        const res = await kanbanApi.boards();
        if (res.success && res.data?.data?.length > 0) {
          const firstBoard = res.data.data[0];
          const boardId = firstBoard._id || firstBoard.id;
          const detailRes = await kanbanApi.getBoard(boardId);
          if (detailRes.success && detailRes.data?.data) {
            const { cards = [], columns = [] } = detailRes.data.data;
            const pending = cards.filter((card) => {
              const colId = String(
                typeof card.column === "object"
                  ? card.column?._id
                  : card.column,
              );
              const colObj = columns.find(
                (c) => String(c._id || c.id) === colId,
              );
              if (
                colObj &&
                /done|published|complete/i.test(colObj.name || "")
              ) {
                return false;
              }
              return !card.completed;
            });
            setPlannerTasks(pending);
          }
        }
      } catch (err) {
        console.error("Failed to fetch planner tasks:", err);
      } finally {
        setPlannerLoading(false);
      }
    }
    fetchPlanner();
  }, []);

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
        <LogoLoader className="h-12 w-12" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
          Loading Creator Studio Analytics...
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

  const userName =
    user?.fullName || user?.name || user?.username || "Asif Imam";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 font-sans text-zinc-800 dark:text-zinc-300 sm:p-6 md:p-8 lg:p-10 min-w-0">
      {/* 1. CREATOR HERO BENTO BANNER */}
      <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-950 text-white p-6 sm:p-9 shadow-xl border border-zinc-800 min-w-0">
        {/* Ambient Radial Mesh Glows */}
        <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] sm:text-[11px] font-black tracking-wider uppercase mb-3 text-zinc-300 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Creator & Admin Studio
            </div>

            <h1 className="font-outfit text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Welcome back,{" "}
              <span className="text-blue-400 block sm:inline">
                {userName}! 👋
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed font-medium text-zinc-400">
              Here is your platform roadmap, course analytics, and planner status
              for today.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none lg:mx-0 lg:px-0 lg:pb-0 lg:flex-wrap lg:justify-end shrink-0">
            <Button
              asChild
              size="sm"
              className="rounded-full shrink-0 h-10 px-4 text-xs font-black gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all active:scale-95"
            >
              <Link href="/courses">
                <BookOpen className="w-4 h-4" />
                <span>Manage Courses</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full shrink-0 h-10 px-4 text-xs font-bold gap-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 active:scale-95 transition-all"
            >
              <Link href="/articles">
                <PenSquare className="w-4 h-4 text-blue-400" />
                <span>Write Articles</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full shrink-0 h-10 px-4 text-xs font-bold gap-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 active:scale-95 transition-all"
            >
              <Link href="/quiz">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>Quiz Builder</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. TASKS LEFT IN PLANNER BENTO CARD */}
      <section className="rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 border border-amber-500/20 shadow-xs space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ListTodo className="w-5 h-5" />
            </div>
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h2 className="font-outfit text-base sm:text-lg font-black text-zinc-950 dark:text-white truncate">
                Tasks Left in Planner
              </h2>
              <span className="shrink-0 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 px-3 py-0.5 text-[10px] font-black">
                {plannerLoading ? "..." : `${plannerTasks.length} pending`}
              </span>
            </div>
          </div>

          <Link
            href="/planner"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
          >
            <span>Open Planner</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {plannerLoading ? (
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold py-3">
            <LogoLoader className="h-4 w-4" />
            Fetching planner tasks...
          </div>
        ) : plannerTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {plannerTasks.slice(0, 3).map((task) => {
              let priorityColorClass = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
              let dotColorClass = "bg-zinc-400";
              if (task.priority === "urgent" || task.priority === "high") {
                priorityColorClass = "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20";
                dotColorClass = "bg-rose-500";
              } else if (task.priority === "medium") {
                priorityColorClass = "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20";
                dotColorClass = "bg-amber-500";
              } else if (task.priority === "low") {
                priorityColorClass = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20";
                dotColorClass = "bg-emerald-500";
              }

              return (
                <Link
                  key={task._id || task.id}
                  href="/planner"
                  className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/40 hover:shadow-md transition-all group"
                >
                  <div className="flex gap-2.5 items-start">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-amber-500 transition-all mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-transparent group-hover:bg-amber-500 transition-colors" />
                    </div>
                    <p className="font-outfit text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase text-zinc-400 dark:text-zinc-500">
                      <Tag className="w-2.5 h-2.5" />
                      {task.type || "Task"}
                    </span>
                    {task.priority && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${priorityColorClass}`}>
                        <span className={`w-1 h-1 rounded-full ${dotColorClass}`} />
                        {task.priority}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            🎉 All tasks in your planner are completed! Great job!
          </div>
        )}
      </section>

      {/* 3. BENTO METRICS CARDS GRID (SQUIRCLE MESH CARDS) */}
      <section
        className={`grid grid-cols-2 ${
          visibleStats.length >= 5
            ? "sm:grid-cols-3 lg:grid-cols-5"
            : visibleStats.length === 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-3"
        } gap-3 sm:gap-4`}
      >
        {visibleStats.map((stat, i) => {
          const StatIcon = ICON_MAP[stat.icon] || BookOpen;
          const theme = STAT_THEMES[stat.icon] || DEFAULT_STAT_THEME;

          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              key={stat.label}
              className="relative group min-w-0"
            >
              <div
                className={`relative flex min-h-36 sm:min-h-44 flex-col justify-between overflow-hidden p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border shadow-xs transition-all duration-300 ${theme.bg} ${theme.border} ${theme.borderHover} hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-xs transition-transform duration-200 group-hover:scale-105 ${theme.iconContainer}`}
                  >
                    <StatIcon className="w-5.5 h-5.5" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider ${theme.trendBadge}`}
                  >
                    {stat.trend}
                  </span>
                </div>

                <div className="relative z-10 flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.18em] truncate">
                    {stat.label}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 line-clamp-1">
                    {stat.description}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* 4. READERSHIP ANALYTICS (BENTO FEATURE CONTAINER) */}
      <section className="rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 flex flex-col gap-4 p-5 sm:p-8 shadow-xs hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Readership Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight">
                Course Readership Overview
              </h2>
              <span className="group/tooltip relative inline-flex" tabIndex={0}>
                <Info className="h-4 w-4 text-zinc-400" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-6 z-30 hidden w-64 -translate-x-1/2 rounded-2xl bg-zinc-950 p-3 text-[11px] font-medium normal-case leading-relaxed text-white shadow-xl group-hover/tooltip:block group-focus/tooltip:block"
                >
                  The bars compare real all-time chapter visits between courses.
                </span>
              </span>
            </div>
          </div>
          <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 w-fit">
            All-time captured data
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center"
        >
          {/* Left Metrics */}
          <div className="lg:col-span-5 flex flex-col gap-2.5 sm:gap-3">
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.18em]">
              {activeGrowth.label}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-5xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight">
                {activeGrowth.reads}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {activeGrowth.subtext}
            </p>

            <p className="mt-1 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
              A read is recorded whenever a public chapter page increments its
              view counter. Repeat visits are included.
            </p>
          </div>

          {/* Right Visual Bar Chart Visualization */}
          <div className="lg:col-span-7 flex flex-col gap-3 bg-zinc-50 dark:bg-zinc-950/60 p-4 sm:p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-1">
              <span>Reads by course</span>
              <span className="text-blue-600 dark:text-blue-400 font-black uppercase text-[9.5px] tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                Actual counters
              </span>
            </div>

            <div className="h-36 sm:h-44 flex items-end justify-between gap-3 sm:gap-5 pt-3">
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
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div
                          aria-label={`${item.label}: ${item.value.toLocaleString()} reads`}
                          className="w-full max-w-9 sm:max-w-12 rounded-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-400 transition-all duration-300 ease-out shadow-xs cursor-pointer min-h-5"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      <span className="max-w-full truncate text-[10px] sm:text-[11px] font-bold text-zinc-400 transition-colors group-hover/bar:text-blue-600 dark:group-hover/bar:text-blue-400 text-center">
                        {item.shortLabel || item.label}
                      </span>

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

      {/* 5. BENTO LOWER GRID: TOP COURSES & CURRICULUM FOCUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Top Performing Courses (Bento Container) */}
        <section className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-7 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-black font-outfit tracking-tight text-zinc-950 dark:text-white">
                  Top Performing Courses
                </h2>
              </div>
              <Link
                href="/courses"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-3 max-h-144 overflow-y-auto pr-1">
              {(dashboardData?.topCourses || []).map((course, i) => (
                <div
                  key={course.id}
                  className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 group hover:border-blue-500/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border border-zinc-200/80 dark:border-zinc-700/80">
                      0{i + 1}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {course.techId}
                        </span>
                        <span
                          className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            course.status === "published"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>
                      <h3 className="text-base font-black font-outfit text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 font-medium">
                        {course.subtitle}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-zinc-400 mt-2">
                        <span>{course.chapterCount} Chapters</span>
                        <span>&bull;</span>
                        <span>{course.publicationRate || "0%"} Published</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-zinc-200/60 dark:border-zinc-800/80 gap-2">
                    <span className="text-sm sm:text-base font-black font-outfit text-zinc-950 dark:text-white">
                      {course.formattedReads} reads
                    </span>
                    <Link
                      href={`/courses/${course.id}`}
                      className="px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum Focus Bento Container */}
        <section className="lg:col-span-4 flex flex-col gap-3 min-w-0">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90 border border-blue-500/20 p-5 sm:p-7 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black font-outfit text-zinc-950 dark:text-white">
                Curriculum Focus
              </h3>
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
                      <span className="text-zinc-950 dark:text-white font-extrabold text-right">
                        {item.chapters} Chapters ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-200/70 dark:bg-zinc-800 rounded-full overflow-hidden">
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

            {/* Platform Ecosystem Counts */}
            <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col p-3 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Quizzes
                </span>
                <span className="text-base sm:text-xl font-black font-outfit text-zinc-950 dark:text-white mt-0.5">
                  {dashboardData?.counts?.quizzes || 0}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Cards
                </span>
                <span className="text-base sm:text-xl font-black font-outfit text-zinc-950 dark:text-white mt-0.5">
                  {dashboardData?.counts?.flashcards || 0}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Cheats
                </span>
                <span className="text-base sm:text-xl font-black font-outfit text-zinc-950 dark:text-white mt-0.5">
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

