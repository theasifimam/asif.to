"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BriefcaseBusiness, ExternalLink, FileCheck2, LogIn } from "lucide-react";
import api from "@/lib/axios";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import JobCard from "./JobCard";

export default function MyJobsClient() {
  const { isAuthenticated, requireAuth } = useAuthPrompt();
  const [tab, setTab] = useState("saved");
  const [saved, setSaved] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([api.get("/jobs/me/saved?limit=100"), api.get("/jobs/me/applications")])
      .then(([savedResult, applicationsResult]) => { setSaved(savedResult.data?.data || []); setApplications(applicationsResult.data?.data || []); })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);
  if (!isAuthenticated) return <div className="rounded-4xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900"><LogIn className="mx-auto h-8 w-8 text-blue-600" /><h1 className="mt-4 font-outfit text-2xl font-black">Sign in to view your jobs</h1><p className="mt-2 text-sm text-zinc-500">Saved jobs and application activity are private to your asif.to account.</p><button onClick={() => requireAuth()} className="mt-5 rounded-full bg-blue-600 px-6 py-3 text-xs font-black text-white">Sign in</button></div>;
  const internal = applications.filter((item) => item.kind === "internal");
  const external = applications.filter((item) => item.kind === "external_click");
  return <div>
    <header><p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Your account</p><h1 className="mt-2 font-outfit text-4xl font-black tracking-tight">My jobs</h1><p className="mt-2 text-sm text-zinc-500">A lightweight record of jobs you saved and application actions you took.</p></header>
    <div className="mt-6 inline-flex rounded-full bg-zinc-200/70 p-1 dark:bg-zinc-900">{[["saved", "Saved jobs", Bookmark, saved.length], ["applications", "Applications", FileCheck2, internal.length], ["external", "External clicks", ExternalLink, external.length]].map(([key, text, Icon, count]) => <button key={key} onClick={() => setTab(key)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${tab === key ? "bg-blue-600 text-white" : "text-zinc-500"}`}><Icon className="h-3.5 w-3.5" />{text}<span className="opacity-70">{count}</span></button>)}</div>
    {loading && <div className="py-16 text-center text-xs font-bold text-zinc-400">Loading your jobs…</div>}
    {!loading && tab === "saved" && <div className="mt-6 space-y-3">{saved.map((item) => <JobCard key={item._id} job={item.job} />)}{!saved.length && <Empty icon={Bookmark} text="No saved jobs yet" />}</div>}
    {!loading && tab !== "saved" && <div className="mt-6 overflow-hidden rounded-4xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><div className="divide-y divide-zinc-100 dark:divide-zinc-800">{(tab === "applications" ? internal : external).map((item) => <div key={item._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><Link href={`/jobs/${item.job?.slug}`} className="font-bold hover:text-blue-600">{item.job?.title || "Unavailable job"}</Link><p className="mt-1 text-xs text-zinc-500">{item.job?.companyName} · {item.job?.location}</p></div><div className="text-left sm:text-right"><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{tab === "applications" ? item.status : "Redirected externally"}</span><p className="mt-2 text-[10px] text-zinc-400">{new Date(item.appliedAt).toLocaleString()}</p></div></div>)}</div>{!(tab === "applications" ? internal : external).length && <Empty icon={BriefcaseBusiness} text={tab === "applications" ? "No direct applications yet" : "No external apply clicks yet"} />}</div>}
  </div>;
}

function Empty({ icon: Icon, text }) { return <div className="p-14 text-center"><Icon className="mx-auto h-7 w-7 text-zinc-300" /><p className="mt-3 text-sm font-bold text-zinc-500">{text}</p><Link href="/jobs" className="mt-3 inline-block text-xs font-black text-blue-600">Browse UAE jobs</Link></div>; }
