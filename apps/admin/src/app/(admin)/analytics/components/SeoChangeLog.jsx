"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { analyticsApi } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { n, one, unwrap } from "./AnalyticsUI";

const TYPES = ["title", "description", "content", "internal-links", "technical", "other"];
const signed = (value, digits = 0) => `${value > 0 ? "+" : ""}${(Number(value) || 0).toFixed(digits)}`;
const tone = (value, inverse = false) =>
  !value ? "text-zinc-500" : (inverse ? value < 0 : value > 0) ? "text-emerald-600" : "text-red-600";

/**
 * Log of deliberate on-page SEO changes. Each entry stores the page's
 * search performance for the 28 days before the change; once 7+ days of final
 * Search Console data exist the "after" figures are compared per day.
 */
export default function SeoChangeLog() {
  const [changes, setChanges] = useState([]);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [changeType, setChangeType] = useState("title");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await analyticsApi.seoChanges();
    if (response.success) setChanges(unwrap(response) || []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    const response = await analyticsApi.createSeoChange({ url, note, changeType });
    setSaving(false);
    if (!response.success) return toast.error(response.error || "Could not save the change.");
    toast.success("Change logged with its 28-day baseline");
    setUrl("");
    setNote("");
    load();
  };

  const remove = async (id) => {
    const response = await analyticsApi.deleteSeoChange(id);
    if (response.success) load();
    else toast.error(response.error || "Could not delete the entry.");
  };

  const exportCsv = () =>
    downloadCsv(
      "seo-change-log.csv",
      [
        { label: "Page", value: (c) => c.path },
        { label: "Changed", value: (c) => new Date(c.changedAt).toISOString().slice(0, 10) },
        { label: "Type", value: (c) => c.changeType },
        { label: "Note", value: (c) => c.note },
        { label: "Baseline impressions (28d)", value: (c) => c.baseline?.impressions },
        { label: "Baseline clicks (28d)", value: (c) => c.baseline?.clicks },
        { label: "Baseline position", value: (c) => c.baseline?.position?.toFixed(1) },
        { label: "After days", value: (c) => c.after?.days },
        { label: "After impressions", value: (c) => c.after?.impressions },
        { label: "After clicks", value: (c) => c.after?.clicks },
        { label: "After position", value: (c) => c.after?.position?.toFixed(1) },
        { label: "Impressions/day change %", value: (c) => c.comparison?.impressionsPerDayChangePct?.toFixed(1) },
        { label: "Clicks/day change %", value: (c) => c.comparison?.clicksPerDayChangePct?.toFixed(1) },
        { label: "Position change (+ is worse)", value: (c) => c.comparison?.positionChange?.toFixed(1) },
      ],
      changes,
    );

  return (
    <section className="admin-surface overflow-x-auto rounded-[28px] sm:rounded-[32px]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 p-6 dark:border-zinc-800/80">
        <div>
          <h2 className="text-lg font-black font-outfit text-zinc-950 dark:text-white">SEO change log</h2>
          <p className="mt-1 text-xs text-zinc-500">Log each page you change. The 28 days before are saved as the baseline; results appear after 7+ days of final Search Console data (it lags about 3 days).</p>
        </div>
        <button type="button" onClick={exportCsv} disabled={!changes.length} className="h-9 shrink-0 rounded-full border border-zinc-200 px-4 text-xs font-black disabled:opacity-40 dark:border-zinc-800">Export CSV</button>
      </div>
      <form onSubmit={submit} className="flex flex-wrap items-center gap-2 border-b border-zinc-100 p-4 dark:border-zinc-800/80">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Page URL or path, e.g. /articles/my-post" className="h-9 min-w-64 flex-1 rounded-full border border-zinc-200 bg-white px-4 text-xs dark:border-zinc-800 dark:bg-[#121215]" />
        <select value={changeType} onChange={(e) => setChangeType(e.target.value)} className="h-9 rounded-full border border-zinc-200 bg-white px-3 text-xs font-bold dark:border-zinc-800 dark:bg-[#121215]" aria-label="Change type">
          {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="What changed?" className="h-9 min-w-48 flex-1 rounded-full border border-zinc-200 bg-white px-4 text-xs dark:border-zinc-800 dark:bg-[#121215]" />
        <button type="submit" disabled={saving || !url.trim()} className="h-9 rounded-full bg-blue-600 px-4 text-xs font-black text-white disabled:opacity-50">Log change</button>
      </form>
      <table className="min-w-full text-left text-xs">
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {changes.map((c) => (
            <tr key={c._id}>
              <td className="max-w-xs truncate px-6 py-3 font-semibold" title={c.path}>{c.path}<div className="font-normal text-zinc-500">{c.changeType}{c.note ? ` · ${c.note}` : ""}</div></td>
              <td className="px-6 py-3 tabular-nums text-zinc-500">{new Date(c.changedAt).toLocaleDateString()}</td>
              <td className="px-6 py-3 tabular-nums">{n(c.baseline?.impressions)} impr · pos {one(c.baseline?.position)}<div className="text-zinc-400">before (28d)</div></td>
              {c.after ? (
                <>
                  <td className="px-6 py-3 tabular-nums">{n(c.after.impressions)} impr · pos {one(c.after.position)}<div className="text-zinc-400">after ({c.after.days}d)</div></td>
                  <td className="px-6 py-3 tabular-nums">
                    <span className={tone(c.comparison.impressionsPerDayChangePct)}>{signed(c.comparison.impressionsPerDayChangePct)}% impr/day</span>
                    <div><span className={tone(c.comparison.clicksPerDayChangePct)}>{signed(c.comparison.clicksPerDayChangePct)}% clicks/day</span>{c.comparison.positionChange !== 0 && <span className={`ml-2 ${tone(c.comparison.positionChange, true)}`}>pos {signed(c.comparison.positionChange, 1)}</span>}</div>
                  </td>
                </>
              ) : (
                <td className="px-6 py-3 text-zinc-400" colSpan={2}>Not enough data yet</td>
              )}
              <td className="px-6 py-3 text-right"><button type="button" onClick={() => remove(c._id)} className="text-[10px] font-black uppercase text-zinc-400 hover:text-red-600">Delete</button></td>
            </tr>
          ))}
          {!changes.length && <tr><td className="px-6 py-8 text-center text-zinc-400">No changes logged yet.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
