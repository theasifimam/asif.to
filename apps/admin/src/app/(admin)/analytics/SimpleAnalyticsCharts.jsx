"use client";

import { useMemo, useRef, useState } from "react";

// ASIF_SIMPLE_ANALYTICS_V1
const COLORS = [
  "#2563eb",
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#22c55e",
  "#0ea5e9",
  "#f97316",
];

const compact = (value) =>
  Intl.NumberFormat(undefined, {
    notation:
      Math.abs(Number(value) || 0) >= 1000
        ? "compact"
        : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const dateLabel = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
    },
  );

export function TrendChart({
  data = [],
  series = [],
  height = 250,
}) {
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  const width = 900;
  const innerHeight = 190;

  const prepared = useMemo(() => {
    const max = Math.max(
      1,
      ...series.flatMap((item) =>
        data.map(
          (row) => Number(row[item.key]) || 0,
        ),
      ),
    );

    return series.map((item, seriesIndex) => {
      const points = data.map((row, index) => {
        const value = Number(row[item.key]) || 0;

        return {
          value,
          x:
            (index /
              Math.max(data.length - 1, 1)) *
            width,
          y:
            innerHeight -
            (value / max) * (innerHeight - 18),
        };
      });

      return {
        ...item,
        color:
          item.color ||
          COLORS[seriesIndex % COLORS.length],
        points,
        polyline: points
          .map((point) => `${point.x},${point.y}`)
          .join(" "),
      };
    });
  }, [data, series]);

  if (!data.length) {
    return <EmptyChart text="No trend data yet" />;
  }

  const move = (event) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(
        1,
        (event.clientX - rect.left) / rect.width,
      ),
    );

    setHovered(
      Math.round(
        ratio * Math.max(data.length - 1, 0),
      ),
    );
  };

  const hoverX =
    hovered === null
      ? 0
      : (hovered /
          Math.max(data.length - 1, 1)) *
        width;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-[#121215]"
      style={{ height }}
    >
      <div className="mb-2 flex flex-wrap gap-4 px-1">
        {prepared.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>

      <svg
        ref={ref}
        viewBox={`0 0 ${width} 210`}
        preserveAspectRatio="none"
        className="h-[calc(100%-42px)] w-full touch-none"
        onPointerMove={move}
        onPointerLeave={() => setHovered(null)}
      >
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="0"
            x2={width}
            y1={line * 60}
            y2={line * 60}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 7"
            className="text-zinc-200 dark:text-zinc-800"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {prepared.map((item) => (
          <polyline
            key={item.key}
            points={item.polyline}
            fill="none"
            stroke={item.color}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {hovered !== null && (
          <line
            x1={hoverX}
            x2={hoverX}
            y1="0"
            y2="190"
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-zinc-400"
            vectorEffect="non-scaling-stroke"
          />
        )}

        <rect
          x="0"
          y="0"
          width={width}
          height="210"
          fill="transparent"
        />
      </svg>

      <div className="absolute bottom-3 left-5 right-5 flex justify-between text-[9px] font-bold text-zinc-400">
        <span>{dateLabel(data[0]?.date)}</span>
        <span>
          {dateLabel(
            data[Math.floor((data.length - 1) / 2)]?.date,
          )}
        </span>
        <span>{dateLabel(data[data.length - 1]?.date)}</span>
      </div>

      {hovered !== null && data[hovered] && (
        <div
          className="pointer-events-none absolute top-12 z-10 min-w-40 rounded-2xl border border-zinc-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95"
          style={{
            left: `${Math.min(
              72,
              Math.max(
                2,
                (hovered / Math.max(data.length - 1, 1)) *
                  100 -
                  8,
              ),
            )}%`,
          }}
        >
          <div className="font-black">
            {dateLabel(data[hovered].date)}
          </div>

          <div className="mt-2 space-y-1.5">
            {prepared.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-5"
              >
                <span className="text-zinc-500">
                  {item.label}
                </span>
                <strong>
                  {compact(data[hovered][item.key])}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HorizontalBarChart({
  rows = [],
  labelKey = "key",
  valueKey = "pageViews",
  valueLabel = "views",
}) {
  const items = rows.slice(0, 8);
  const max = Math.max(
    1,
    ...items.map((row) => Number(row[valueKey]) || 0),
  );

  if (!items.length) {
    return <EmptyChart text="No comparison data yet" />;
  }

  return (
    <div className="space-y-3">
      {items.map((row, index) => {
        const value = Number(row[valueKey]) || 0;

        return (
          <div key={`${row[labelKey]}-${index}`}>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-[11px]">
              <span
                className="min-w-0 truncate font-bold text-zinc-700 dark:text-zinc-200"
                title={row[labelKey]}
              >
                {row[labelKey] || "Unknown"}
              </span>
              <span className="shrink-0 font-black text-zinc-500">
                {compact(value)} {valueLabel}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.max(
                    value ? (value / max) * 100 : 0,
                    value ? 3 : 0,
                  )}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({
  rows = [],
  valueKey = "pageViews",
}) {
  const items = rows.filter(
    (row) => Number(row[valueKey]) > 0,
  );

  const total = items.reduce(
    (sum, row) =>
      sum + (Number(row[valueKey]) || 0),
    0,
  );

  if (!total) {
    return <EmptyChart text="No device data yet" />;
  }

  let offset = 0;

  const circles = items.map((row, index) => {
    const value = Number(row[valueKey]) || 0;
    const percent = (value / total) * 100;

    const item = {
      ...row,
      value,
      percent,
      offset,
      color: COLORS[index % COLORS.length],
    };

    offset += percent;
    return item;
  });

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 42 42" className="-rotate-90">
          <circle
            cx="21"
            cy="21"
            r="15.9155"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            className="text-zinc-100 dark:text-zinc-800"
          />

          {circles.map((item) => (
            <circle
              key={item.key}
              cx="21"
              cy="21"
              r="15.9155"
              fill="transparent"
              stroke={item.color}
              strokeWidth="6"
              strokeDasharray={`${item.percent} ${100 - item.percent}`}
              strokeDashoffset={-item.offset}
            />
          ))}
        </svg>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xl font-black">
              {compact(total)}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              page views
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {circles.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-2 font-bold capitalize text-zinc-600 dark:text-zinc-300">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.key || "other"}
            </span>

            <span className="font-black">
              {item.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-zinc-200 text-xs font-semibold text-zinc-400 dark:border-zinc-800">
      {text}
    </div>
  );
}
