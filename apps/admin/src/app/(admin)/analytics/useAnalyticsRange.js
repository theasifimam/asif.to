"use client";
import { useMemo, useState } from "react";

export const presets = { "7 days": 7, "28 days": 28, "30 days": 30, "90 days": 90 };
function dates(days) { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - days + 1); return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }; }
export function useAnalyticsRange(defaultDays = 28) {
  const [period, setPeriod] = useState(`${defaultDays} days`); const [range, setRange] = useState(dates(defaultDays));
  return { period, range: useMemo(() => range, [range]), setRange, select(name) { setPeriod(name); if (presets[name]) setRange(dates(presets[name])); } };
}
export function RangeControls({ period, range, onSelect, onRange }) { return <div className="flex flex-wrap gap-2"><div className="flex rounded-2xl border border-zinc-200/80 bg-zinc-100/80 p-1 shadow-inner dark:border-zinc-800 dark:bg-zinc-900/80">{Object.keys(presets).map((name) => <button key={name} onClick={() => onSelect(name)} className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${period === name ? "bg-white text-blue-600 shadow-md shadow-zinc-950/10 dark:bg-zinc-950" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}>{name}</button>)}</div>{period === "Custom" && <><input type="date" value={range.start} onChange={(e) => onRange({ ...range, start: e.target.value })}/><input type="date" value={range.end} onChange={(e) => onRange({ ...range, end: e.target.value })}/></>}</div>; }
