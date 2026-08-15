"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { analyticsApi } from "@/lib/api";
import AnalyticsChart from "./AnalyticsChart";
import ReportTable from "./ReportTable";
import AnalyticsNav from "./AnalyticsNav";
import OverviewHighlights from "./OverviewHighlights";
import MetricCard from "./MetricCard";

const unwrap = (response) => response?.data?.data;
const presets = {
  "7 days": 7,
  "28 days": 28,
  "3 months": 90,
  "6 months": 180,
  "12 months": 365,
};
const metricLabels = {
  clicks: "Total clicks",
  impressions: "Total impressions",
  ctr: "Average CTR",
  position: "Average position",
  organicVisitors: "Organic visitors",
  pageViews: "Page views",
  visitors: "Unique visitors",
  sessions: "Sessions",
  engagementTime: "Avg engagement time",
};
function dates(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}
function format(key, value) {
  if (key === "ctr") return `${value.toFixed(1)}%`;
  if (key === "position") return value.toFixed(1);
  if (key === "engagementTime") return `${Math.round(value)}s`;
  return Math.round(value).toLocaleString();
}
function timeAgo(value) {
  if (!value) return "never";
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  const units = [
    [31536000, "y"],
    [2592000, "m"],
    [604800, "w"],
    [86400, "d"],
    [3600, "hr"],
    [60, "min"],
  ];
  const [size, label] = units.find(([size]) => seconds >= size);
  return `${Math.floor(seconds / size)}${label} ago`;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("28 days");
  const [range, setRange] = useState(dates(28));
  const [overview, setOverview] = useState(null);
  const [content, setContent] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tab, setTab] = useState("queries");
  const [report, setReport] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("clicks");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [metrics, setMetrics] = useState({
    clicks: true,
    impressions: true,
    ctr: false,
    position: false,
    pageViews: true,
  });
  const [contentTab, setContentTab] = useState("courses");
  const params = useMemo(() => range, [range]);
  const loadMain = useCallback(async () => {
    setLoading(true);
    const [a, b, c] = await Promise.all([
      analyticsApi.overview(params),
      analyticsApi.content(params),
      analyticsApi.sources(params),
    ]);
    if (a.success) setOverview(unwrap(a));
    else toast.error(a.error);
    if (b.success) setContent(unwrap(b));
    if (c.success) setSources(unwrap(c) || []);
    setLoading(false);
  }, [params]);
  const loadReport = useCallback(async () => {
    const response = await analyticsApi.search(tab, {
      ...params,
      search,
      sort,
      direction,
      page,
      limit: 25,
    });
    if (response.success) setReport(unwrap(response));
    else toast.error(response.error);
  }, [tab, params, search, sort, direction, page]);
  useEffect(() => {
    loadMain();
  }, [loadMain]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => {
    const timer = setTimeout(loadReport, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [loadReport, search]);
  const setPreset = (name) => {
    setPeriod(name);
    if (presets[name]) setRange(dates(presets[name]));
  };
  const sync = async () => {
    const response = await analyticsApi.sync();
    if (!response.success) return toast.error(response.error);
    setSyncing(true);
    toast.success("Search Console sync started");
    for (let attempt = 0; attempt < 90; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusResponse = await analyticsApi.overview(params);
      const next = statusResponse.success ? unwrap(statusResponse) : null;
      if (next?.sync && next.sync.status !== "syncing") {
        setSyncing(false);
        await Promise.all([loadMain(), loadReport()]);
        if (next.sync.status === "error")
          toast.error(next.sync.error || "Search Console sync failed");
        else
          toast.success(
            next.sync.error
              ? "Sync completed with warnings"
              : "Search Console data updated",
          );
        return;
      }
    }
    setSyncing(false);
    toast.info("Sync is still running. The dashboard will update on refresh.");
  };
  if (loading && !overview)
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  const connected = overview?.sync?.configured;
  return (
    <div className="mx-auto flex max-w-375 flex-col gap-8 p-4 sm:p-6 md:p-8 lg:p-10 font-sans">
      <AnalyticsNav />
      <OverviewHighlights range={params} search={overview?.metrics} />

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Growth intelligence
          </p>
          <h1 className="mt-1 font-outfit text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
            Search & site analytics
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Real Search Console performance and privacy-conscious first-party
            traffic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap rounded-full border border-zinc-200/80 bg-zinc-100/80 p-1 dark:border-zinc-800/80 dark:bg-[#18181b]">
            {Object.keys(presets).map((name) => (
              <button
                key={name}
                onClick={() => setPreset(name)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  period === name
                    ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-900 dark:text-blue-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {name}
              </button>
            ))}
            <button
              onClick={() => setPeriod("Custom")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                period === "Custom"
                  ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-900 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Custom
            </button>
          </div>

          <Button
            onClick={sync}
            disabled={
              !connected || syncing || overview?.sync?.status === "syncing"
            }
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 shadow-xs"
          >
            <RefreshCw
              size={14}
              className={
                syncing || overview?.sync?.status === "syncing"
                  ? "animate-spin"
                  : ""
              }
            />
            {syncing ? "Syncing…" : "Sync now"}
          </Button>
        </div>
      </header>

      {period === "Custom" && (
        <div className="flex flex-wrap gap-2.5">
          <input
            type="date"
            value={range.start}
            onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
            className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-2 text-xs font-semibold dark:border-zinc-800 dark:bg-[#18181b]"
          />
          <input
            type="date"
            value={range.end}
            onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
            className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-2 text-xs font-semibold dark:border-zinc-800 dark:bg-[#18181b]"
          />
        </div>
      )}

      {!connected && (
        <div className="flex gap-3.5 rounded-3xl border border-amber-200/80 bg-amber-50/70 p-4 sm:p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200">
          <AlertCircle
            className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5"
            size={20}
          />
          <div>
            <strong className="font-bold">
              Search Console is not connected.
            </strong>
            <p className="mt-1 text-xs opacity-85 leading-relaxed">
              Add the server environment variables described in env.example.
              First-party traffic will still appear as it is collected.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span
          className={`h-2 w-2 rounded-full ${
            overview?.sync?.status === "error"
              ? "bg-rose-500"
              : "bg-emerald-500"
          }`}
        />
        {overview?.sync?.lastSyncedAt ? (
          <span
            title={`Last synced ${new Date(
              overview.sync.lastSyncedAt,
            ).toLocaleString()} · data through ${new Date(
              overview.sync.syncedThrough,
            ).toLocaleDateString()}`}
          >
            Last synced {timeAgo(overview.sync.lastSyncedAt)} · data through{" "}
            {timeAgo(overview.sync.syncedThrough)}
          </span>
        ) : (
          "No Search Console sync yet"
        )}
        {overview?.sync?.error && (
          <span className="text-rose-500"> · {overview.sync.error}</span>
        )}
      </div>

      <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Object.entries(metricLabels).map(([key, label]) => {
          const item = overview?.metrics?.[key] || { value: 0, change: 0 };
          return (
            <MetricCard
              key={key}
              label={label}
              value={format(key, item.value)}
              change={item.change}
            />
          );
        })}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(metrics).map((key) => (
            <button
              key={key}
              onClick={() => setMetrics((m) => ({ ...m, [key]: !m[key] }))}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                metrics[key]
                  ? "border-blue-500/80 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/15 dark:text-blue-300"
                  : "border-zinc-200/80 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-400"
              }`}
            >
              {metricLabels[key] || key}
            </button>
          ))}
        </div>
        <AnalyticsChart data={overview?.trend || []} active={metrics} />
      </section>

      <section className="flex flex-col gap-3.5">
        <div className="flex gap-1.5 overflow-x-auto rounded-full border border-zinc-200/80 bg-white/90 p-1 dark:border-zinc-800/80 dark:bg-[#121215]/90 w-fit scrollbar-none">
          {["queries", "pages", "countries", "devices", "appearance"].map(
            (name) => (
              <button
                key={name}
                onClick={() => {
                  setTab(name);
                  setPage(1);
                  setSearch("");
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition-all ${
                  tab === name
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {name}
              </button>
            ),
          )}
        </div>
        <ReportTable
          title={`Top ${tab}`}
          type={tab}
          report={report}
          search={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          sort={sort}
          direction={direction}
          onSort={(key) => {
            if (sort === key)
              setDirection((d) => (d === "desc" ? "asc" : "desc"));
            else {
              setSort(key);
              setDirection("desc");
            }
          }}
          page={page}
          onPage={setPage}
          onOpen={(url) => window.open(url, "_blank")}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 admin-surface p-6 sm:p-7 rounded-3xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h2 className="text-lg font-black font-outfit text-zinc-950 dark:text-white">
              Content Performance
            </h2>
            <div className="flex gap-1 rounded-full border border-zinc-200/80 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              {["courses", "chapters", "articles"].map((name) => (
                <button
                  key={name}
                  onClick={() => setContentTab(name)}
                  className={`rounded-full px-3.5 py-1 text-xs font-bold capitalize transition-all ${
                    contentTab === name
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {content?.content?.[contentTab]?.slice(0, 10).map((item, index) => (
              <a
                key={item.id}
                href={`https://asif.to${item.path}`}
                target="_blank"
                className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 rounded-2xl p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-black text-zinc-500 dark:text-zinc-400">
                  {index + 1}
                </span>
                <span className="truncate text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </span>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                  {item.clicks} clicks
                </span>
                <span
                  className={`text-xs font-extrabold ${
                    item.growth >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {item.growth.toFixed(0)}%
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="admin-surface p-6 sm:p-7 rounded-3xl">
          <h2 className="mb-4 text-lg font-black font-outfit text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4">
            Traffic Sources
          </h2>
          <div className="space-y-3">
            {sources.slice(0, 12).map((source, index) => (
              <div
                key={`${source.source}-${source.referrer}-${index}`}
                className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-zinc-50/70 dark:bg-[#18181b]/60 border border-zinc-200/50 dark:border-zinc-800/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {source.source}
                  </p>
                  <p className="truncate text-[10px] font-medium text-zinc-400">
                    {source.medium}
                    {source.campaign ? ` · ${source.campaign}` : ""}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-black font-outfit text-zinc-950 dark:text-white">
                  {source.views}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-surface p-6 sm:p-7 rounded-3xl">
        <h2 className="mb-4 text-lg font-black font-outfit text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4">
          SEO Opportunities
        </h2>
        <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {content?.opportunities?.length ? (
            content.opportunities.slice(0, 18).map((item, index) => (
              <a
                key={`${item.page}-${item.type}-${index}`}
                href={item.page}
                target="_blank"
                className="rounded-2xl border border-zinc-200/80 bg-white p-4.5 transition-all hover:border-blue-500/60 hover:shadow-sm dark:border-zinc-800 dark:bg-[#18181b]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                      item.impact === "high"
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/50"
                    }`}
                  >
                    {item.type}
                  </span>
                  <ExternalLink size={13} className="text-zinc-400" />
                </div>
                <p className="mt-3 truncate text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {item.page}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {item.reason}
                </p>
              </a>
            ))
          ) : (
            <p className="text-xs sm:text-sm font-medium text-zinc-400 py-6">
              Opportunities appear after Search Console data is synced.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
