"use client";
import LogoLoader from "@/components/ui/LogoLoader";
import { useEffect, useState } from "react";

import { analyticsApi } from "@/lib/api";
import AnalyticsShell from "../AnalyticsShell";
import MetricCard from "../MetricCard";

export default function PlatformPage() {
  const [data,setData] = useState(null); const [error,setError] = useState("");
  useEffect(() => { analyticsApi.platform().then((r) => r.success ? setData(r.data.data) : setError(r.error)); }, []);
  return <AnalyticsShell eyebrow="Platform · Owned data" title="Platform analytics" description="What exists and happens inside asif.to, using only metrics the application currently records.">
    {!data && !error && <div className="grid min-h-72 place-items-center"><LogoLoader className=" text-blue-600" /></div>}{error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
    {data && <><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{Object.entries(data.counts).map(([key,value], index) => <MetricCard key={key} label={key.replace(/([A-Z])/g, " $1")} value={value.toLocaleString()} source="Platform" tone={["blue","violet","teal","amber","pink"][index%5]}/>)}</section><section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><h2 className="mb-4 text-lg font-black">Recent publishing activity</h2><div className="divide-y divide-zinc-100 dark:divide-zinc-900">{data.recent.length ? data.recent.map((item) => <div key={item._id} className="flex flex-col justify-between gap-1 py-3 sm:flex-row"><div><p className="font-semibold">{item.title}</p><p className="text-xs text-zinc-500">{item.type || "article"} · {item.author?.fullName || "Unknown author"}</p></div><time className="text-xs text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</time></div>) : <p className="py-8 text-center text-zinc-400">No published content yet.</p>}</div></section></>}
  </AnalyticsShell>;
}
