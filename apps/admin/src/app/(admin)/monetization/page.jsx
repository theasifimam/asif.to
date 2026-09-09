"use client";

import React from "react";
import {
  BadgeDollarSign,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Eye,
  Gauge,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TrendChart } from "../analytics/SimpleAnalyticsCharts";
import {
  useMonetization,
  Metric,
  Surface,
  number,
  percentage,
} from "./MonetizationContext";

export default function MonetizationOverviewPage() {
  const {
    days,
    live,
    settings,
    overview,
  } = useMonetization();

  const traffic = overview?.traffic || {};
  const adsense = overview?.adsense || {};
  const adsenseConnected = Boolean(adsense?.connected);

  return (
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
              ? number(overview.adsense?.metrics?.estimatedEarnings)
              : "Not connected"
          }
          source="AdSense"
          icon={BadgeDollarSign}
        />
        <Metric
          label="Page RPM"
          value={
            adsenseConnected
              ? number(overview.adsense?.metrics?.pageRpm)
              : "Not connected"
          }
          source="AdSense"
          icon={BarChart3}
        />
        <Metric
          label="Impressions / CTR"
          value={
            adsenseConnected
              ? `${number(overview.adsense?.metrics?.impressions)} / ${percentage(overview.adsense?.metrics?.ctr)}`
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
          title="Ad blocker impact"
          description="Estimated based on first-party ping events."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric
              label="Block rate"
              value={percentage(traffic.estimatedAdBlockRatio)}
              source="Estimate"
            />
            <Metric
              label="Blocked views"
              value={number(traffic.estimatedBlockedViews)}
              source="Estimate"
            />
            <Metric
              label="Revenue risk"
              value={
                adsenseConnected
                  ? number(overview.adsense?.metrics?.blockedRevenueRisk)
                  : "Not connected"
              }
              source="AdSense"
            />
          </div>
        </Surface>

        <Surface
          title="Readiness diagnostics"
          description="Core checks verifying platform configuration health."
        >
          <div className="space-y-2">
            {[
              {
                title: "Environment switch",
                status: settings?.environment?.masterEnabled,
                detail: settings?.environment?.masterEnabled
                  ? "Master switch enabled"
                  : "Master switch disabled",
              },
              {
                title: "Database switch",
                status: settings?.adsEnabled,
                detail: settings?.adsEnabled
                  ? "Active in database"
                  : "Inactive in database",
              },
              {
                title: "AdSense Client ID",
                status: Boolean(settings?.adsenseClientId),
                detail: settings?.adsenseClientId || "Not configured",
              },
            ].map((diag, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <div className="flex items-center gap-2">
                  {diag.status ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <CircleAlert className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-xs font-bold">{diag.title}</span>
                </div>
                <span className="font-mono text-xs text-zinc-500">
                  {diag.detail}
                </span>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </>
  );
}
