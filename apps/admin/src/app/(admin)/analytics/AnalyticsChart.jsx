"use client";
import { useMemo, useRef, useState } from "react";

const COLORS = { clicks: "#2563eb", impressions: "#8b5cf6", ctr: "#f59e0b", position: "#ec4899", pageViews: "#14b8a6" };
const LABELS = { clicks: "Clicks", impressions: "Impressions", ctr: "CTR", position: "Position", pageViews: "Page views" };
const formatValue = (key, value) => key === "ctr" ? `${Number(value).toFixed(1)}%` : key === "position" ? Number(value).toFixed(1) : Math.round(Number(value) || 0).toLocaleString();

export default function AnalyticsChart({ data, active }) {
  const [hovered, setHovered] = useState(null); const svgRef = useRef(null);
  const paths = useMemo(() => {
    const width = 1000, height = 250;
    return Object.keys(active).filter((key) => active[key]).map((key) => {
      const values = data.map((row) => Number(row[key]) || 0); const max = Math.max(...values, 1);
      const coordinates = values.map((value, index) => ({ x: (index / Math.max(1, values.length - 1)) * width, y: height - (value / max) * (height - 20), value }));
      return { key, coordinates, points: coordinates.map(({ x, y }) => `${x},${y}`).join(" ") };
    });
  }, [data, active]);
  const move = (event) => { if (!data.length || !svgRef.current) return; const rect = svgRef.current.getBoundingClientRect(); const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)); setHovered(Math.round(ratio * Math.max(0, data.length - 1))); };
  const hoverX = hovered === null ? 0 : hovered / Math.max(1, data.length - 1) * 1000;
  return <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
    <svg ref={svgRef} viewBox="0 0 1000 250" preserveAspectRatio="none" className="h-full w-full touch-none" onPointerMove={move} onPointerLeave={() => setHovered(null)} aria-label="Analytics trend chart">
      <g className="text-zinc-200 dark:text-zinc-800">{[0,1,2,3,4].map((line) => <line key={line} x1="0" x2="1000" y1={line * 62.5} y2={line * 62.5} stroke="currentColor" strokeWidth="1"/>)}</g>
      {paths.map(({ key, points }) => <polyline key={key} fill="none" stroke={COLORS[key]} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" points={points}/>)}
      {hovered !== null && <><line x1={hoverX} x2={hoverX} y1="0" y2="250" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" className="text-zinc-400" strokeDasharray="4 4"/>{paths.map(({ key, coordinates }) => coordinates[hovered] && <circle key={key} cx={coordinates[hovered].x} cy={coordinates[hovered].y} r="6" fill={COLORS[key]} stroke="white" strokeWidth="3" vectorEffect="non-scaling-stroke"/>)}</>}
      <rect x="0" y="0" width="1000" height="250" fill="transparent" />
    </svg>
    {hovered !== null && data[hovered] && <div role="tooltip" className="pointer-events-none absolute top-4 z-10 min-w-44 rounded-2xl border border-zinc-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95" style={{ left: `${Math.min(78, Math.max(2, hovered / Math.max(1, data.length - 1) * 100 - 10))}%` }}>
      <p className="mb-2 font-black text-zinc-900 dark:text-white">{new Date(`${data[hovered].date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
      <div className="space-y-1.5">{paths.map(({ key }) => <div key={key} className="flex items-center justify-between gap-5"><span className="flex items-center gap-2 text-zinc-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[key] }}/>{LABELS[key]}</span><strong>{formatValue(key, data[hovered][key])}</strong></div>)}</div>
    </div>}
  </div>;
}
