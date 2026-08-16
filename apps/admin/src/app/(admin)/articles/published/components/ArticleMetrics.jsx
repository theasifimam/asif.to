import React from "react";
import { Sparkles, Eye, EyeOff, Layers } from "lucide-react";

export default function ArticleMetrics({ stats }) {
  return (
    <div className="relative overflow-hidden mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] border border-zinc-200/90 bg-linear-to-br from-white via-blue-50/30 to-indigo-50/40 shadow-xl shadow-blue-500/3 dark:border-white/8 dark:bg-linear-to-br dark:from-[#111319] dark:via-[#131622] dark:to-[#0f1118] dark:shadow-2xl dark:shadow-black/60">
      {/* Ambient lighting meshes */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-linear-to-br from-blue-500/15 via-indigo-500/10 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-linear-to-tr from-sky-500/10 to-transparent blur-2xl" />

      <div className="relative z-10 flex flex-col gap-2 max-w-md">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 shadow-2xs backdrop-blur-xs w-fit">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>Visibility Summary</span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
          Articles marked as{" "}
          <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
            Visible
          </strong>{" "}
          appear live on the public website. Articles marked as{" "}
          <strong className="text-amber-700 dark:text-amber-400 font-bold">
            Hidden
          </strong>{" "}
          stay preserved in the workspace.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap gap-3 w-full md:w-auto">
        {/* Total Articles Pill */}
        <div className="relative overflow-hidden p-4 sm:p-5 bg-sky-50/75 dark:bg-[#0c1524] border border-sky-200/70 dark:border-sky-900/40 flex flex-col gap-1 items-center flex-1 sm:flex-initial sm:min-w-32 rounded-3xl shadow-xs transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 text-[10px] font-black uppercase tracking-widest">
            <Layers className="w-3 h-3" />
            <span>Total</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-outfit text-zinc-950 dark:text-white">
            {stats.total}
          </span>
        </div>

        {/* Visible Articles Pill */}
        <div className="relative overflow-hidden p-4 sm:p-5 bg-emerald-50/75 dark:bg-[#0a1a14] border border-emerald-200/70 dark:border-emerald-900/40 flex flex-col gap-1 items-center flex-1 sm:flex-initial sm:min-w-32 rounded-3xl shadow-xs transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest">
            <Eye className="w-3 h-3" />
            <span>Visible</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-outfit text-emerald-700 dark:text-emerald-300">
            {stats.visible}
          </span>
        </div>

        {/* Hidden Articles Pill */}
        <div className="relative overflow-hidden p-4 sm:p-5 bg-amber-50/75 dark:bg-[#1c140a] border border-amber-200/70 dark:border-amber-900/40 flex flex-col gap-1 items-center flex-1 sm:flex-initial sm:min-w-32 rounded-3xl shadow-xs transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest">
            <EyeOff className="w-3 h-3" />
            <span>Hidden</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-outfit text-amber-700 dark:text-amber-300">
            {stats.invisible}
          </span>
        </div>
      </div>
    </div>
  );
}
