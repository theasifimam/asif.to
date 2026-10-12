"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, BriefcaseBusiness, ExternalLink, FileCheck2, LogIn, StickyNote } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import JobCard from "./JobCard";

export const STAGES = [
  { id: "applied", label: "Applied", tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
  { id: "interviewing", label: "Interviewing", tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  { id: "offer", label: "Offer", tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  { id: "accepted", label: "Accepted", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200" },
  { id: "rejected", label: "Rejected", tone: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
  { id: "withdrawn", label: "Withdrawn", tone: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
];
const STAGE_BY_ID = Object.fromEntries(STAGES.map((stage) => [stage.id, stage]));

export default function MyJobsClient() {
  const { isAuthenticated, requireAuth } = useAuthPrompt();
  const [tab, setTab] = useState("saved");
  const [stageFilter, setStageFilter] = useState("all");
  const [saved, setSaved] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([api.get("/jobs/me/saved?limit=100"), api.get("/jobs/me/applications")])
      .then(([savedResult, applicationsResult]) => {
        setSaved(savedResult.data?.data || []);
        setApplications(applicationsResult.data?.data || []);
      })
      .catch(() => toast.error("We couldn't load your jobs. Please refresh."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const counts = useMemo(() => {
    const result = Object.fromEntries(STAGES.map((stage) => [stage.id, 0]));
    for (const item of applications) result[item.stage || "applied"] += 1;
    return result;
  }, [applications]);

  const visible = applications.filter((item) => stageFilter === "all" || (item.stage || "applied") === stageFilter);

  const update = async (item, patch) => {
    const previous = applications;
    setApplications((rows) => rows.map((row) => (row._id === item._id ? { ...row, ...patch } : row)));
    try {
      await api.patch(`/jobs/me/applications/${item._id}`, patch);
    } catch {
      setApplications(previous);
      toast.error("Couldn't save that change. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-4xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <LogIn className="mx-auto h-8 w-8 text-blue-600" />
        <h1 className="mt-4 font-outfit text-2xl font-black">Sign in to view your jobs</h1>
        <p className="mt-2 text-sm text-zinc-500">Saved jobs and application activity are private to your asif.to account.</p>
        <button onClick={() => requireAuth()} className="mt-5 rounded-full bg-blue-600 px-6 py-3 text-xs font-black text-white">Sign in</button>
      </div>
    );
  }

  const tabs = [
    ["saved", "Saved jobs", Bookmark, saved.length],
    ["applications", "Application tracker", FileCheck2, applications.length],
  ];

  return (
    <div>
      <header>
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Your account</p>
        <h1 className="mt-2 font-outfit text-4xl font-black tracking-tight">My jobs</h1>
        <p className="mt-2 text-sm text-zinc-500">Keep track of jobs you saved and where each application stands. Notes and stages are private to you.</p>
      </header>

      <div className="mt-6 inline-flex rounded-full bg-zinc-200/70 p-1 dark:bg-zinc-900">
        {tabs.map(([key, text, Icon, count]) => (
          <button key={key} onClick={() => setTab(key)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${tab === key ? "bg-blue-600 text-white" : "text-zinc-500"}`}>
            <Icon className="h-3.5 w-3.5" />{text}<span className="opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {loading && <div className="py-16 text-center text-xs font-bold text-zinc-400">Loading your jobs…</div>}

      {!loading && tab === "saved" && (
        <div className="mt-6 space-y-3">
          {saved.map((item) => <JobCard key={item._id} job={item.job} />)}
          {!saved.length && <Empty icon={Bookmark} text="No saved jobs yet" />}
        </div>
      )}

      {!loading && tab === "applications" && (
        <div className="mt-6">
          {applications.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by stage">
              <FilterChip active={stageFilter === "all"} onClick={() => setStageFilter("all")}>All <b>{applications.length}</b></FilterChip>
              {STAGES.filter((stage) => counts[stage.id] > 0 || stageFilter === stage.id).map((stage) => (
                <FilterChip key={stage.id} active={stageFilter === stage.id} onClick={() => setStageFilter(stage.id)}>{stage.label} <b>{counts[stage.id]}</b></FilterChip>
              ))}
            </div>
          )}
          <div className="overflow-hidden rounded-4xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {visible.map((item) => <ApplicationRow key={item._id} item={item} onChange={(patch) => update(item, patch)} />)}
            </ul>
            {!visible.length && <Empty icon={BriefcaseBusiness} text={applications.length ? "Nothing at this stage" : "No applications yet. Press Apply on a job and it will appear here."} />}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold [&_b]:text-[10px] [&_b]:opacity-70 ${active ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"}`}>
      {children}
    </button>
  );
}

function ApplicationRow({ item, onChange }) {
  const stage = STAGE_BY_ID[item.stage || "applied"];
  const [note, setNote] = useState(item.note || "");
  const [showNote, setShowNote] = useState(Boolean(item.note));
  const external = item.kind === "external_click";
  return (
    <li className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href={`/jobs/${item.job?.slug}`} className="font-bold hover:text-blue-600">{item.job?.title || "Unavailable job"}</Link>
          <p className="mt-1 text-xs text-zinc-500">{item.job?.companyName} · {item.job?.location}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-400">
            <span>{external ? "Applied on the company website (not verified by asif.to)" : `Application ${item.status}`}</span>
            {external && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
            <span>{new Date(item.appliedAt).toLocaleDateString("en-AE", { dateStyle: "medium" })}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <label className="sr-only" htmlFor={`stage-${item._id}`}>Stage for {item.job?.title}</label>
          <select
            id={`stage-${item._id}`}
            value={item.stage || "applied"}
            onChange={(event) => onChange({ stage: event.target.value })}
            className={`min-h-9 rounded-full border-0 px-3 text-xs font-black ${stage.tone}`}
          >
            {STAGES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          <button type="button" onClick={() => setShowNote((value) => !value)} aria-expanded={showNote} aria-label="Toggle private note" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:text-blue-600 dark:border-zinc-700">
            <StickyNote className="h-4 w-4" />
          </button>
        </div>
      </div>
      {showNote && (
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => note !== (item.note || "") && onChange({ note })}
          maxLength={2000}
          rows={2}
          placeholder="Private note: contact person, interview date, salary discussed…"
          className="mt-3 w-full resize-y rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs outline-none focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-950"
        />
      )}
    </li>
  );
}

function Empty({ icon: Icon, text }) {
  return (
    <div className="p-14 text-center">
      <Icon className="mx-auto h-7 w-7 text-zinc-300" />
      <p className="mt-3 text-sm font-bold text-zinc-500">{text}</p>
      <Link href="/jobs" className="mt-3 inline-block text-xs font-black text-blue-600">Browse UAE jobs</Link>
    </div>
  );
}
