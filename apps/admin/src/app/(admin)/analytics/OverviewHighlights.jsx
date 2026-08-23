"use client";
import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import MetricCard from "./MetricCard";
const n = (v) => Math.round(Number(v) || 0).toLocaleString();
export default function OverviewHighlights({ range, search }) {
  const [ga4,setGa4] = useState(null); const [platform,setPlatform] = useState(null);
  useEffect(() => { Promise.all([analyticsApi.ga4(range),analyticsApi.platform()]).then(([a,b]) => { if(a.success)setGa4(a.data.data); if(b.success)setPlatform(b.data.data); }); }, [range]);
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight">
          Key Metrics Overview
        </h2>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
          Unified telemetry from GA4, Google Search Console, and platform data.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Active Users" value={n(ga4?.summary?.activeUsers)} source="GA4" />
        <MetricCard label="Sessions" value={n(ga4?.summary?.sessions)} source="GA4" />
        <MetricCard label="Page Views" value={n(ga4?.summary?.screenPageViews)} source="GA4" />
        <MetricCard label="Search Clicks" value={n(search?.clicks?.value)} source="GSC" />
        <MetricCard label="Impressions" value={n(search?.impressions?.value)} source="GSC" />
        <MetricCard label="Published Content" value={n(platform?.counts?.publishedContent)} source="Platform" />
      </div>
    </section>
  );
}
