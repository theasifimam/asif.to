"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Eye,
  Gauge,
  MousePointerClick,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { monetizationApi } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendChart } from "../analytics/SimpleAnalyticsCharts";

const TABS = [
  "Overview",
  "Ad Controls",
  "Placements",
  "Performance",
  "Recommendations",
  "Settings",
];

const CONTENT_TYPES = [
  ["article", "Articles", "Long-form editorial content"],
  ["course", "Course chapters", "Published learning chapters"],
  ["cheatsheet", "Cheatsheets", "Reference and revision sheets"],
  ["interview", "Interview questions", "Individual question pages"],
];

const STATUS_STYLES = {
  Opportunity:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-200",
  Warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200",
  Healthy:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200",
  Experiment:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-200",
};

const number = (value) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });
const percentage = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;

function rangeFor(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function Surface({ title, description, action, children, className = "" }) {
  return (
    <section
      className={`rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#121215] sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h2 className="text-base font-black text-zinc-950 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Metric({ label, value, source, note, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-blue-500" />}
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
        {value}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold text-zinc-400">
        <span>{note || " "}</span>
        {source && (
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 uppercase dark:border-zinc-700">
            {source}
          </span>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </span>
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </label>
  );
}

export default function MonetizationPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user, "monetization.manage");
  const [tab, setTab] = useState("Overview");
  const [days, setDays] = useState(28);
  const range = useMemo(() => rangeFor(days), [days]);
  const [settings, setSettings] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [overview, setOverview] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [confirmEnable, setConfirmEnable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [
      settingsResult,
      placementsResult,
      overviewResult,
      performanceResult,
      recommendationsResult,
    ] = await Promise.all([
      monetizationApi.settings(),
      monetizationApi.placements(),
      monetizationApi.overview(range),
      monetizationApi.performance(range),
      monetizationApi.recommendations(range),
    ]);
    setLoading(false);
    const failed = [
      settingsResult,
      placementsResult,
      overviewResult,
      performanceResult,
      recommendationsResult,
    ].find((result) => !result.success);
    if (failed) {
      toast.error(failed.error || "Unable to load monetization data.");
      return;
    }
    setSettings(settingsResult.data?.data);
    setPlacements(placementsResult.data?.data || []);
    setOverview(overviewResult.data?.data);
    setPerformance(performanceResult.data?.data);
    setRecommendations(recommendationsResult.data?.data || []);
  }, [range]);

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const patchSettings = async (patch, successMessage) => {
    if (!canManage) return;
    setSaving("settings");
    const result = await monetizationApi.updateSettings(patch);
    setSaving("");
    if (!result.success) return toast.error(result.error);
    toast.success(successMessage || "Monetization settings updated.");
    await load();
  };

  const savePlacement = async (placement) => {
    if (!canManage) return;
    setSaving(placement.key);
    const result = await monetizationApi.updatePlacement(
      placement.key,
      placement,
    );
    setSaving("");
    if (!result.success) return toast.error(result.error);
    toast.success(`${placement.label} updated.`);
    await load();
  };

  const editPlacement = (key, patch) =>
    setPlacements((current) =>
      current.map((placement) =>
        placement.key === key ? { ...placement, ...patch } : placement,
      ),
    );

  if (loading && !settings) {
    return (
      <div className="p-8 text-sm text-zinc-500">
        Loading monetization controls…
      </div>
    );
  }

  const traffic = overview?.traffic || {};
  const adsenseConnected = Boolean(overview?.adsense?.connected);
  const live = Boolean(overview?.status?.live);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-3.5 pb-16 text-zinc-800 dark:text-zinc-200 sm:p-6 md:p-8 lg:p-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
            Business control center
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Monetization
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
            Control ad eligibility, placements, provider readiness, traffic
            context, and recommendations from one module.
          </p>
        </div>
        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${live ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500" : "bg-zinc-400"}`}
          />
          {live ? "ADS LIVE" : "ADS DISABLED"}
        </div>
      </header>

      <nav
        className="flex max-w-full min-w-0 gap-1 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-100/70 p-1 dark:border-zinc-800 dark:bg-zinc-900/70 custom-scrollbar"
        aria-label="Monetization sections"
      >
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${tab === item ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-950 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            {item}
          </button>
        ))}
      </nav>

      {(tab === "Overview" ||
        tab === "Performance" ||
        tab === "Recommendations") && (
        <div className="flex flex-wrap gap-2">
          {[7, 28, 90].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDays(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${days === value ? "bg-blue-600 text-white" : "border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}`}
            >
              {value} days
            </button>
          ))}
        </div>
      )}

      {tab === "Overview" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Ads status"
              value={live ? "Live" : "Disabled"}
              source="Runtime"
              icon={ShieldCheck}
              note={
                settings?.adsEnabled
                  ? "Database switch ON"
                  : "Database switch OFF"
              }
            />
            <Metric
              label="Active placements"
              value={number(overview?.activePlacements)}
              source="Config"
              icon={BadgeDollarSign}
              note={`${number(overview?.configuredPlacements)} with slot IDs`}
            />
            <Metric
              label="Page views"
              value={number(traffic.pageViews)}
              source="Owned"
              icon={Eye}
              note={`${days}-day range`}
            />
            <Metric
              label="Ad-eligible page views"
              value={number(traffic.adEligiblePageViews)}
              source="Estimate"
              icon={Gauge}
              note={`${percentage(traffic.adEligiblePageRatio)} of traffic`}
            />
            <Metric
              label="Estimated opportunities"
              value={number(traffic.estimatedAdOpportunities)}
              source="Estimate"
              icon={Sparkles}
              note="Route and placement based"
            />
            <Metric
              label="Revenue"
              value={
                adsenseConnected
                  ? number(overview.adsense.metrics.estimatedEarnings)
                  : "Not connected"
              }
              source="AdSense"
              icon={BadgeDollarSign}
            />
            <Metric
              label="Page RPM"
              value={
                adsenseConnected
                  ? number(overview.adsense.metrics.pageRpm)
                  : "Not connected"
              }
              source="AdSense"
              icon={BarChart3}
            />
            <Metric
              label="Impressions / CTR"
              value={
                adsenseConnected
                  ? `${number(overview.adsense.metrics.impressions)} / ${percentage(overview.adsense.metrics.ctr)}`
                  : "Not connected"
              }
              source="AdSense"
              icon={MousePointerClick}
            />
          </div>

          <Surface
            title="Performance trend"
            description="First-party page views and route/placement-based eligible page views. This is not AdSense impression data."
          >
            <TrendChart
              data={traffic.trend || []}
              series={[
                { key: "pageViews", label: "Page views", color: "#2563eb" },
                {
                  key: "adEligiblePageViews",
                  label: "Eligible page views",
                  color: "#10b981",
                },
              ]}
            />
          </Surface>

          <div className="grid gap-4 lg:grid-cols-2">
            <Surface
              title="Provider status"
              description="Reporting and serving readiness are kept separate."
            >
              <div className="space-y-3 text-sm">
                <StatusLine
                  label="Deployment master"
                  value={
                    settings?.environment?.masterEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                  good={settings?.environment?.masterEnabled}
                />
                <StatusLine
                  label="Database switch"
                  value={settings?.adsEnabled ? "Enabled" : "Disabled"}
                  good={settings?.adsEnabled}
                />
                <StatusLine
                  label="AdSense client ID"
                  value={
                    overview?.status?.clientIdConfigured
                      ? "Configured"
                      : "Not configured"
                  }
                  good={overview?.status?.clientIdConfigured}
                />
                <StatusLine
                  label="Approval state"
                  value={(
                    overview?.status?.approvalStatus || "not_configured"
                  ).replaceAll("_", " ")}
                  good={overview?.status?.approvalStatus === "approved"}
                />
                <StatusLine
                  label="Reporting API"
                  value={adsenseConnected ? "Connected" : "Not connected"}
                  good={adsenseConnected}
                />
              </div>
            </Surface>
            <Surface
              title="Monetization health"
              description="Available signals are correlations and readiness checks; they do not establish causation."
            >
              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="Avg engagement"
                  value={`${number(traffic.averageEngagementSeconds)}s`}
                  source="Owned"
                />
                <Metric
                  label="Pages / session"
                  value={number(traffic.pagesPerSession)}
                  source="Owned"
                />
                <Metric label="CLS" value="Not tracked" source="Web vitals" />
                <Metric label="LCP" value="Not tracked" source="Web vitals" />
              </div>
            </Surface>
          </div>
        </>
      )}

      {tab === "Ad Controls" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Surface
            title="Emergency control"
            description="Global OFF always wins and invalidates the runtime config cache immediately."
          >
            <ToggleRow
              label="Show ads on asif.to"
              description={
                live
                  ? "Serving is permitted by environment and database controls."
                  : "No AdSense slot is currently permitted to render."
              }
              checked={Boolean(settings?.adsEnabled)}
              disabled={!canManage || saving === "settings"}
              onChange={(checked) =>
                checked
                  ? setConfirmEnable(true)
                  : patchSettings({ adsEnabled: false }, "Global ads disabled.")
              }
            />
            {!settings?.environment?.masterEnabled && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                The deployment master switch is OFF. Database changes cannot
                make ads live until it is enabled.
              </div>
            )}
          </Surface>
          <Surface
            title="Content types"
            description="These switches apply before any individual placement rule."
          >
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {CONTENT_TYPES.map(([key, label, description]) => (
                <ToggleRow
                  key={key}
                  label={label}
                  description={description}
                  checked={settings?.contentTypes?.[key] !== false}
                  disabled={!canManage || saving === "settings"}
                  onChange={(checked) =>
                    patchSettings(
                      { contentTypes: { [key]: checked } },
                      `${label} ads ${checked ? "enabled" : "disabled"}.`,
                    )
                  }
                />
              ))}
            </div>
          </Surface>
          <Surface
            title="Preview mode"
            description="Shows reserved placement previews in this admin module only. It never requests Google ads or creates impressions."
          >
            <ToggleRow
              label="Preview placements"
              description="Render visual placeholders below the placement table."
              checked={Boolean(settings?.previewMode)}
              disabled={!canManage || saving === "settings"}
              onChange={(checked) =>
                patchSettings(
                  { previewMode: checked },
                  `Preview mode ${checked ? "enabled" : "disabled"}.`,
                )
              }
            />
          </Surface>
        </div>
      )}

      {tab === "Placements" && (
        <Surface
          title="AdSense placements"
          description="Slot IDs live here, not in page components. A placement cannot be enabled without a valid numeric slot ID."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                <tr>
                  {[
                    "Placement",
                    "Enabled",
                    "Slot ID",
                    "Content",
                    "Position",
                    "Min words",
                    "Max",
                    "Device",
                    "",
                  ].map((item) => (
                    <th key={item} className="px-2 py-3">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {placements.map((placement) => (
                  <tr key={placement.key}>
                    <td className="px-2 py-3">
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {placement.label}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                        {placement.key}
                        {placement.implementationStatus === "reserved"
                          ? " · Reserved"
                          : ""}
                      </p>
                    </td>
                    <td className="px-2 py-3">
                      <Switch
                        checked={Boolean(placement.enabled)}
                        disabled={
                          !canManage ||
                          placement.implementationStatus === "reserved"
                        }
                        onCheckedChange={(checked) =>
                          editPlacement(placement.key, { enabled: checked })
                        }
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        value={placement.slotId || ""}
                        disabled={!canManage}
                        onChange={(event) =>
                          editPlacement(placement.key, {
                            slotId: event.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="1234567890"
                        className="w-36 rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </td>
                    <td className="px-2 py-3">{placement.pageType}</td>
                    <td className="px-2 py-3 capitalize">
                      {placement.position}
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        value={placement.minWordCount}
                        disabled={!canManage}
                        onChange={(event) =>
                          editPlacement(placement.key, {
                            minWordCount: Number(event.target.value),
                          })
                        }
                        className="w-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="number"
                        min="1"
                        max="3"
                        value={placement.maxPerPage}
                        disabled={!canManage}
                        onChange={(event) =>
                          editPlacement(placement.key, {
                            maxPerPage: Number(event.target.value),
                          })
                        }
                        className="w-16 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </td>
                    <td className="px-2 py-3 capitalize">
                      {placement.deviceTargeting}
                    </td>
                    <td className="px-2 py-3">
                      <Button
                        size="sm"
                        disabled={!canManage || saving === placement.key}
                        onClick={() => savePlacement(placement)}
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {settings?.previewMode && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {placements.map((placement) => (
                <div
                  key={placement.key}
                  className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <div>
                    <p className="text-xs text-zinc-400">Advertisement</p>
                    <p className="mt-1 font-mono text-xs font-bold">
                      {placement.key}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-400">
                      {placement.enabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>
      )}

      {tab === "Performance" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Revenue"
              value={
                performance?.adsense?.connected
                  ? number(performance.adsense.metrics.estimatedEarnings)
                  : "Not connected"
              }
              source="AdSense"
            />
            <Metric
              label="Page RPM"
              value={
                performance?.adsense?.connected
                  ? number(performance.adsense.metrics.pageRpm)
                  : "Not connected"
              }
              source="AdSense"
            />
            <Metric
              label="Impressions"
              value={
                performance?.adsense?.connected
                  ? number(performance.adsense.metrics.impressions)
                  : "Not connected"
              }
              source="AdSense"
            />
            <Metric
              label="CTR"
              value={
                performance?.adsense?.connected
                  ? percentage(performance.adsense.metrics.ctr)
                  : "Not connected"
              }
              source="AdSense"
            />
          </div>
          <Surface
            title="Traffic and eligibility"
            description="Owned traffic is available now. Revenue and ad-unit performance will appear only after the official AdSense Reporting API is connected."
          >
            <TrendChart
              data={performance?.firstParty?.trend || []}
              series={[
                { key: "pageViews", label: "Page views" },
                {
                  key: "adEligiblePageViews",
                  label: "Eligible page views",
                  color: "#10b981",
                },
              ]}
            />
          </Surface>
          <div className="grid gap-4 lg:grid-cols-2">
            <Surface
              title="Top eligible pages"
              description="Estimated opportunities use active placement counts; they are not impressions."
            >
              <SimpleTable
                headers={["Page", "Views", "Opportunities"]}
                rows={(performance?.firstParty?.topEligiblePages || [])
                  .slice(0, 10)
                  .map((item) => [
                    item.path,
                    number(item.pageViews),
                    number(item.estimatedAdOpportunities),
                  ])}
                empty="No eligible page traffic in this range."
              />
            </Surface>
            <Surface
              title="Placement performance"
              description="Reliable revenue-by-placement requires AdSense reporting."
            >
              <SimpleTable
                headers={["Placement", "Status", "Reporting"]}
                rows={(performance?.placements || []).map((item) => [
                  item.label,
                  item.enabled ? "Enabled" : "Disabled",
                  item.reportingAvailable ? "Available" : "Not connected",
                ])}
                empty="No placements configured."
              />
            </Surface>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Surface
              title="Traffic by device"
              description="Viewport classes from first-party analytics; not AdSense device revenue."
            >
              <SimpleTable
                headers={["Device", "Page views"]}
                rows={(performance?.firstParty?.byDevice || []).map((item) => [
                  item.device,
                  number(item.pageViews),
                ])}
                empty="No device traffic in this range."
              />
            </Surface>
            <Surface
              title="Traffic by country"
              description="Country appears only when supplied by a trusted edge header; unknown traffic stays labelled."
            >
              <SimpleTable
                headers={["Country", "Page views"]}
                rows={(performance?.firstParty?.byCountry || []).map((item) => [
                  item.country,
                  number(item.pageViews),
                ])}
                empty="No country traffic in this range."
              />
            </Surface>
          </div>
          <Surface
            title="UX + revenue health"
            description="Possible correlations will be shown only when matching time-series data exists. No causation is inferred."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Engagement rate"
                value={
                  performance?.ga4?.available
                    ? percentage(performance.ga4.summary?.engagementRate)
                    : "Not available"
                }
                source="GA4"
              />
              <Metric
                label="Pages / session"
                value={number(performance?.firstParty?.pagesPerSession)}
                source="Owned"
              />
              <Metric
                label="Sessions"
                value={number(performance?.firstParty?.sessions)}
                source="Owned"
              />
              <Metric
                label="Browser identifiers"
                value={number(performance?.firstParty?.browserIdentifiers)}
                source="Owned"
                note="Not unique people"
              />
              <Metric
                label="Revenue / session"
                value={
                  performance?.businessMetrics?.revenuePerSession == null
                    ? "Not connected"
                    : number(performance.businessMetrics.revenuePerSession)
                }
                source="AdSense + Owned"
              />
              <Metric
                label="Revenue / 1K owned views"
                value={
                  performance?.businessMetrics
                    ?.revenuePerThousandOwnedPageViews == null
                    ? "Not connected"
                    : number(
                        performance.businessMetrics
                          .revenuePerThousandOwnedPageViews,
                      )
                }
                source="AdSense + Owned"
              />
              <Metric label="CLS" value="Not tracked" source="Web vitals" />
              <Metric label="LCP" value="Not tracked" source="Web vitals" />
            </div>
          </Surface>
        </>
      )}

      {tab === "Recommendations" && (
        <Surface
          title="Actionable recommendations"
          description="Deterministic rules use current settings and available traffic. Suggestions never change configuration automatically."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {recommendations.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className={`rounded-2xl border p-4 ${STATUS_STYLES[item.severity] || STATUS_STYLES.Experiment}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {item.severity}
                  </span>
                  <span className="text-[10px] font-bold opacity-70">
                    {item.category}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-black">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 opacity-90">
                  {item.reason}
                </p>
                <p className="mt-3 text-xs font-bold">
                  Recommendation: {item.action}
                </p>
              </article>
            ))}
          </div>
        </Surface>
      )}

      {tab === "Settings" && settings && (
        <>
          <Surface
            title="Content-density thresholds"
            description="These caps are conservative defaults. Saving does not enable ads or placements."
            action={
              <Button
                disabled={!canManage || saving === "settings"}
                onClick={() =>
                  patchSettings(
                    { contentRules: settings.contentRules },
                    "Content rules updated.",
                  )
                }
              >
                <Save className="h-4 w-4" />
                Save rules
              </Button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(settings.contentRules?.thresholds || []).map(
                (threshold, index) => (
                  <label
                    key={`${threshold.minWords}-${index}`}
                    className="rounded-2xl border border-zinc-200 p-3 text-xs font-bold dark:border-zinc-800"
                  >
                    Minimum words
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      value={threshold.minWords}
                      disabled={!canManage}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          contentRules: {
                            ...current.contentRules,
                            thresholds: current.contentRules.thresholds.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      minWords: Number(event.target.value),
                                    }
                                  : item,
                            ),
                          },
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <span className="mt-3 block">Maximum ads</span>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={threshold.maxAds}
                      disabled={!canManage}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          contentRules: {
                            ...current.contentRules,
                            thresholds: current.contentRules.thresholds.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      maxAds: Number(event.target.value),
                                    }
                                  : item,
                            ),
                          },
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  </label>
                ),
              )}
            </div>
            <label className="mt-4 block max-w-xs text-xs font-bold">
              Safety distance from interactive controls (px)
              <input
                type="number"
                min="100"
                max="1000"
                value={settings.contentRules?.safetyDistancePx || 240}
                disabled={!canManage}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    contentRules: {
                      ...current.contentRules,
                      safetyDistancePx: Number(event.target.value),
                    },
                  }))
                }
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
          </Surface>

          <Surface
            title="AdSense provider"
            description="The publisher/client ID is public but centrally validated. Reporting credentials are not stored here."
            action={
              <Button
                disabled={!canManage || saving === "settings"}
                onClick={() =>
                  patchSettings(
                    { adsense: settings.adsense },
                    "AdSense settings updated.",
                  )
                }
              >
                <Save className="h-4 w-4" />
                Save provider
              </Button>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-bold">
                Publisher/client ID
                <input
                  value={settings.adsense?.clientId || ""}
                  disabled={!canManage}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      adsense: {
                        ...current.adsense,
                        clientId: event.target.value.trim(),
                      },
                    }))
                  }
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
              <label className="text-xs font-bold">
                Approval state
                <select
                  value={settings.adsense?.approvalStatus || "not_configured"}
                  disabled={!canManage}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      adsense: {
                        ...current.adsense,
                        approvalStatus: event.target.value,
                      },
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {[
                    "not_configured",
                    "awaiting_approval",
                    "approved",
                    "action_required",
                  ].map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Surface>

          <Surface
            title="Future providers"
            description="Architecture is prepared, but unavailable providers do not expose fake controls."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["AdSense", "Affiliate", "Sponsorships", "House ads"].map(
                (provider, index) => (
                  <div
                    key={provider}
                    className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <p className="text-sm font-black">{provider}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {index === 0
                        ? "Active provider architecture"
                        : "Not configured"}
                    </p>
                  </div>
                ),
              )}
            </div>
          </Surface>
        </>
      )}

      {!canManage && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
          You have read-only monetization access. An administrator must approve
          configuration changes.
        </div>
      )}

      <Dialog open={confirmEnable} onOpenChange={setConfirmEnable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable global ads?</DialogTitle>
            <DialogDescription>
              This permits configured placements only when the deployment
              master, content type, placement, page eligibility, and consent
              layers also allow serving. No placement is enabled automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEnable(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setConfirmEnable(false);
                await patchSettings(
                  { adsEnabled: true },
                  "Global ads enabled.",
                );
              }}
            >
              Enable global ads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusLine({ label, value, good }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <span className="font-semibold">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold capitalize ${good ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}
      >
        {good ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <CircleAlert className="h-3.5 w-3.5" />
        )}
        {value}
      </span>
    </div>
  );
}

function SimpleTable({ headers, rows, empty }) {
  if (!rows.length)
    return (
      <p className="rounded-2xl bg-zinc-50 p-6 text-center text-xs text-zinc-500 dark:bg-zinc-950">
        {empty}
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-md text-left text-xs">
        <thead className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-2 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td
                  key={`${cellIndex}-${cell}`}
                  className={`px-2 py-3 ${cellIndex === 0 ? "max-w-xs truncate font-semibold" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
