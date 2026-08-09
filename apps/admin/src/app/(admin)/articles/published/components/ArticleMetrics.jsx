import React from 'react';
import { Card } from "@/components/ui";

export default function ArticleMetrics({ stats }) {
  return (
    <Card className="mt-8 bg-white dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-8 p-10 rounded-[3rem]">
      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Visibility Summary</h3>
        <p className="text-zinc-500 dark:text-zinc-500 text-sm max-w-md font-light">
          Articles marked as <strong className="text-emerald-500">Visible</strong> appear on the public website. Articles marked as <strong className="text-amber-500">Invisible</strong> stay saved in the admin panel.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 items-center min-w-[120px] rounded-3xl shadow-none">
          <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-600 uppercase">Total Articles</span>
          <span className="text-3xl font-black font-outfit text-zinc-900 dark:text-white">{stats.total}</span>
        </Card>
        <Card className="p-6 bg-emerald-500/5 border-emerald-500/20 flex flex-col gap-1 items-center min-w-[120px] rounded-3xl shadow-none">
          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Visible (Web)</span>
          <span className="text-3xl font-black font-outfit text-emerald-600 dark:text-emerald-400">{stats.visible}</span>
        </Card>
        <Card className="p-6 bg-amber-500/5 border-amber-500/20 flex flex-col gap-1 items-center min-w-[120px] rounded-3xl shadow-none">
          <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase">Hidden (Web)</span>
          <span className="text-3xl font-black font-outfit text-amber-600 dark:text-amber-400">{stats.invisible}</span>
        </Card>
      </div>
    </Card>
  );
}
