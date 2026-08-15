"use client";
import { useEffect, useMemo, useState } from "react";
import { analyticsApi } from "@/lib/api";
import AnalyticsShell from "../AnalyticsShell";
import { RangeControls, useAnalyticsRange } from "../useAnalyticsRange";

function pathOf(value) { try { const url = new URL(value,"https://asif.to"); return decodeURIComponent(url.pathname).replace(/\/$/,"")||"/"; } catch { return null; } }
export default function InsightsPage() {
  const controls=useAnalyticsRange(28); const [ga4,setGa4]=useState(null); const [search,setSearch]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{Promise.all([analyticsApi.ga4(controls.range),analyticsApi.content(controls.range)]).then(([a,b])=>{if(a.success)setGa4(a.data.data);else setError(a.error);if(b.success)setSearch(b.data.data);});},[controls.range]);
  const joined=useMemo(()=>{const map=new Map((ga4?.pages||[]).map(r=>[pathOf(r.pagePath),r])); const searchPages=[...(search?.content?.courses||[]),...(search?.content?.chapters||[]),...(search?.content?.articles||[])]; return searchPages.map(s=>({...s,ga:map.get(pathOf(s.path))})).filter(r=>r.ga);},[ga4,search]);
  const insights=useMemo(()=>joined.flatMap(r=>{const items=[]; if(r.impressions>=100&&r.ctr<2)items.push(["SEO opportunity",r,"High impressions with low CTR. Improve the title and meta description."]); if(r.ga.screenPageViews>=20&&r.ga.averageEngagementTime<30)items.push(["Engagement opportunity",r,"Traffic is meaningful but engagement is low. Review the introduction, examples and internal links."]); if(r.ga.averageEngagementTime>=180&&r.impressions<100)items.push(["Visibility opportunity",r,"Visitors engage strongly, but Google visibility is limited. Improve internal linking and on-page SEO."]); if(r.growth>=25&&r.clicks>=10)items.push(["Growing content",r,"Search clicks are growing meaningfully. Consider related supporting content."]); if(r.growth<=-25&&r.previousClicks>=10)items.push(["Declining content",r,"Search clicks declined against the previous equivalent period. Check rankings, freshness and competing results."]); return items;}),[joined]);
  return <AnalyticsShell eyebrow="Unified · Recommended actions" title="Insights" description="Actionable findings from Platform, Search Console and GA4. Minimum thresholds suppress conclusions from tiny samples." actions={<RangeControls {...controls} onSelect={controls.select} onRange={controls.setRange}/>}>
    {error&&<p className="rounded-2xl bg-amber-50 p-4 text-amber-800">{error}</p>}<section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{insights.length?insights.map(([type,r,text],i)=><article key={`${type}-${r.path}-${i}`} className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950">{type}</span><h2 className="mt-3 truncate font-black">{r.title}</h2><p className="mt-1 text-xs text-zinc-500">{r.clicks} clicks · {r.impressions} impressions · {r.ga.screenPageViews} views · {Math.round(r.ga.averageEngagementTime)}s engagement</p><p className="mt-3 text-sm">{text}</p></article>):<p className="col-span-full rounded-3xl border border-dashed p-10 text-center text-zinc-400">No reliable opportunities meet the minimum thresholds for this period.</p>}</section>
    <section className="admin-surface overflow-x-auto rounded-[28px] sm:rounded-[32px]">
      <h2 className="p-6 text-lg font-black font-outfit text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800/80">Unified content performance</h2>
      <table className="admin-table min-w-full text-left text-sm">
        <thead className="bg-zinc-50/75 dark:bg-[#18181b]/60 border-b border-zinc-100 dark:border-zinc-800/80">
          <tr>
            {["Page","Clicks","Impressions","CTR","Position","Users","Views","Engagement"].map((h) => (
              <th key={h} className="px-6 py-4.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {joined.map((r) => (
            <tr key={r.path} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
              <td className="max-w-xs truncate px-6 py-4.5 font-bold font-outfit text-zinc-950 dark:text-white">{r.title}</td>
              <td className="px-6 py-4.5 tabular-nums font-bold text-blue-600 dark:text-blue-400">{r.clicks}</td>
              <td className="px-6 py-4.5 tabular-nums text-zinc-600 dark:text-zinc-300 font-semibold">{r.impressions}</td>
              <td className="px-6 py-4.5 tabular-nums text-zinc-600 dark:text-zinc-300 font-semibold">{r.ctr.toFixed(1)}%</td>
              <td className="px-6 py-4.5 tabular-nums text-zinc-600 dark:text-zinc-300 font-semibold">{r.position.toFixed(1)}</td>
              <td className="px-6 py-4.5 tabular-nums text-zinc-600 dark:text-zinc-300 font-semibold">{r.ga.activeUsers}</td>
              <td className="px-6 py-4.5 tabular-nums text-zinc-600 dark:text-zinc-300 font-semibold">{r.ga.screenPageViews}</td>
              <td className="px-6 py-4.5 tabular-nums text-zinc-600 dark:text-zinc-300 font-semibold">{Math.round(r.ga.averageEngagementTime)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  </AnalyticsShell>;
}
