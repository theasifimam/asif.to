"use client";
import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import AnalyticsShell from "../AnalyticsShell";
import { RangeControls, useAnalyticsRange } from "../useAnalyticsRange";

const n = (v) => Math.round(Number(v) || 0).toLocaleString();
export default function ContentPage() {
  const controls = useAnalyticsRange(28); const [data,setData] = useState(null); const [error,setError] = useState(""); const [tab,setTab] = useState("Top pages");
  useEffect(() => { analyticsApi.ga4(controls.range).then((r) => r.success ? setData(r.data.data) : setError(r.error)); }, [controls.range]);
  let pages = data?.pages || []; if (tab === "Engagement") pages = [...pages].filter((p) => p.screenPageViews >= 5).sort((a,b) => b.averageEngagementTime-a.averageEngagementTime); if (tab === "Needs improvement") pages = [...pages].filter((p) => p.screenPageViews >= 20).sort((a,b) => a.averageEngagementTime-b.averageEngagementTime);
  return <AnalyticsShell eyebrow="GA4 · Author workspace" title="Content performance" description="Which pages attract visitors and hold their attention. Content types are not guessed from ambiguous URLs." actions={<RangeControls {...controls} onSelect={controls.select} onRange={controls.setRange}/>}>
    <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl bg-zinc-100/80 p-1 dark:bg-zinc-900/80">{["Top pages","Landing pages","Engagement","Needs improvement"].map((name) => <button key={name} onClick={() => setTab(name)} className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${tab===name?"bg-white text-blue-600 shadow-md dark:bg-zinc-950":"text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}>{name}</button>)}</div>
    {error && <p className="rounded-2xl bg-amber-50 p-4 text-amber-800">{error}</p>}
    {tab === "Landing pages" ? <Table headers={["Landing page","Sessions","Users","Engagement"]} rows={(data?.landingPages||[]).map((r)=>[r.landingPage,n(r.sessions),n(r.activeUsers),`${(r.engagementRate*100).toFixed(1)}%`])}/> : <Table headers={["Page","Title","Views","Users","Avg engagement"]} rows={pages.map((r)=>[r.pagePath,r.pageTitle||"Untitled",n(r.screenPageViews),n(r.activeUsers),`${Math.round(r.averageEngagementTime)}s`])}/>} 
  </AnalyticsShell>;
}
function Table({ headers, rows = [] }) {
  return (
    <div className="admin-surface overflow-x-auto rounded-[28px] sm:rounded-[32px]">
      <table className="admin-table min-w-full text-left text-sm">
        <thead className="bg-zinc-50/75 dark:bg-[#18181b]/60 border-b border-zinc-100 dark:border-zinc-800/80">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-6 py-4.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {rows.length ? (
            rows.map((r, i) => (
              <tr
                key={i}
                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
              >
                {r.map((v, j) => (
                  <td
                    key={j}
                    className={`max-w-md truncate px-6 py-4.5 ${
                      j === 0 ? "font-bold font-outfit text-zinc-950 dark:text-white" : "tabular-nums font-semibold text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="p-16 text-center text-xs font-semibold text-zinc-400">
                No content data for this period.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
