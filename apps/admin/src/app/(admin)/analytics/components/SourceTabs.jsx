"use client";

import { Database, BarChart3, Search } from "lucide-react";

export const SOURCES = [
  {
    value: "first-party",
    label: "Captured data",
    icon: Database,
    description: "Data recorded directly by the asif.to tracker.",
  },
  {
    value: "ga4",
    label: "Google Analytics 4",
    icon: BarChart3,
    description: "On-site behavior reported by the official GA4 Data API.",
  },
  {
    value: "gsc",
    label: "Google Search Console",
    icon: Search,
    description: "Google Search performance reported by Search Console.",
  },
];

export function SourceTabs({ value, onChange }) {
  return (
    <div className="flex w-fit items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-x-auto">
      {SOURCES.map((item) => {
        const Icon = item.icon;
        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              active
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Icon
              size={14}
              className={
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
