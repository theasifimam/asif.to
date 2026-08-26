"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Clock3,
  Eye,
  Radio,
  RefreshCw,
  Timer,
  Users,
  Waypoints,
} from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { getFullCountryName } from "@/lib/countryNames";

import { TrendChart } from "../SimpleAnalyticsCharts";
import {
  MetricCard,
  Section,
  Pills,
  ErrorBox,
  Loading,
  ClientTable,
  unwrap,
  n,
  seconds,
  duration,
  ratioPct,
} from "./AnalyticsUI";

export default function Ga4Tab({ range }) {
  const [data, setData] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [error, setError] = useState("");
  const [realtimeError, setRealtimeError] = useState("");
  const [loading, setLoading] = useState(true);
  const [audienceType, setAudienceType] = useState("countries");

  const load = useCallback(async () => {
    setLoading(true);
    const response = await analyticsApi.ga4(range);
    if (response.success) {
      setData(unwrap(response));
      setError("");
    } else {
      setError(response.error || "GA4 data is unavailable.");
    }
    setLoading(false);
  }, [range]);

  const loadRealtime = useCallback(async () => {
    const response = await analyticsApi.realtime();
    if (response.success) {
      setRealtime(unwrap(response));
      setRealtimeError("");
    } else {
      setRealtimeError(response.error || "GA4 realtime data is unavailable.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadRealtime();
    const timer = setInterval(loadRealtime, 60000);
    return () => clearInterval(timer);
  }, [loadRealtime]);

  if (loading && !data) return <Loading />;

  const summary = data?.summary || {};
  const deltas = data?.changes || {};
  const audienceRows = data?.audience?.[audienceType] || [];

  const audienceColumns =
    audienceType === "countries"
      ? [
          {
            key: "country",
            label: "Country",
            render: (row) => (
              <strong>
                {getFullCountryName(row.country) || row.country || "(not set)"}
              </strong>
            ),
          },
          { key: "activeUsers", label: "Active users", render: (row) => n(row.activeUsers) },
          { key: "sessions", label: "Sessions", render: (row) => n(row.sessions) },
          { key: "screenPageViews", label: "Page views", render: (row) => n(row.screenPageViews) },
        ]
      : [
          {
            key: audienceType === "devices" ? "device" : "browser",
            label: audienceType === "devices" ? "Device" : "Browser",
            render: (row) => (
              <strong>
                {row[audienceType === "devices" ? "device" : "browser"] || "(not set)"}
              </strong>
            ),
          },
          { key: "activeUsers", label: "Active users", render: (row) => n(row.activeUsers) },
          { key: "sessions", label: "Sessions", render: (row) => n(row.sessions) },
        ];

  return (
    <div className="space-y-10">
      <ErrorBox>{error}</ErrorBox>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="Active users" value={n(summary.activeUsers)} delta={deltas.activeUsers} source="GA4" />
        <MetricCard icon={Users} label="New users" value={n(summary.newUsers)} delta={deltas.newUsers} source="GA4" />
        <MetricCard icon={Waypoints} label="Sessions" value={n(summary.sessions)} delta={deltas.sessions} source="GA4" />
        <MetricCard icon={Eye} label="Page views" value={n(summary.screenPageViews)} delta={deltas.screenPageViews} source="GA4" />
        <MetricCard icon={Activity} label="Engaged sessions" value={n(summary.engagedSessions)} delta={deltas.engagedSessions} source="GA4" />
        <MetricCard icon={BarChart3} label="Engagement rate" value={ratioPct(summary.engagementRate)} delta={deltas.engagementRate} source="GA4" />
        <MetricCard icon={Timer} label="Total engagement" value={duration(summary.userEngagementDuration)} delta={deltas.userEngagementDuration} source="GA4" />
        <MetricCard icon={Clock3} label="Avg. engagement / active user" value={seconds(summary.averageEngagementTime)} source="GA4" />
      </section>

      {/* 2-column: GA4 Traffic Trend (2/3 space) + GA4 Top Events (1/3 space) */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Section eyebrow="GA4 trend" title="GA4 traffic over time" description="Active users, sessions and page views from the GA4 Data API.">
          <TrendChart
            data={data?.trend || []}
            series={[
              { key: "activeUsers", label: "Active users" },
              { key: "sessions", label: "Sessions" },
              { key: "screenPageViews", label: "Page views" },
            ]}
            height={280}
          />
        </Section>

        <Section eyebrow="Events" title="GA4 events" description="Key actions triggered by users.">
          <ClientTable
            rows={data?.events || []}
            pageSize={6}
            columns={[
              { key: "eventName", label: "Event", render: (row) => <strong>{row.eventName || "(not set)"}</strong> },
              { key: "eventCount", label: "Count", render: (row) => n(row.eventCount) },
              { key: "totalUsers", label: "Users", render: (row) => n(row.totalUsers) },
            ]}
          />
        </Section>
      </div>

      <Section eyebrow="Pages" title="GA4 page performance" description="All page fields currently returned by your GA4 integration.">
        <ClientTable
          rows={data?.pages || []}
          columns={[
            { key: "pagePath", label: "Page", render: (row) => <a href={`https://asif.to${row.pagePath}`} target="_blank" rel="noreferrer" className="block max-w-72 truncate font-black text-blue-600 hover:underline">{row.pagePath}</a> },
            { key: "pageTitle", label: "Title", render: (row) => <span className="block max-w-72 truncate">{row.pageTitle || "—"}</span> },
            { key: "screenPageViews", label: "Page views", render: (row) => n(row.screenPageViews) },
            { key: "activeUsers", label: "Active users", render: (row) => n(row.activeUsers) },
            { key: "userEngagementDuration", label: "Total engagement", render: (row) => duration(row.userEngagementDuration) },
            { key: "averageEngagementTime", label: "Avg. engagement / view", render: (row) => seconds(row.averageEngagementTime) },
          ]}
        />
      </Section>

      {/* 2-column: Landing Pages + Acquisition side-by-side */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Section eyebrow="Landing pages" title="GA4 landing pages" description="Sessions, users and engagement where sessions began.">
          <ClientTable
            rows={data?.landingPages || []}
            pageSize={10}
            columns={[
              { key: "landingPage", label: "Landing page", render: (row) => <strong>{row.landingPage || "(not set)"}</strong> },
              { key: "sessions", label: "Sessions", render: (row) => n(row.sessions) },
              { key: "activeUsers", label: "Active users", render: (row) => n(row.activeUsers) },
              { key: "engagedSessions", label: "Engaged", render: (row) => n(row.engagedSessions) },
              { key: "engagementRate", label: "Eng. rate", render: (row) => ratioPct(row.engagementRate) },
            ]}
          />
        </Section>

        <Section eyebrow="Acquisition" title="GA4 acquisition" description="Channel group and source / medium metrics.">
          <ClientTable
            rows={data?.acquisition || []}
            pageSize={10}
            columns={[
              { key: "channel", label: "Channel", render: (row) => <strong>{row.channel || "(not set)"}</strong> },
              { key: "sourceMedium", label: "Source / medium", render: (row) => <span className="block max-w-44 truncate">{row.sourceMedium || "(not set)"}</span> },
              { key: "activeUsers", label: "Users", render: (row) => n(row.activeUsers) },
              { key: "sessions", label: "Sessions", render: (row) => n(row.sessions) },
              { key: "engagementRate", label: "Eng. rate", render: (row) => ratioPct(row.engagementRate) },
            ]}
          />
        </Section>
      </div>

      <Section
        eyebrow="Audience"
        title="GA4 countries, devices and browsers"
        description="These values belong only to GA4 and are never merged with first-party audience data."
        action={
          <Pills
            value={audienceType}
            onChange={setAudienceType}
            items={[
              ["countries", "Countries"],
              ["devices", "Devices"],
              ["browsers", "Browsers"],
            ]}
          />
        }
      >
        <ClientTable rows={audienceRows} columns={audienceColumns} />
      </Section>

      <Section
        eyebrow="Realtime"
        title="GA4 realtime"
        description="Current page, country, device and active-user rows. Refreshes every minute."
        action={
          <button
            type="button"
            onClick={loadRealtime}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-black text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        }
      >
        <ErrorBox>{realtimeError}</ErrorBox>
        <div className="grid gap-4 xl:grid-cols-[220px_1fr]">
          <MetricCard icon={Radio} label="Active users now" value={n(realtime?.activeUsers)} source="GA4 realtime" />
          <ClientTable
            rows={realtime?.rows || []}
            columns={[
              { key: "page", label: "Current page", render: (row) => row.page || "(not set)" },
              { key: "country", label: "Country", render: (row) => getFullCountryName(row.country) || row.country || "(not set)" },
              { key: "device", label: "Device", render: (row) => row.device || "(not set)" },
              { key: "activeUsers", label: "Active users", render: (row) => n(row.activeUsers) },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
