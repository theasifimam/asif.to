"use client";

import { useEffect, useState } from "react";
import { Clock3, Eye, Globe2, Monitor, Users, Waypoints } from "lucide-react";
import { analyticsApi } from "@/lib/api";

import AnalyticsDataTable from "../AnalyticsDataTable";
import { DonutChart, HorizontalBarChart, TrendChart } from "../SimpleAnalyticsCharts";
import {
  MetricCard,
  Section,
  Pills,
  ErrorBox,
  Loading,
  Quality,
  unwrap,
  n,
  seconds,
} from "./AnalyticsUI";

export default function FirstPartyTab({ range }) {
  const [overview, setOverview] = useState(null);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [acqDimension, setAcqDimension] = useState("source");
  const [acqPage, setAcqPage] = useState(1);
  const [acquisition, setAcquisition] = useState(null);

  const [contentPage, setContentPage] = useState(1);
  const [content, setContent] = useState(null);

  const [locationDimension, setLocationDimension] = useState("country");
  const [locationPage, setLocationPage] = useState(1);
  const [locations, setLocations] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      analyticsApi.simpleOverview(range),
      analyticsApi.devices(range),
    ]).then(([overviewResponse, deviceResponse]) => {
      if (!active) return;
      if (overviewResponse.success) {
        setOverview(unwrap(overviewResponse));
        setError("");
      } else {
        setError(overviewResponse.error || "First-party analytics is unavailable.");
      }
      if (deviceResponse.success) {
        setDevices(unwrap(deviceResponse)?.rows || []);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [range]);

  useEffect(() => {
    let active = true;
    analyticsApi
      .acquisition({ ...range, dimension: acqDimension, page: acqPage, limit: 15 })
      .then((response) => {
        if (active && response.success) setAcquisition(unwrap(response));
      });
    return () => {
      active = false;
    };
  }, [range, acqDimension, acqPage]);

  useEffect(() => {
    let active = true;
    analyticsApi
      .localContent({ ...range, page: contentPage, limit: 15 })
      .then((response) => {
        if (active && response.success) setContent(unwrap(response));
      });
    return () => {
      active = false;
    };
  }, [range, contentPage]);

  useEffect(() => {
    let active = true;
    analyticsApi
      .locations({ ...range, dimension: locationDimension, page: locationPage, limit: 15 })
      .then((response) => {
        if (active && response.success) setLocations(unwrap(response));
      });
    return () => {
      active = false;
    };
  }, [range, locationDimension, locationPage]);

  if (loading && !overview) return <Loading />;

  const metrics = overview?.metrics || {};
  const metric = (key) => metrics[key] || { value: 0, change: 0 };
  const acquisitionLabel =
    acqDimension === "source" ? "Source" : acqDimension === "referrer" ? "Referrer" : "Campaign";

  return (
    <div className="space-y-10">
      <ErrorBox>{error}</ErrorBox>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Unique browsers"
          value={n(metric("visitors").value)}
          delta={metric("visitors").change}
          source="First-party"
          help="Distinct browser identifiers, not guaranteed unique people."
        />
        <MetricCard
          icon={Eye}
          label="Tracked page views"
          value={n(metric("pageViews").value)}
          delta={metric("pageViews").change}
          source="First-party"
        />
        <MetricCard
          icon={Waypoints}
          label="Sessions"
          value={n(metric("sessions").value)}
          delta={metric("sessions").change}
          source="First-party"
        />
        <MetricCard
          icon={Clock3}
          label="Observed time / view"
          value={seconds(metric("engagementTime").value)}
          delta={metric("engagementTime").change}
          source="First-party"
        />
      </section>

      <Quality data={overview?.quality} />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Section
          eyebrow="Captured trend"
          title="First-party traffic over time"
          description="Unique browsers, sessions, and page views."
        >
          <TrendChart
            data={overview?.trend || []}
            series={[
              { key: "visitors", label: "Unique browsers" },
              { key: "sessions", label: "Sessions" },
              { key: "pageViews", label: "Page views" },
            ]}
            height={280}
          />
        </Section>

        <Section
          eyebrow="Summary"
          title="Engagement overview"
          description="Key ratios for the selected period."
        >
          <div className="flex h-[calc(100%-2.5rem)] flex-col justify-between gap-3 rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500">Views per session</span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {metric("sessions").value
                    ? (
                        Number(metric("pageViews").value) /
                        Math.max(1, Number(metric("sessions").value))
                      ).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500">Sessions per browser</span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {metric("visitors").value
                    ? (
                        Number(metric("sessions").value) /
                        Math.max(1, Number(metric("visitors").value))
                      ).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500">Avg. time / view</span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">
                  {seconds(metric("engagementTime").value)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500">Tracker status</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed text-zinc-400">
              Direct telemetry from asif.to client.
            </p>
          </div>
        </Section>
      </div>

      <Section
        eyebrow="Acquisition"
        title="Captured acquisition data"
        description="Every acquisition dimension currently provided by your first-party API."
        action={
          <Pills
            value={acqDimension}
            onChange={(value) => {
              setAcqDimension(value);
              setAcqPage(1);
            }}
            items={[
              ["source", "Sources"],
              ["referrer", "Referrers"],
              ["campaign", "Campaigns"],
            ]}
          />
        }
      >
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <HorizontalBarChart rows={acquisition?.chart || []} labelKey="key" valueKey="pageViews" valueLabel="views" />
          </div>
          <AnalyticsDataTable
            rows={acquisition?.rows || []}
            pagination={acquisition?.pagination}
            onPage={setAcqPage}
            columns={[
              { key: "key", label: acquisitionLabel, render: (row) => <strong>{row.key || "Unknown"}</strong> },
              { key: "extra", label: "Medium", render: (row) => row.extra || "—" },
              { key: "visitors", label: "Unique browsers", render: (row) => n(row.visitors) },
              { key: "sessions", label: "Sessions", render: (row) => n(row.sessions) },
              { key: "pageViews", label: "Page views", render: (row) => n(row.pageViews) },
              { key: "avgEngagement", label: "Avg. time", render: (row) => seconds(row.avgEngagement) },
            ]}
          />
        </div>
      </Section>

      <Section eyebrow="Content" title="Captured page data" description="Every normalized path currently provided by the first-party content endpoint.">
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <HorizontalBarChart rows={content?.chart || []} labelKey="path" valueKey="pageViews" valueLabel="views" />
          </div>
          <AnalyticsDataTable
            rows={content?.rows || []}
            pagination={content?.pagination}
            onPage={setContentPage}
            columns={[
              {
                key: "path",
                label: "Page",
                render: (row) => (
                  <a href={`https://asif.to${row.path}`} target="_blank" rel="noreferrer" className="block max-w-80 truncate font-black text-blue-600 hover:underline">
                    {row.path}
                  </a>
                ),
              },
              { key: "visitors", label: "Unique browsers", render: (row) => n(row.visitors) },
              { key: "sessions", label: "Sessions", render: (row) => n(row.sessions) },
              { key: "pageViews", label: "Page views", render: (row) => n(row.pageViews) },
              { key: "avgEngagement", label: "Avg. time", render: (row) => seconds(row.avgEngagement) },
            ]}
          />
        </div>
      </Section>

      <Section
        eyebrow="Audience"
        title="Captured location and viewport data"
        description="First-party country data and browser timezone are separate; country is not taken from GA4 here."
        action={
          <Pills
            value={locationDimension}
            onChange={(value) => {
              setLocationDimension(value);
              setLocationPage(1);
            }}
            items={[
              ["country", "Countries"],
              ["timezone", "Time zones"],
            ]}
          />
        }
      >
        {locationDimension === "country" && <Quality data={locations?.quality} />}

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <div className="mb-4 flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-black">{locationDimension === "country" ? "Verified countries" : "Browser time zones"}</h3>
            </div>
            <HorizontalBarChart rows={locations?.chart || []} labelKey="key" valueKey="visitors" valueLabel="browsers" />
          </div>
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <div className="mb-4 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-black">Viewport mix</h3>
            </div>
            <DonutChart rows={devices} valueKey="pageViews" />
          </div>
        </div>

        <AnalyticsDataTable
          rows={locations?.rows || []}
          pagination={locations?.pagination}
          onPage={setLocationPage}
          columns={[
            { key: "key", label: locationDimension === "country" ? "Country" : "Time zone", render: (row) => <strong>{row.key || "Unknown"}</strong> },
            { key: "visitors", label: "Unique browsers", render: (row) => n(row.visitors) },
            { key: "sessions", label: "Sessions", render: (row) => n(row.sessions) },
            ...(locationDimension === "country"
              ? [{ key: "pageViews", label: "Page views", render: (row) => n(row.pageViews) }]
              : []),
          ]}
        />
      </Section>
    </div>
  );
}
