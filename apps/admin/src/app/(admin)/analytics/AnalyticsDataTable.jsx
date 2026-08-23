"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ASIF_SIMPLE_ANALYTICS_V1
export default function AnalyticsDataTable({
  columns = [],
  rows = [],
  pagination,
  onPage,
  empty = "No data for this period.",
}) {
  const page = pagination?.page || 1;
  const pages = pagination?.pages || 1;
  const total = pagination?.total || 0;
  const limit = pagination?.limit || 15;

  const from = total
    ? (page - 1) * limit + 1
    : 0;
  const to = Math.min(page * limit, total);

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#121215]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-left">
          <thead className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {!rows.length ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs font-semibold text-zinc-400"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={
                    row.id ||
                    row.path ||
                    `${row.key}-${row.extra || ""}-${rowIndex}`
                  }
                  className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3 text-[11px] sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <span className="font-semibold text-zinc-400">
          Showing {from}–{to} of {total.toLocaleString()}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPage?.(page - 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 text-zinc-500 disabled:opacity-30 dark:border-zinc-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <span className="min-w-20 text-center font-black text-zinc-600 dark:text-zinc-300">
            {page} / {pages}
          </span>

          <button
            type="button"
            disabled={page >= pages}
            onClick={() => onPage?.(page + 1)}
            className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 text-zinc-500 disabled:opacity-30 dark:border-zinc-700"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
