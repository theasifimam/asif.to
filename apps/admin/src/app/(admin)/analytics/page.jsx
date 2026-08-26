"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { dateRange } from "./components/AnalyticsUI";
import { SOURCES, SourceTabs } from "./components/SourceTabs";
import FirstPartyTab from "./components/FirstPartyTab";
import Ga4Tab from "./components/Ga4Tab";
import SearchConsoleTab from "./components/SearchConsoleTab";

const PRESETS = [
  ["7 days", 7],
  ["28 days", 28],
  ["3 months", 90],
  ["6 months", 180],
  ["12 months", 365],
];

export default function AnalyticsPage() {
  const [source, setSource] = useState("first-party");
  const [days, setDays] = useState(28);
  const range = useMemo(() => dateRange(days), [days]);
  const active = SOURCES.find((item) => item.value === source);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-3.5 sm:gap-8 sm:p-6 md:p-8 lg:p-10 font-sans text-zinc-800 dark:text-zinc-300">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            asif.to analytics
          </p>
          <h1 className="mt-1 font-outfit text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
            Analytics by data source
          </h1>
          <p className="mt-1.5 max-w-3xl text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            First-party, Google Analytics 4 and Google Search Console are isolated so no metric can be mistaken for data from another provider.
          </p>
        </div>

        <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
          <SelectTrigger className="h-10 w-40 rounded-full border-zinc-200/80 bg-white text-xs font-bold dark:border-zinc-800 dark:bg-[#121215]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800">
            {PRESETS.map(([label, value]) => (
              <SelectItem key={value} value={String(value)} className="cursor-pointer rounded-xl text-xs font-bold">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <SourceTabs value={source} onChange={setSource} />

      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-zinc-400">
        <span>
          Source: <strong className="text-zinc-600 dark:text-zinc-300">{active?.label}</strong>
        </span>
        <span>·</span>
        <span>
          {range.start} → {range.end}
        </span>
      </div>

      {source === "first-party" && <FirstPartyTab range={range} />}
      {source === "ga4" && <Ga4Tab range={range} />}
      {source === "gsc" && <SearchConsoleTab range={range} />}
    </div>
  );
}
