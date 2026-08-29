"use client";
import LogoLoader from "@/components/ui/LogoLoader";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { analyticsApi } from "@/lib/api";
import AnalyticsShell from "../AnalyticsShell";
import AnalyticsChart from "../AnalyticsChart";
import MetricCard from "../MetricCard";
import { RangeControls, useAnalyticsRange } from "../useAnalyticsRange";
import { getFullCountryName } from "@/lib/countryNames";

const number = (value) => Math.round(Number(value) || 0).toLocaleString();
const seconds = (value) => `${Math.round(Number(value) || 0)}s`;
export default function AudiencePage() {
  const controls = useAnalyticsRange(28);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");
  const [realtime, setRealtime] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    const response = await analyticsApi.ga4(controls.range);
    if (response.success) {
      setData(response.data.data);
      setError("");
    } else setError(response.error);
    setLoading(false);
  }, [controls.range]);
  useEffect(() => {
    load();
  }, [load]); // eslint-disable-line react-hooks/set-state-in-effect
  const loadRealtime = useCallback(async () => {
    const response = await analyticsApi.realtime();
    if (response.success) setRealtime(response.data.data);
  }, []);
  useEffect(() => {
    if (tab !== "Realtime") return;
    loadRealtime();
    const timer = setInterval(loadRealtime, 60000);
    return () => clearInterval(timer);
  }, [tab, loadRealtime]); // eslint-disable-line react-hooks/set-state-in-effect
  const metrics = data?.summary || {};
  return (
    <AnalyticsShell
      eyebrow="GA4 · Visitor behavior"
      title="Audience"
      description="What visitors do after arriving on asif.to. Historical reports are cached for 15 minutes; realtime refreshes once per minute."
      actions={
        <RangeControls
          {...controls}
          onSelect={controls.select}
          onRange={controls.setRange}
        />
      }
    >
      <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl bg-zinc-100/80 p-1 dark:bg-zinc-900/80">
        {["Overview", "Acquisition", "Visitors", "Realtime", "Events"].map(
          (name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${tab === name ? "bg-white text-blue-600 shadow-md dark:bg-zinc-950" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
            >
              {name}
            </button>
          ),
        )}
      </div>
      {loading && (
        <div className="grid min-h-72 place-items-center">
          <LogoLoader className=" text-blue-600"  />
        </div>
      )}
      {error && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle />
          <div>
            <strong>GA4 data is unavailable.</strong>
            <p>{error}</p>
          </div>
          <button onClick={load} className="ml-auto">
            <RefreshCw />
          </button>
        </div>
      )}
      {!loading && !error && tab === "Overview" && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Active users"
              value={number(metrics.activeUsers)}
              source="GA4"
              change={data?.changes?.activeUsers}
            />
            <MetricCard
              label="New users"
              value={number(metrics.newUsers)}
              source="GA4"
              change={data?.changes?.newUsers}
              tone="violet"
            />
            <MetricCard
              label="Sessions"
              value={number(metrics.sessions)}
              source="GA4"
              change={data?.changes?.sessions}
              tone="teal"
            />
            <MetricCard
              label="Page views"
              value={number(metrics.screenPageViews)}
              source="GA4"
              change={data?.changes?.screenPageViews}
              tone="amber"
            />
            <MetricCard
              label="Avg engagement"
              value={seconds(metrics.averageEngagementTime)}
              source="GA4"
            />
            <MetricCard
              label="Engaged sessions"
              value={number(metrics.engagedSessions)}
              source="GA4"
              change={data?.changes?.engagedSessions}
              tone="violet"
            />
            <MetricCard
              label="Engagement rate"
              value={`${(Number(metrics.engagementRate || 0) * 100).toFixed(1)}%`}
              source="GA4"
              change={data?.changes?.engagementRate}
              tone="teal"
            />
          </section>
          <AnalyticsChart
            data={data?.trend || []}
            active={{
              activeUsers: true,
              sessions: true,
              screenPageViews: true,
            }}
          />
        </>
      )}
      {!loading && !error && tab === "Acquisition" && (
        <DataTable
          columns={[
            "Channel",
            "Source / medium",
            "Users",
            "Sessions",
            "Engagement",
          ]}
          rows={(data?.acquisition || []).map((r) => [
            r.channel,
            r.sourceMedium,
            number(r.activeUsers),
            number(r.sessions),
            `${(r.engagementRate * 100).toFixed(1)}%`,
          ])}
        />
      )}
      {!loading && !error && tab === "Visitors" && (
        <div className="grid gap-6 xl:grid-cols-3">
          <Rank
            title="Countries"
            rows={data?.audience?.countries}
            field="country"
          />
          <Rank title="Devices" rows={data?.audience?.devices} field="device" />
          <Rank
            title="Browsers"
            rows={data?.audience?.browsers}
            field="browser"
          />
        </div>
      )}
      {!loading && !error && tab === "Realtime" && (
        <>
          <MetricCard
            label="Active users now"
            value={number(realtime?.activeUsers)}
            source="GA4 realtime"
          />
          <DataTable
            columns={["Current page", "Country", "Device", "Users"]}
            rows={(realtime?.rows || []).map((r) => [
              r.page || "(not set)",
              r.country ? getFullCountryName(r.country) : "(not set)",
              r.device,
              number(r.activeUsers),
            ])}
          />
        </>
      )}
      {!loading && !error && tab === "Events" && (
        <DataTable
          columns={["Event", "Event count", "Users"]}
          rows={(data?.events || []).map((r) => [
            r.eventName,
            number(r.eventCount),
            number(r.totalUsers),
          ])}
          empty="No GA4 events exist for this period."
        />
      )}
    </AnalyticsShell>
  );
}
function Rank({ title, rows = [], field }) {
  const total = rows.reduce((sum, row) => sum + row.activeUsers, 0);
  return (
    <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-5 font-black tracking-tight">{title}</h2>
      <div className="space-y-4">
        {rows.length ? (
          rows.map((row) => {
            const percent = total ? (row.activeUsers / total) * 100 : 0;
            const displayName =
              field === "country"
                ? getFullCountryName(row[field])
                : row[field] || "(not set)";
            return (
              <div key={row[field]} className="text-sm">
                <div className="mb-1.5 flex justify-between gap-3">
                  <span className="truncate font-medium">{displayName}</span>
                  <strong className="tabular-nums">
                    {percent.toFixed(1)}%
                  </strong>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-900">
                  <div
                    className="h-full min-w-1 rounded-full bg-blue-600"
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-zinc-400">No data for this period.</p>
        )}
      </div>
    </section>
  );
}
function DataTable({ columns, rows, empty = "No data for this period." }) {
  return (
    <div className="admin-surface overflow-x-auto rounded-[28px] sm:rounded-4xl">
      <table className="admin-table min-w-full text-left text-sm">
        <thead className="bg-zinc-50/75 dark:bg-[#18181b]/60 border-b border-zinc-100 dark:border-zinc-800/80">
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="px-6 py-4.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {rows.length ? (
            rows.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`max-w-sm truncate px-6 py-4.5 ${
                      j === 0
                        ? "font-bold font-outfit text-zinc-950 dark:text-white"
                        : "tabular-nums font-semibold text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="p-16 text-center text-xs font-semibold text-zinc-400"
              >
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
