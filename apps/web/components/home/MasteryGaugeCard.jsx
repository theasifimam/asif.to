"use client";

import React from "react";
import { Lock, Sparkles } from "lucide-react";

export default function MasteryGaugeCard() {
  const percentage = 78;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="group relative flex flex-col items-center justify-between p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-md transition-all duration-300 min-h-[190px] overflow-hidden">
      {/* Top circular icon button */}
      <div className="w-full flex items-center justify-between">
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <Lock className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
          Mastery Rate
        </span>
      </div>

      {/* Ring Donut Chart Progress Visual */}
      <div className="relative flex items-center justify-center my-2">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="7"
            className="text-zinc-800"
            fill="transparent"
          />
          {/* Progress circle (Primary blue) */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#2563eb"
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black tracking-tight leading-none text-white">
            {percentage}%
          </span>
          <span className="text-[9px] font-bold text-zinc-400 mt-0.5">
            Course Done
          </span>
        </div>
      </div>

      <div className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        <span>78% Overall Track Progress</span>
      </div>
    </div>
  );
}
