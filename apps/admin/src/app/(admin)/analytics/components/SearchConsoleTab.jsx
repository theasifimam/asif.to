"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Eye, MousePointerClick, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { analyticsApi } from "@/lib/api";
import LogoLoader from "@/components/ui/LogoLoader";

import { TrendChart } from "../SimpleAnalyticsCharts";
import GscReport from "./GscReport";
import {
  MetricCard,
  Section,
  ErrorBox,
  Loading,
  unwrap,
  n,
  one,
  pct,
  when,
} from "./AnalyticsUI";

export default function SearchConsoleTab({ range }) {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await analyticsApi.overview(range);
    if (response.success) {
      setOverview(unwrap(response));
      setError("");
    } else {
      setError(response.error || "Search Console analytics is unavailable.");
    }
    setLoading(false);
  }, [range, refreshToken]);

  useEffect(() => {
    load();
  }, [load]);

  const sync = async () => {
    setSyncing(true);
    const response = await analyticsApi.sync();

    if (!response.success) {
      setSyncing(false);
      toast.error(response.error || "Search Console sync could not start.");
      return;
    }

    toast.success("Search Console sync started");
    setTimeout(() => {
      setRefreshToken((value) => value + 1);
      setSyncing(false);
    }, 3000);
  };

  if (loading && !overview) return <Loading />;

  const metrics = overview?.metrics || {};
  const metric = (key) => metrics[key] || { value: 0, change: 0 };

  return (
    <div className="space-y-10">
      <ErrorBox>{error}</ErrorBox>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <MetricCard icon={MousePointerClick} label="Google clicks" value={n(metric("clicks").value)} delta={metric("clicks").change} source="GSC" />
        <MetricCard icon={Eye} label="Search impressions" value={n(metric("impressions").value)} delta={metric("impressions").change} source="GSC" />
        <MetricCard icon={BarChart3} label="CTR" value={pct(metric("ctr").value)} delta={metric("ctr").change} source="GSC" />
        <MetricCard icon={Search} label="Average position" value={one(metric("position").value)} delta={metric("position").change} source="GSC" help="Lower position is generally better." />
      </section>

      <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-[#121215]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 text-xs sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Status</div>
              <div className="mt-1 font-black">{overview?.sync?.status || "idle"}</div>
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Last synced</div>
              <div className="mt-1 font-semibold">{when(overview?.sync?.lastSyncedAt)}</div>
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Synced through</div>
              <div className="mt-1 font-semibold">{overview?.sync?.syncedThrough ? new Date(overview.sync.syncedThrough).toLocaleDateString() : "—"}</div>
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Rows synced</div>
              <div className="mt-1 font-semibold">{n(overview?.sync?.rowsSynced)}</div>
            </div>
          </div>

          <button type="button" onClick={sync} disabled={syncing} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-black text-white disabled:opacity-50">
            {syncing ? <LogoLoader className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {syncing ? "Syncing" : "Sync Search Console"}
          </button>
        </div>
        {overview?.sync?.error && <p className="mt-3 text-[10px] leading-4 text-amber-600">{overview.sync.error}</p>}
      </div>

      {/* 2-column: Search Performance Trend (1/2 space) + Search Quality Trend (1/2 space) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section eyebrow="Search trend" title="Clicks and impressions over time" description="Search Console volume metrics.">
          <TrendChart
            data={overview?.trend || []}
            series={[
              { key: "clicks", label: "Clicks" },
              { key: "impressions", label: "Impressions" },
            ]}
            height={260}
          />
        </Section>

        <Section eyebrow="Search quality" title="CTR and average position over time" description="Organic click-through and rank positions.">
          <TrendChart
            data={overview?.trend || []}
            series={[
              { key: "ctr", label: "CTR %" },
              { key: "position", label: "Avg. position" },
            ]}
            height={260}
          />
        </Section>
      </div>

      <Section eyebrow="Search dimensions" title="Every Search Console dimension currently synced" description="Queries, pages, countries, devices and search appearance.">
        <GscReport range={range} refreshToken={refreshToken} />
      </Section>
    </div>
  );
}
