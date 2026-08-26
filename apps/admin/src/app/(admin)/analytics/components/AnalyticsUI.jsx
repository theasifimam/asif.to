"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminPagination } from "@/components/admin";

export const unwrap = (response) => response?.data?.data;

export function dateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export const n = (value) => Math.round(Number(value) || 0).toLocaleString();
export const one = (value) => (Number(value) || 0).toFixed(1);
export const pct = (value) => `${(Number(value) || 0).toFixed(1)}%`;
export const ratioPct = (value) => `${((Number(value) || 0) * 100).toFixed(1)}%`;

export function seconds(value) {
  const amount = Math.max(0, Number(value) || 0);
  if (amount < 60) return `${Math.round(amount)}s`;
  const minutes = Math.floor(amount / 60);
  return `${minutes}m ${Math.round(amount % 60)}s`;
}

export function duration(value) {
  const amount = Math.max(0, Number(value) || 0);
  const hours = Math.floor(amount / 3600);
  const minutes = Math.floor((amount % 3600) / 60);
  const secs = Math.round(amount % 60);
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function change(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount >= 0 ? "+" : ""}${amount.toFixed(1)}%`;
}

export function when(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "—";
}

export function MetricCard({ icon: Icon, label, value, source, delta, help }) {
  const positive = Number(delta) >= 0;

  return (
    <div className="flex min-h-32 flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-[#121215] sm:rounded-3xl">
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex flex-wrap justify-end gap-1">
          {source && (
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:bg-zinc-800">
              {source}
            </span>
          )}
          {delta !== undefined && delta !== null && (
            <span
              className={`rounded-full px-2 py-1 text-[9px] font-black ${
                positive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
              }`}
            >
              {change(delta)}
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="mt-3 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
          {value}
        </div>
        <div className="mt-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-300">
          {label}
        </div>
        {help && (
          <p className="mt-1 text-[10px] leading-4 text-zinc-400">{help}</p>
        )}
      </div>
    </div>
  );
}

export function Section({
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`flex flex-col space-y-4 h-full ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between min-h-11">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </section>
  );
}

export function Pills({ items, value, onChange }) {
  return (
    <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
      {items.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black ${
            value === key
              ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-800"
              : "text-zinc-500"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ErrorBox({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div className="grid min-h-72 place-items-center">
      <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
    </div>
  );
}

export function Quality({ data }) {
  if (!data) return null;

  return (
    <div className="grid gap-3 rounded-3xl border border-zinc-200/80 bg-zinc-50/70 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900/40 md:grid-cols-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
            {key.replace(/([A-Z])/g, " $1")}
          </div>
          <div className="mt-1 break-words font-semibold text-zinc-700 dark:text-zinc-300">
            {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClientTable({
  columns,
  rows = [],
  pageSize = 10,
  empty = "No data for this period.",
  className = "",
}) {
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [rows]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);

  return (
    <div
      className={`admin-surface w-full overflow-hidden rounded-3xl flex flex-col justify-between h-full ${className}`}
    >
      <div className="overflow-x-auto flex-1">
        <table className="admin-table w-full text-left text-sm">
          <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 sm:px-5 sm:py-3.5 whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {!visible.length ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-xs font-semibold text-zinc-400"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              visible.map((row, rowIndex) => (
                <tr
                  key={`${row.key || row.pagePath || row.landingPage || row.eventName || "row"}-${start + rowIndex}`}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 sm:px-5 text-xs text-zinc-600 dark:text-zinc-300"
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
        page={safePage}
        pages={pages}
        total={rows.length}
        limit={pageSize}
        itemLabel="rows"
        onPageChange={setPage}
      />
    </div>
  );
}
