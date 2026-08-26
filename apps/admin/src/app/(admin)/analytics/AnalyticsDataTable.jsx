"use client";

import { AdminPagination } from "@/components/admin";

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

  return (
    <div className="admin-surface w-full overflow-hidden rounded-3xl flex flex-col justify-between h-full">
      <div className="overflow-x-auto flex-1">
        <table className="admin-table w-full text-left text-sm">
          <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-3.5 whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {!rows.length ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-xs font-semibold text-zinc-400"
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
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-5 py-3 text-xs text-zinc-600 dark:text-zinc-300"
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

      <AdminPagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        itemLabel="rows"
        onPageChange={onPage}
      />
    </div>
  );
}

