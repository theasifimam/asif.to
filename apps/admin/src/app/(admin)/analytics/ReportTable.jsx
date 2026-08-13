"use client";

import React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportTable({
  title,
  type,
  report,
  search,
  onSearch,
  sort,
  direction,
  onSort,
  page,
  onPage,
  onOpen,
}) {
  const columns = [
    ["clicks", "Clicks"],
    ["impressions", "Impressions"],
    ["ctr", "CTR"],
    ["position", "Position"],
  ];

  return (
    <section className="w-full bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-zinc-200/70 dark:border-zinc-800 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between bg-zinc-50/50 dark:bg-zinc-950/20">
        <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        <label className="flex h-10 items-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 px-3.5 border border-zinc-200/50 dark:border-zinc-700/50">
          <Search size={14} className="text-zinc-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={`Search ${type}...`}
            className="w-48 sm:w-56 bg-transparent px-2 text-xs font-semibold outline-none placeholder:text-zinc-400"
          />
        </label>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <tr>
              <th className="px-6 py-4">{type}</th>
              {columns.map(([key, label]) => (
                <th key={key} className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSort(key)}
                    className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{label}</span>
                    <ArrowUpDown size={12} className="opacity-60" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {report?.rows?.length ? (
              report.rows.map((row) => (
                <tr
                  key={row.key}
                  onClick={() => type === "pages" && onOpen?.(row.key)}
                  className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                    type === "pages"
                      ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      : ""
                  }`}
                >
                  <td
                    className="max-w-lg truncate px-6 py-4 font-bold text-zinc-900 dark:text-white"
                    title={row.key}
                  >
                    {row.key || "(not available)"}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-blue-600 dark:text-blue-400">
                    {row.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-600 dark:text-zinc-300">
                    {row.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-600 dark:text-zinc-300">
                    {row.ctr.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-zinc-600 dark:text-zinc-300">
                    {row.position.toFixed(1)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-16 text-center text-xs font-bold text-zinc-400"
                >
                  No Search Console data available for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/70 px-6 py-3.5 text-xs text-zinc-400 font-medium">
        <span>
          {report?.pagination?.total || 0} rows · sorted by {sort} ({direction})
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-20 text-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
            {page} / {report?.pagination?.pages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl"
            disabled={page >= (report?.pagination?.pages || 1)}
            onClick={() => onPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </section>
  );
}
