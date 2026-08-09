"use client";

import React from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  FileText,
  ArrowUpRight,
  Clock,
  Globe,
  Plus,
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button, Badge, Card } from "@/components/ui";
import { useGetDashboardStatsQuery } from '@/redux/services/dashboardApi';

const ICON_MAP = {
  Users,
  Clock,
  TrendingUp,
  FileText
};

export default function DashboardPage() {
  const { data: response, isLoading, isError, refetch } = useGetDashboardStatsQuery();
  const dashboardData = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Loading Overview...
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
          Unable to fetch dashboard analytics. Please retry.
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

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto text-zinc-800 dark:text-zinc-300 font-sans">
      {/* High-Impact Hero Banner styled identically to apps/web */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-8 sm:p-10 shadow-xl shadow-blue-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-2 right-12 w-28 h-28 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>asif.to Control Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight font-outfit">
            System Overview & Management
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed font-medium">
            Monitor real-time editorial stats, user registrations, course publications, and system metrics.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3 w-full md:w-auto">
          <Link
            href="/articles/new"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-blue-600 font-extrabold text-xs uppercase tracking-wider hover:bg-blue-50 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </Link>
          <Link
            href="/courses"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur-md text-white font-extrabold text-xs uppercase tracking-wider hover:bg-white/25 transition-all active:scale-95"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Courses</span>
          </Link>
        </div>
      </section>

      {/* Analytics Stats Grid styled like apps/web Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(dashboardData?.stats || []).map((stat, i) => {
          const StatIcon = ICON_MAP[stat.icon] || Globe;
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={stat.label}
            >
              <div className="p-6 rounded-[2rem] border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <StatIcon className="w-5 h-5" />
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
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Main Grid: Recent Articles & System Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Articles */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-black font-outfit tracking-tight text-zinc-900 dark:text-white">
              Recent Articles
            </h2>
            <Link
              href="/articles/published"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {(dashboardData?.recentArticles || []).map((article, i) => (
              <div
                key={i}
                onClick={() => (window.location.href = `/articles/${article.id}`)}
                className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-blue-500/50 transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-xs font-extrabold shrink-0">
                    0{i + 1}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-sm sm:text-base font-bold font-outfit text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-400 mt-0.5">
                      <span>{article.author}</span>
                      <span>&bull;</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-bold text-zinc-500 hidden sm:inline">
                    {article.views} views
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                      article.status === 'PUBLISHED'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {article.status}
                  </span>
                </div>
              </div>
            ))}
            {(!dashboardData?.recentArticles || dashboardData.recentArticles.length === 0) && (
              <div className="p-8 text-center text-zinc-400 text-xs font-bold bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
                No active articles found.
              </div>
            )}
          </div>
        </section>

        {/* System Focus & Metrics */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-6 sm:p-7 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                Content Focus
              </span>
              <h3 className="text-lg font-black font-outfit text-zinc-900 dark:text-white">
                Popular Categories
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {(dashboardData?.editorialFocus || []).map((focus) => (
                <div key={focus.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-600 dark:text-zinc-300">{focus.label}</span>
                    <span className="text-zinc-900 dark:text-white font-extrabold">{focus.intensity}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${focus.percentage || 25}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Users</span>
                <span className="text-2xl font-black font-outfit text-zinc-900 dark:text-white">
                  {dashboardData?.counts?.users || 0}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Topics</span>
                <span className="text-2xl font-black font-outfit text-zinc-900 dark:text-white">
                  {dashboardData?.counts?.topics || 0}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}