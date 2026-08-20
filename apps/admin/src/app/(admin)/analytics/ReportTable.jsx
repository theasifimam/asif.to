"use client";

import React from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admin";
import { getFullCountryName } from "@/lib/countryNames";

const displayKey = (type, key) =>
  type === "countries" ? getFullCountryName(key) : key;

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
    <section className="admin-surface w-full overflow-hidden rounded-3xl">
      <header className="flex flex-col gap-3 border-b border-zinc-100 dark:border-zinc-800/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <h2 className="text-base sm:text-lg font-black font-outfit tracking-tight text-zinc-950 dark:text-white">
          {title}
        </h2>
        <label className="flex h-10 items-center rounded-full bg-zinc-50 dark:bg-[#18181b] px-3.5 border border-zinc-200/80 dark:border-zinc-800/80">
          <Search size={14} className="text-zinc-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={`Search ${type}...`}
            className="w-48 sm:w-56 bg-transparent px-2 text-xs font-medium outline-none placeholder:text-zinc-400 dark:text-zinc-200"
          />
        </label>
      </header>

      <div className="overflow-x-auto">
        <table className="admin-table w-full min-w-170 text-left text-sm">
          <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
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
                    className="max-w-lg truncate px-6 py-4 font-bold text-zinc-950 dark:text-zinc-100"
                    title={row.key}
                  >
                    {displayKey(type, row.key) || "(not available)"}
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
                  className="px-6 py-16 text-center text-xs font-semibold text-zinc-400"
                >
                  No Search Console data available for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        page={page}
        pages={report?.pagination?.pages || 1}
        total={report?.pagination?.total || 0}
        itemLabel="rows"
        onPageChange={onPage}
      />
    </section>
  );
}
