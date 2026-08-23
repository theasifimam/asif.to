"use client";

import React from "react";
import { FileText, FileEdit, Eye } from "lucide-react";

export function StatCard({ label, value, icon: Icon, theme, trend }) {
  return (
    <div className="rounded-[28px] sm:rounded-4xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${theme.badge}`}
        >
          {trend}
        </span>
      </div>

      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          {label}
        </div>
        <div className="text-3xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight mt-0.5">
          {(value || 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function ProfileStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-1 mb-6">
      <StatCard
        label="Total Articles"
        value={stats.articles}
        icon={FileText}
        trend="Published"
        theme={{
          icon: "bg-sky-100/90 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30",
          badge:
            "bg-sky-100/90 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200 border border-sky-200/80 dark:border-sky-500/30",
        }}
      />
      <StatCard
        label="Active Drafts"
        value={stats.drafts}
        icon={FileEdit}
        trend="In Progress"
        theme={{
          icon: "bg-amber-100/90 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30",
          badge:
            "bg-amber-100/90 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 border border-amber-200/80 dark:border-amber-500/30",
        }}
      />
      <StatCard
        label="Cumulative Views"
        value={stats.totalViews}
        icon={Eye}
        trend="Readership"
        theme={{
          icon: "bg-purple-100/90 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30",
          badge:
            "bg-purple-100/90 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200 border border-purple-200/80 dark:border-purple-500/30",
        }}
      />
    </div>
  );
}
