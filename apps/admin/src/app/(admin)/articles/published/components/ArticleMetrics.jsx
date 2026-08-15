import React from "react";
import { Card } from "@/components/ui";

export default function ArticleMetrics({ stats }) {
  return (
    <div className="admin-surface mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl">
      <div className="flex flex-col gap-1.5 max-w-md">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          Visibility Summary
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
          Articles marked as{" "}
          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
            Visible
          </strong>{" "}
          appear on the public website. Articles marked as{" "}
          <strong className="text-amber-600 dark:text-amber-400 font-bold">
            Hidden
          </strong>{" "}
          stay saved in the admin workspace.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <div className="p-4 sm:p-5 bg-zinc-50/80 dark:bg-[#18181b]/80 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-0.5 items-center flex-1 sm:flex-initial sm:min-w-30 rounded-2xl">
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Total
          </span>
          <span className="text-2xl sm:text-3xl font-black font-outfit text-zinc-950 dark:text-white">
            {stats.total}
          </span>
        </div>
        <div className="p-4 sm:p-5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col gap-0.5 items-center flex-1 sm:flex-initial sm:min-w-30 rounded-2xl">
          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
            Visible
          </span>
          <span className="text-2xl sm:text-3xl font-black font-outfit text-emerald-700 dark:text-emerald-300">
            {stats.visible}
          </span>
        </div>
        <div className="p-4 sm:p-5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex flex-col gap-0.5 items-center flex-1 sm:flex-initial sm:min-w-30 rounded-2xl">
          <span className="text-[9px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest">
            Hidden
          </span>
          <span className="text-2xl sm:text-3xl font-black font-outfit text-amber-700 dark:text-amber-300">
            {stats.invisible}
          </span>
        </div>
      </div>
    </div>
  );
}
