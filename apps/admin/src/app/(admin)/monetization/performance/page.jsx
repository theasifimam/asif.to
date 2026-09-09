"use client";

import React from "react";
import { TrendChart } from "../../analytics/SimpleAnalyticsCharts";
import {
  useMonetization,
  Metric,
  Surface,
  SimpleTable,
  number,
  percentage,
} from "../MonetizationContext";

export default function PerformancePage() {
  const { performance } = useMonetization();
  const adsense = performance?.adsense || {};
  const isConnected = Boolean(adsense?.connected);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Revenue"
          value={
            isConnected
              ? number(adsense.metrics?.estimatedEarnings)
              : "Not connected"
          }
          source="AdSense"
        />
        <Metric
          label="Page RPM"
          value={
            isConnected
              ? number(adsense.metrics?.pageRpm)
              : "Not connected"
          }
          source="AdSense"
        />
        <Metric
          label="Impressions"
          value={
            isConnected
              ? number(adsense.metrics?.impressions)
              : "Not connected"
          }
          source="AdSense"
        />
        <Metric
          label="CTR"
          value={
            isConnected
              ? percentage(adsense.metrics?.ctr)
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
              performance?.businessMetrics?.revenuePerThousandOwnedPageViews == null
                ? "Not connected"
                : number(
                    performance.businessMetrics.revenuePerThousandOwnedPageViews
                  )
            }
            source="AdSense + Owned"
          />
          <Metric label="CLS" value="Not tracked" source="Web vitals" />
          <Metric label="LCP" value="Not tracked" source="Web vitals" />
        </div>
      </Surface>
    </>
  );
}
