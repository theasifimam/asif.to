"use client";

import React from "react";
import { Clock, Zap } from "lucide-react";

export default function StreakDotGridCard() {
  // 14 days activity tracker representation (active dots in primary blue)
  const days = [
    true, true, true, true, true, false, true,
    true, true, true, true, true, true, true,
  ];

  return (
    <div className="group flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition-all duration-300 min-h-[190px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Learning Streak
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold border border-blue-500/20">
          Active
        </span>
      </div>

      <div className="my-2">
        <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          14 Days
        </div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
          109 hours, 23 minutes total
        </p>
      </div>

      {/* Dot Grid Visual (inspired by reference image) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        {days.map((active, i) => (
          <span
            key={i}
            className={`w-3.5 h-3.5 rounded-full transition-all ${
              active
                ? "bg-blue-600 shadow-xs scale-100"
                : "bg-zinc-200 dark:bg-zinc-800 opacity-60"
            }`}
            title={`Day ${i + 1}: ${active ? "Completed" : "Rest"}`}
          />
        ))}
      </div>
    </div>
  );
}
