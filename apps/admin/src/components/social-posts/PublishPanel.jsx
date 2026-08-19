"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CalendarClock, Check, CheckCircle2, ExternalLink, Facebook, History, Instagram, Linkedin, Loader2, RefreshCw, Send, Settings2, Unplug } from "lucide-react";
import { socialIntegrationsApi, socialPostsApi } from "@/lib/api";
import { renderNodesToFiles } from "./export/ExportEngine";

const LOCK_MS = 30 * 24 * 60 * 60 * 1000;
const META = {
  instagram: { label: "Instagram", icon: Instagram },
  facebook: { label: "Facebook", icon: Facebook },
  linkedin: { label: "LinkedIn", icon: Linkedin },
};

function defaultCaption(post) {
  const caption = (post.caption || "").trim();
  const tags = (post.hashtags || []).map((x) => String(x).trim()).filter(Boolean).map((x) => x.startsWith("#") ? x : `#${x}`);
  const missing = tags.filter((tag) => !caption.toLowerCase().includes(tag.toLowerCase()));
  return [caption, missing.join(" ")].filter(Boolean).join("\n\n");
}

const fmt = (value, withTime = false) => value ? new Intl.DateTimeFormat(undefined, withTime ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "";

export default function PublishPanel({ postId, post, exportRefs }) {
  const [integrations, setIntegrations] = useState([]);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState([]);
  const [caption, setCaption] = useState(() => defaultCaption(post));
  const [publishing, setPublishing] = useState(false);
  const [busyPlatform, setBusyPlatform] = useState("");
  const [statusText, setStatusText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => setCaption(defaultCaption(post)), [post.caption, post.hashtags]);

  const loadState = useCallback(async () => {
    if (!postId) return;
    const [a, b] = await Promise.all([socialIntegrationsApi.list(), socialPostsApi.publications(postId)]);
    setIntegrations(Array.isArray(a?.data?.data) ? a.data.data : []);
    setHistory(Array.isArray(b?.data?.data) ? b.data.data : []);
  }, [postId]);

  useEffect(() => { loadState(); }, [loadState]);

  const byPlatform = useMemo(() => Object.fromEntries(integrations.map((x) => [x.platform, x])), [integrations]);
  const latest = useMemo(() => {
    const out = {};
    for (const row of history) if (!out[row.platform]) out[row.platform] = row;
    return out;
  }, [history]);
  const latestSuccess = useMemo(() => {
    const out = {};
    for (const row of history) if (row.status === "published" && row.publishedAt && !out[row.platform]) out[row.platform] = row;
    return out;
  }, [history]);

  const lockFor = (platform) => {
    const row = latestSuccess[platform];
    if (!row?.publishedAt) return null;
    const next = new Date(row.publishedAt).getTime() + LOCK_MS;
    return next > Date.now() ? { row, next: new Date(next) } : null;
  };

  const tokenState = (item) => {
    if (!item?.tokenExpiresAt) return null;
    const diff = new Date(item.tokenExpiresAt).getTime() - Date.now();
    if (diff <= 0) return { expired: true, label: "Token expired" };
    const days = Math.ceil(diff / 86400000);
    return days <= 7 ? { expired: false, label: `Token expires in ${days}d` } : null;
  };

  async function uploadAssets() {
    setStatusText("Rendering slides...");
    const files = await renderNodesToFiles(exportRefs.current.filter(Boolean), { name: post.name, type: "png" });
    setStatusText("Uploading slides...");
    const upload = await socialPostsApi.uploadPublishingAssets(postId, files);
    if (!upload?.success) throw new Error(upload?.error || "Slide upload failed.");
    const assets = upload?.data?.data;
    if (!Array.isArray(assets) || !assets.length) throw new Error("No publishing assets returned.");
    return assets;
  }

  async function publishPlatforms(platforms) {
    if (!platforms.length || publishing) return;
    setPublishing(true);
    try {
      const assets = await uploadAssets();
      setStatusText("Publishing...");
      const result = await socialPostsApi.publish(postId, { platforms, assets, caption });
      if (!result?.success) throw new Error(result?.error || "Publishing failed.");
      await loadState();
      const failed = (result?.data?.data || []).filter((x) => x.status === "failed").map((x) => x.platform);
      setSelected(failed);
      setStatusText(failed.length ? "Some platforms failed. Retry only those platforms." : "Publishing completed.");
    } catch (error) {
      setStatusText(error.message || "Publishing failed.");
    } finally {
      setPublishing(false);
      setBusyPlatform("");
    }
  }

  async function retry(platform) {
    setBusyPlatform(platform);
    await publishPlatforms([platform]);
  }

  if (!postId) return <div className="admin-surface px-4 py-3 text-xs text-muted-foreground">Save this post first to enable publishing.</div>;

  return (
    <div className="admin-surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold"><Send size={15}/>Publishing</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">Post once, track every platform, and prevent accidental reposts for 30 days.</div>
        </div>
        <div className="flex gap-1.5">
          <Link href="/social-integrations" className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold"><Settings2 size={13}/>Accounts</Link>
          <button onClick={() => setShowHistory(!showHistory)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold"><History size={13}/>History</button>
          {socialPostsApi.schedule && <button onClick={() => setShowSchedule(!showSchedule)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold"><CalendarClock size={13}/>Schedule</button>}
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-2 lg:grid-cols-3">
          {Object.entries(META).map(([platform, meta]) => {
            const item = byPlatform[platform];
            const connected = item?.status === "connected";
            const lock = lockFor(platform);
            const recent = latest[platform];
            const failed = recent?.status === "failed" && !lock;
            const token = tokenState(item);
            const checked = selected.includes(platform);
            const Icon = meta.icon;

            return (
              <div key={platform} className={`rounded-xl border p-3 ${lock ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/10" : failed ? "border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/10" : checked ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-800"}`}>
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Icon size={15}/></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                      {meta.label}
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${lock ? "bg-emerald-500/10 text-emerald-600" : failed ? "bg-rose-500/10 text-rose-600" : connected ? "bg-zinc-500/10 text-zinc-500" : "bg-amber-500/10 text-amber-600"}`}>{lock ? "Posted" : failed ? "Failed" : connected ? "Ready" : "Not connected"}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{item?.accountName || "No account connected"}</div>
                  </div>
                </div>

                <div className="mt-3">
                  {lock ? <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground"><div><div className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={11}/>Posted {fmt(lock.row.publishedAt, true)}</div><div className="mt-0.5">Repost after {fmt(lock.next)}</div></div>{lock.row.remotePostUrl && <a href={lock.row.remotePostUrl} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1 rounded-lg border px-2 font-semibold">View <ExternalLink size={10}/></a>}</div>
                  : failed ? <><div className="mb-2 line-clamp-2 text-[10px] text-rose-600">{recent.errorMessage || "Publishing failed."}</div><button onClick={() => retry(platform)} disabled={publishing} className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-lg bg-rose-600 text-[10px] font-bold text-white disabled:opacity-50">{busyPlatform === platform ? <Loader2 size={11} className="animate-spin"/> : <RefreshCw size={11}/>}Retry {meta.label}</button></>
                  : !connected ? <Link href="/social-integrations" className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-lg border text-[10px] font-semibold"><Unplug size={11}/>Connect account</Link>
                  : token?.expired ? <Link href="/social-integrations" className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 text-[10px] font-bold text-white"><RefreshCw size={11}/>Reconnect</Link>
                  : <button onClick={() => setSelected((s) => s.includes(platform) ? s.filter((x) => x !== platform) : [...s, platform])} disabled={publishing} className={`inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold ${checked ? "bg-primary text-primary-foreground" : "border"}`}>{checked ? <Check size={11}/> : <Send size={11}/>} {checked ? "Selected" : `Post to ${meta.label}`}</button>}
                  {token && !token.expired && !lock && <div className="mt-2 flex items-center gap-1 text-[9px] text-amber-600"><AlertCircle size={10}/>{token.label}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div><label className="mb-1.5 block text-[11px] font-semibold">Caption + hashtags</label><textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} disabled={publishing} className="w-full resize-y rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-xs leading-5 outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-800"/></div>
          <div className="flex flex-col justify-end gap-2"><div className="text-[10px] text-muted-foreground">{selected.length ? `${selected.length} platform${selected.length === 1 ? "" : "s"} selected` : "Select a ready platform above."}</div><button onClick={() => publishPlatforms(selected)} disabled={publishing || !selected.length} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-45">{publishing ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}Publish selected</button></div>
        </div>

        {showSchedule && socialPostsApi.schedule && <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border bg-muted/30 p-3"><div className="min-w-56 flex-1"><label className="mb-1 block text-[10px] font-semibold">Publish date & time</label><input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-3 text-xs"/></div><button disabled={!scheduledAt || !selected.length} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-bold text-primary-foreground disabled:opacity-50">Schedule selected</button></div>}

        {statusText && <div className="mt-3 rounded-lg bg-muted px-3 py-2 text-[11px] text-muted-foreground">{statusText}</div>}

        {showHistory && <div className="mt-4 border-t pt-4"><div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Publishing history</div>{history.length === 0 ? <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">No publishing attempts yet.</div> : <div className="divide-y overflow-hidden rounded-xl border">{history.slice(0, 15).map((row) => { const meta = META[row.platform]; const Icon = meta?.icon || Send; return <div key={row._id} className="flex flex-wrap items-center gap-3 px-3 py-2.5"><Icon size={14}/><div className="min-w-0 flex-1"><div className="text-xs font-semibold">{meta?.label || row.platform} <span className="ml-1 text-[9px] text-muted-foreground">{row.status}</span></div><div className="text-[10px] text-muted-foreground">{fmt(row.publishedAt || row.scheduledAt || row.createdAt, true)}</div>{row.status === "failed" && row.errorMessage && <div className="mt-1 line-clamp-1 text-[10px] text-rose-600">{row.errorMessage}</div>}</div>{row.status === "failed" && <button onClick={() => retry(row.platform)} className="inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[10px] font-semibold"><RefreshCw size={10}/>Retry</button>}{row.remotePostUrl && <a href={row.remotePostUrl} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[10px] font-semibold">View <ExternalLink size={10}/></a>}</div>; })}</div>}</div>}
      </div>
    </div>
  );
}
