"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { Loading, Pills, n, one, pct, unwrap } from "./AnalyticsUI";

const SORTS = {
  impressionsLoss: "Biggest impression loss",
  clicksLoss: "Biggest click loss",
  positionWorse: "Position got worse",
  impressionsGain: "Biggest impression gain",
  impressions: "Most impressions",
};

const SECTION_LABELS = {
  jobs: "Jobs",
  articles: "Articles",
  "interview-questions": "Interview questions",
  courses: "Courses & tutorials",
  other: "Other",
};

const signed = (value, digits = 0) => {
  const number = Number(value) || 0;
  const text = Math.abs(number).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  return `${number > 0 ? "+" : number < 0 ? "-" : ""}${text}`;
};
const tone = (value, inverse = false) => {
  if (!value) return "text-zinc-500";
  return (inverse ? value < 0 : value > 0) ? "text-emerald-600" : "text-red-600";
};

/**
 * Current vs previous period for pages or queries, including rows that
 * disappeared. Answers "where did we lose impressions / rank?".
 */
export default function SearchChanges({ range, refreshToken }) {
  const [type, setType] = useState("pages");
  const [section, setSection] = useState("");
  const [sort, setSort] = useState("impressionsLoss");
  const [result, setResult] = useState({ key: "", data: null, error: "" });
  const key = JSON.stringify([range, type, sort, section, refreshToken]);
  const loading = result.key !== key;
  const { data, error } = result;

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .searchChanges({ ...range, type, sort, section, limit: 200 })
      .then((response) => {
        if (cancelled) return;
        setResult(
          response.success
            ? { key, data: unwrap(response), error: "" }
            : { key, data: null, error: response.error || "Unable to load period comparison." },
        );
      });
    return () => {
      cancelled = true;
    };
  }, [key, range, type, sort, section]);

  const exportCsv = async () => {
    if (!data?.rows?.length) return;
    // The table is capped at 200 rows; the export pulls up to 5000.
    const full = await analyticsApi.searchChanges({ ...range, type, sort, section, limit: 5000 });
    const rows = full.success ? unwrap(full).rows : data.rows;
    downloadCsv(
      `search-changes-${type}-${range.start}_${range.end}.csv`,
      [
        { label: type === "pages" ? "Page" : "Query", value: (row) => row.key },
        { label: "Clicks", value: (row) => row.clicks },
        { label: "Previous clicks", value: (row) => row.previous.clicks },
        { label: "Impressions", value: (row) => row.impressions },
        { label: "Previous impressions", value: (row) => row.previous.impressions },
        { label: "Impressions change %", value: (row) => row.impressionsChangePct.toFixed(1) },
        { label: "CTR %", value: (row) => row.ctr.toFixed(2) },
        { label: "Previous CTR %", value: (row) => row.previous.ctr.toFixed(2) },
        { label: "Position", value: (row) => row.position.toFixed(1) },
        { label: "Previous position", value: (row) => row.previous.position.toFixed(1) },
        { label: "Position change (+ is worse)", value: (row) => row.positionChange.toFixed(1) },
        { label: "Lost (no current impressions)", value: (row) => (row.lost ? "yes" : "") },
      ],
      rows,
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Pills
          value={type}
          onChange={(value) => {
            setType(value);
            setSection("");
            if (value === "queries" && sort === "clicksLoss") setSort("impressionsLoss");
          }}
          items={[
            ["pages", "Pages"],
            ["queries", "Queries"],
          ]}
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-xs font-bold dark:border-zinc-800 dark:bg-[#121215]"
          aria-label="Sort changes"
        >
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {type === "pages" && (
          <select
            value={section}
            onChange={(event) => setSection(event.target.value)}
            className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-xs font-bold dark:border-zinc-800 dark:bg-[#121215]"
            aria-label="Filter by section"
          >
            <option value="">All sections</option>
            {Object.entries(SECTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={exportCsv}
          disabled={!data?.rows?.length}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-zinc-200 px-4 text-xs font-black disabled:opacity-40 dark:border-zinc-800"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {error && <p className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-800">{error}</p>}

      {type === "pages" && data?.sections && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:bg-zinc-900/60">
              <tr>
                {["Section", "Pages", "Clicks", "Impressions", "Impr. change", "Position"].map((label) => (
                  <th key={label} className="px-4 py-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {data.sections.map((row) => (
                <tr key={row.section}>
                  <td className="px-4 py-3 font-bold">{SECTION_LABELS[row.section]}</td>
                  <td className="px-4 py-3 tabular-nums">{n(row.pages)}</td>
                  <td className="px-4 py-3 tabular-nums">{n(row.clicks)} <span className={tone(row.clicksChangePct)}>({signed(row.clicksChangePct, 0)}%)</span></td>
                  <td className="px-4 py-3 tabular-nums">{n(row.impressions)}</td>
                  <td className={`px-4 py-3 tabular-nums font-bold ${tone(row.impressionsChangePct)}`}>{signed(row.impressionsChangePct, 0)}%</td>
                  <td className="px-4 py-3 tabular-nums">{one(row.position)} <span className="text-zinc-400">(was {one(row.previous.position)})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && !data ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:bg-zinc-900/60">
              <tr>
                {[type === "pages" ? "Page" : "Query", "Impressions", "Change", "Clicks", "CTR", "Position"].map((label) => (
                  <th key={label} className="px-4 py-3">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {(data?.rows || []).map((row) => (
                <tr key={row.key} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="max-w-md truncate px-4 py-3 font-semibold" title={row.key}>
                    {row.key}
                    {row.lost && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase text-red-700">lost</span>}
                    {row.isNew && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700">new</span>}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{n(row.impressions)} <span className="text-zinc-400">(was {n(row.previous.impressions)})</span></td>
                  <td className={`px-4 py-3 tabular-nums font-bold ${tone(row.impressionsChange)}`}>{signed(row.impressionsChange)}</td>
                  <td className="px-4 py-3 tabular-nums">{n(row.clicks)} <span className="text-zinc-400">(was {n(row.previous.clicks)})</span></td>
                  <td className="px-4 py-3 tabular-nums">{pct(row.ctr)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {row.impressions ? one(row.position) : "—"}
                    {row.positionChange !== 0 && <span className={`ml-1 ${tone(row.positionChange, true)}`}>({signed(row.positionChange, 1)})</span>}
                  </td>
                </tr>
              ))}
              {!loading && !data?.rows?.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400">No rows meet the minimum-impressions threshold for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-zinc-400">
        Compared with the previous period of equal length. Position change: positive means the average position got worse. Showing the top {data?.rows?.length || 0} of {data?.total || 0} rows; the CSV export includes up to 5,000.
      </p>
    </div>
  );
}
