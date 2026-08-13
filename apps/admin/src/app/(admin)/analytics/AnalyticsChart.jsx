"use client";
import { useMemo } from "react";

const COLORS = { clicks: "#2563eb", impressions: "#8b5cf6", ctr: "#f59e0b", position: "#ec4899", pageViews: "#14b8a6" };
export default function AnalyticsChart({ data, active }) {
  const paths = useMemo(() => {
    const width = 1000, height = 250;
    return Object.keys(active).filter((key) => active[key]).map((key) => {
      const values = data.map((row) => Number(row[key]) || 0); const max = Math.max(...values, 1); const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * width},${height - (value / max) * (height - 20)}`).join(" ");
      return { key, points };
    });
  }, [data, active]);
  return <div className="h-72 w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><svg viewBox="0 0 1000 250" preserveAspectRatio="none" className="h-full w-full"><g className="text-zinc-200 dark:text-zinc-800">{[0,1,2,3,4].map((line) => <line key={line} x1="0" x2="1000" y1={line * 62.5} y2={line * 62.5} stroke="currentColor" strokeWidth="1"/>)}</g>{paths.map(({ key, points }) => <polyline key={key} fill="none" stroke={COLORS[key]} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" points={points}/>)}</svg></div>;
}
