"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function ConcentricSkillsCard() {
  return (
    <div className="group flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition-all duration-300 min-h-65">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 truncate">
          Full-Stack Skills
        </h3>
        <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
          <span>2026</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Concentric Layered Circles Visual (Matching reference graphic style) */}
      <div className="relative my-3 flex items-center justify-center h-44">
        {/* Layer 4 - Outer (MongoDB) */}
        <div className="absolute w-44 h-44 rounded-full bg-blue-500/10 border border-blue-500/20 flex flex-col items-center pt-2">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
            MongoDB 95%
          </span>
        </div>

        {/* Layer 3 (Express.js) */}
        <div className="absolute w-34 h-34 rounded-full bg-blue-500/20 border border-blue-500/30 flex flex-col items-center pt-2">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
            Express 85%
          </span>
        </div>

        {/* Layer 2 (Next.js) */}
        <div className="absolute w-24 h-24 rounded-full bg-blue-500/40 border border-blue-500/40 flex flex-col items-center pt-2 text-white">
          <span className="text-[10px] font-bold">Next.js 70%</span>
        </div>

        {/* Layer 1 - Core (React.js) */}
        <div className="absolute w-14 h-14 rounded-full bg-blue-600 shadow-md flex items-center justify-center text-white text-[10px] font-black text-center leading-tight">
          React
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium text-center border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
        Full-stack proficiency breakdown
      </div>
    </div>
  );
}
