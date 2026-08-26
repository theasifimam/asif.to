"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AnalyticsShell from "../AnalyticsShell";
import SearchConsoleTab from "../components/SearchConsoleTab";
import { dateRange } from "../components/AnalyticsUI";

const PRESETS = [
  ["7 days", 7],
  ["28 days", 28],
  ["3 months", 90],
  ["6 months", 180],
  ["12 months", 365],
];

export default function SearchAnalyticsPage() {
  const [days, setDays] = useState(28);
  const range = useMemo(() => dateRange(days), [days]);

  return (
    <AnalyticsShell
      eyebrow="Search Console · Organic Data"
      title="Google Search Console"
      description="Google Search performance, queries, pages, and position metrics reported by Search Console."
      actions={
        <Select value={String(days)} onValueChange={(val) => setDays(Number(val))}>
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
      }
    >
      <SearchConsoleTab range={range} />
    </AnalyticsShell>
  );
}
