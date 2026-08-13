"use client";

import React from "react";
import { FileText, FileEdit, Eye } from "lucide-react";

export function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="relative bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] p-7 shadow-sm group hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-xl flex items-center justify-between overflow-hidden">
      <div className="space-y-4 flex-1">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-650 group-hover:text-white transition-all duration-350">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
            {label}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-outfit text-zinc-900 dark:text-white leading-none">
              {(value || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-300 text-blue-500">
        <Icon size={120} />
      </div>
    </div>
  );
}

export default function ProfileStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatBox
        label="Total Articles"
        value={stats.articles}
        icon={FileText}
      />
      <StatBox
        label="Active Drafts"
        value={stats.drafts}
        icon={FileEdit}
      />
      <StatBox
        label="Cumulative Views"
        value={stats.totalViews}
        icon={Eye}
      />
    </div>
  );
}
