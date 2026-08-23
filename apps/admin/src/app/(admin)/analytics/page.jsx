"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Eye,
  Globe2,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Search,
  Users,
  Waypoints,
} from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyticsApi } from "@/lib/api";
import AnalyticsNav from "./AnalyticsNav";
import AnalyticsDataTable from "./AnalyticsDataTable";
import {
  DonutChart,
  HorizontalBarChart,
  TrendChart,
} from "./SimpleAnalyticsCharts";
import ReportTable from "./ReportTable";

// ASIF_SIMPLE_ANALYTICS_V1
const PRESETS = [
  ["7 days", 7],
  ["28 days", 28],
  ["3 months", 90],
  ["6 months", 180],
  ["12 months", 365],
];

const unwrap = (response) => response?.data?.data;

function dates(days) {
  const end = new Date();
  const start = new Date();

  start.setDate(end.getDate() - days + 1);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function number(value) {
  return Math.round(Number(value) || 0).toLocaleString();
}

function seconds(value) {
  const amount = Number(value) || 0;

  if (amount < 60) {
    return `${Math.round(amount)}s`;
  }

  const minutes = Math.floor(amount / 60);
  const remainder = Math.round(amount % 60);

  return `${minutes}m ${remainder}s`;
}

function changeText(change) {
  const value = Number(change) || 0;

  if (!Number.isFinite(value)) return "—";

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function StatCard({ icon: Icon, label, value, change, help }) {
  const positive = Number(change) >= 0;

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white p-3.5 sm:p-4 dark:border-zinc-800 dark:bg-[#121215] flex flex-col justify-between min-h-[120px] sm:min-h-0">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <Icon className="h-4 w-4" />
        </span>

        {change !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 sm:py-1 text-[9px] font-black ${
              positive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
            }`}
          >
            {changeText(change)}
          </span>
        )}
      </div>

      <div>
        <div className="mt-3 text-xl sm:text-2xl font-black tracking-tight">{value}</div>

        <div className="mt-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-300">
          {label}
        </div>

        {help && (
          <p className="mt-1 text-[9.5px] leading-3 text-zinc-400 hidden xs:block">{help}</p>
        )}
      </div>
    </div>
  );
}

function Section({ eyebrow, title, description, children, action }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950 dark:text-white">
            {title}
          </h2>

          {description && (
            <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(28);
  const range = useMemo(() => dates(days), [days]);

  const [overview, setOverview] = useState(null);
  const [devices, setDevices] = useState([]);

  const [acquisitionDimension, setAcquisitionDimension] = useState("source");
  const [acquisitionPage, setAcquisitionPage] = useState(1);
  const [acquisition, setAcquisition] = useState(null);

  const [contentPage, setContentPage] = useState(1);
  const [content, setContent] = useState(null);

  const [locationDimension, setLocationDimension] = useState("timezone");
  const [locationPage, setLocationPage] = useState(1);
  const [locations, setLocations] = useState(null);

  const [searchType, setSearchType] = useState("queries");
  const [searchPage, setSearchPage] = useState(1);
  const [searchReport, setSearchReport] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadOverview = useCallback(async () => {
    const [overviewResponse, deviceResponse] = await Promise.all([
      analyticsApi.simpleOverview(range),
      analyticsApi.devices(range),
    ]);

    if (overviewResponse.success) {
      setOverview(unwrap(overviewResponse));
    }

    if (deviceResponse.success) {
      setDevices(unwrap(deviceResponse)?.rows || []);
    }
  }, [range]);

  const loadAcquisition = useCallback(async () => {
    const response = await analyticsApi.acquisition({
      ...range,
      dimension: acquisitionDimension,
      page: acquisitionPage,
      limit: 15,
    });

    if (response.success) {
      setAcquisition(unwrap(response));
    }
  }, [range, acquisitionDimension, acquisitionPage]);

  const loadContent = useCallback(async () => {
    const response = await analyticsApi.localContent({
      ...range,
      page: contentPage,
      limit: 15,
    });

    if (response.success) {
      setContent(unwrap(response));
    }
  }, [range, contentPage]);

  const loadLocations = useCallback(async () => {
    const response = await analyticsApi.locations({
      ...range,
      dimension: locationDimension,
      page: locationPage,
      limit: 15,
    });

    if (response.success) {
      setLocations(unwrap(response));
    }
  }, [range, locationDimension, locationPage]);

  const loadSearch = useCallback(async () => {
    const response = await analyticsApi.search(searchType, {
      ...range,
      search: searchText,
      sort: "clicks",
      direction: "desc",
      page: searchPage,
      limit: 15,
    });

    if (response.success) {
      setSearchReport(unwrap(response));
    }
  }, [range, searchType, searchText, searchPage]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      await Promise.all([
        loadOverview(),
        loadAcquisition(),
        loadContent(),
        loadLocations(),
        loadSearch(),
      ]);

      if (active) {
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [loadOverview, loadAcquisition, loadContent, loadLocations, loadSearch]);

  const changeRange = (nextDays) => {
    setDays(nextDays);
    setAcquisitionPage(1);
    setContentPage(1);
    setLocationPage(1);
    setSearchPage(1);
  };

  const sync = async () => {
    setSyncing(true);

    const response = await analyticsApi.sync();

    if (!response.success) {
      setSyncing(false);
      toast.error(response.error);
      return;
    }

    toast.success("Search Console sync started");

    setTimeout(async () => {
      await Promise.all([loadOverview(), loadSearch()]);
      setSyncing(false);
    }, 2500);
  };

  if (loading && !overview) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const metrics = overview?.metrics || {};
  const metric = (key) =>
    metrics[key] || {
      value: 0,
      change: 0,
    };

  const sourceLabel =
    acquisitionDimension === "source"
      ? "Source"
      : acquisitionDimension === "referrer"
        ? "Referrer domain"
        : "Campaign";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-3.5 font-sans sm:gap-9 sm:p-6 md:p-8 lg:p-10 text-zinc-800 dark:text-zinc-300">
      <AnalyticsNav />

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            asif.to performance
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Understand the site at a glance
          </h1>

          <p className="mt-1.5 max-w-3xl text-xs sm:text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            First-party asif.to traffic explains people, sources, content,
            devices and location. Search Console explains how Google Search is
            performing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(days)}
            onValueChange={(val) => changeRange(Number(val))}
          >
            <SelectTrigger className="h-10 w-36 rounded-full border-zinc-200/80 bg-white text-xs font-bold dark:border-zinc-800 dark:bg-[#121215]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800">
              {PRESETS.map(([label, value]) => (
                <SelectItem
                  key={value}
                  value={String(value)}
                  className="cursor-pointer rounded-xl text-xs font-bold"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={sync}
            disabled={syncing}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-black text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing" : "Sync Search"}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 lg:gap-3">
        <StatCard
          icon={Users}
          label="Visitors"
          value={number(metric("visitors").value)}
          change={metric("visitors").change}
          help="Unique first-party visitors."
        />

        <StatCard
          icon={Eye}
          label="Page views"
          value={number(metric("pageViews").value)}
          change={metric("pageViews").change}
          help="Pages actually opened on asif.to."
        />

        <StatCard
          icon={Waypoints}
          label="Sessions"
          value={number(metric("sessions").value)}
          change={metric("sessions").change}
          help="Separate browsing sessions."
        />

        <StatCard
          icon={Clock3}
          label="Avg. time / view"
          value={seconds(metric("engagementTime").value)}
          change={metric("engagementTime").change}
          help="First-party engaged time."
        />

        <StatCard
          icon={MousePointerClick}
          label="Google clicks"
          value={number(metric("searchClicks").value)}
          change={metric("searchClicks").change}
          help="Clicks reported by Search Console."
        />

        <StatCard
          icon={Search}
          label="Search impressions"
          value={number(metric("searchImpressions").value)}
          change={metric("searchImpressions").change}
          help="Google Search appearances."
        />
      </section>

      <Section
        eyebrow="Performance over time"
        title="Are more people using asif.to?"
        description="The main trend graph uses first-party traffic, so you can see growth without mixing it with Search Console impressions."
      >
        <TrendChart
          data={overview?.trend || []}
          series={[
            { key: "visitors", label: "Visitors" },
            { key: "pageViews", label: "Page views" },
          ]}
          height={300}
        />
      </Section>

      <Section
        eyebrow="Acquisition"
        title="Where did visitors come from?"
        description="UTM tags take priority. Otherwise asif.to uses the external referrer domain provided by the browser and classifies common search engines, AI tools and social sites."
        action={
          <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
            {[
              ["source", "Sources"],
              ["referrer", "Referrers"],
              ["campaign", "Campaigns"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setAcquisitionDimension(value);
                  setAcquisitionPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                  acquisitionDimension === value
                    ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800"
                    : "text-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <HorizontalBarChart
              rows={acquisition?.chart || []}
              labelKey="key"
              valueKey="pageViews"
              valueLabel="views"
            />
          </div>

          <AnalyticsDataTable
            rows={acquisition?.rows || []}
            pagination={acquisition?.pagination}
            onPage={setAcquisitionPage}
            columns={[
              {
                key: "key",
                label: sourceLabel,
                render: (row) => (
                  <div>
                    <div className="max-w-60 truncate font-black text-zinc-800 dark:text-zinc-100">
                      {row.key || "Unknown"}
                    </div>
                    {row.extra && (
                      <div className="mt-0.5 text-[10px] font-semibold text-zinc-400">
                        {row.extra}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "visitors",
                label: "Visitors",
                render: (row) => number(row.visitors),
              },
              {
                key: "sessions",
                label: "Sessions",
                render: (row) => number(row.sessions),
              },
              {
                key: "pageViews",
                label: "Views",
                render: (row) => number(row.pageViews),
              },
              {
                key: "avgEngagement",
                label: "Avg. time",
                render: (row) => seconds(row.avgEngagement),
              },
            ]}
          />
        </div>

        <p className="text-[10px] leading-4 text-zinc-400">
          Native apps and privacy-restricted browsers may omit referrer
          information. Use UTM links when you need guaranteed campaign/app
          attribution.
        </p>
      </Section>

      <Section
        eyebrow="Content"
        title="What are people actually reading?"
        description="This is first-party usage, not Google impressions. It shows the pages visitors really opened."
      >
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <HorizontalBarChart
              rows={content?.chart || []}
              labelKey="path"
              valueKey="pageViews"
              valueLabel="views"
            />
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
                  <a
                    href={`https://asif.to${row.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block max-w-80 truncate font-black text-blue-600 hover:underline"
                    title={row.path}
                  >
                    {row.path}
                  </a>
                ),
              },
              {
                key: "visitors",
                label: "Visitors",
                render: (row) => number(row.visitors),
              },
              {
                key: "sessions",
                label: "Sessions",
                render: (row) => number(row.sessions),
              },
              {
                key: "pageViews",
                label: "Views",
                render: (row) => number(row.pageViews),
              },
              {
                key: "avgEngagement",
                label: "Avg. time",
                render: (row) => seconds(row.avgEngagement),
              },
            ]}
          />
        </div>
      </Section>

      <Section
        eyebrow="Audience"
        title="Where and how are people visiting?"
        description="Country is used when your CDN/proxy supplies a country header. Browser timezone remains available as a privacy-conscious location signal."
        action={
          <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
            {[
              ["timezone", "Time zones"],
              ["country", "Countries"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setLocationDimension(value);
                  setLocationPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                  locationDimension === value
                    ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800"
                    : "text-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <div className="mb-4 flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-black">
                Top{" "}
                {locationDimension === "country" ? "countries" : "time zones"}
              </h3>
            </div>

            <HorizontalBarChart
              rows={locations?.chart || []}
              labelKey="key"
              valueKey="visitors"
              valueLabel="visitors"
            />
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-[#121215]">
            <h3 className="mb-4 text-sm font-black">Device mix</h3>

            <DonutChart rows={devices} valueKey="pageViews" />
          </div>
        </div>

        <AnalyticsDataTable
          rows={locations?.rows || []}
          pagination={locations?.pagination}
          onPage={setLocationPage}
          columns={[
            {
              key: "key",
              label: locationDimension === "country" ? "Country" : "Time zone",
              render: (row) => (
                <span className="font-black text-zinc-800 dark:text-zinc-100">
                  {row.key}
                </span>
              ),
            },
            {
              key: "visitors",
              label: "Visitors",
              render: (row) => number(row.visitors),
            },
            {
              key: "sessions",
              label: "Sessions",
              render: (row) => number(row.sessions),
            },
            ...(locationDimension === "country"
              ? [
                  {
                    key: "pageViews",
                    label: "Views",
                    render: (row) => number(row.pageViews),
                  },
                ]
              : []),
          ]}
        />
      </Section>

      <Section
        eyebrow="Google Search"
        title="How is organic search performing?"
        description="Search Console stays separate so clicks and impressions are never confused with actual on-site visitors and page views."
        action={
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                overview?.sync?.status === "error"
                  ? "bg-rose-500"
                  : "bg-emerald-500"
              }`}
            />
            <span className="text-[10px] font-bold text-zinc-400">
              {overview?.sync?.lastSyncedAt
                ? `Synced ${new Date(
                    overview.sync.lastSyncedAt,
                  ).toLocaleDateString()}`
                : "No sync yet"}
            </span>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-black text-zinc-600 dark:text-zinc-300">
              Google clicks over time
            </h3>
            <TrendChart
              data={overview?.trend || []}
              series={[{ key: "clicks", label: "Clicks" }]}
              height={240}
            />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-black text-zinc-600 dark:text-zinc-300">
              Search impressions over time
            </h3>
            <TrendChart
              data={overview?.trend || []}
              series={[
                {
                  key: "impressions",
                  label: "Impressions",
                },
              ]}
              height={240}
            />
          </div>
        </div>

        <div className="flex w-fit rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
          {[
            ["queries", "Queries"],
            ["pages", "Pages"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSearchType(value);
                setSearchPage(1);
                setSearchText("");
              }}
              className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                searchType === value
                  ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800"
                  : "text-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ReportTable
          title={`Top ${searchType}`}
          type={searchType}
          report={searchReport}
          search={searchText}
          onSearch={(value) => {
            setSearchText(value);
            setSearchPage(1);
          }}
          sort="clicks"
          direction="desc"
          onSort={() => {}}
          page={searchPage}
          onPage={setSearchPage}
          onOpen={(url) => window.open(url, "_blank")}
        />
      </Section>
    </div>
  );
}
