"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, CalendarClock, CheckCircle2, ExternalLink, Facebook,
  History, Instagram, Linkedin, Loader2, RefreshCw, RotateCcw,
  Send, ShieldAlert, X
} from "lucide-react";
import { socialIntegrationsApi, socialPostsApi } from "@/lib/api";
import { renderNodesToFiles } from "./export/ExportEngine";

const META = {
  instagram: { label: "Instagram", icon: Instagram },
  facebook: { label: "Facebook", icon: Facebook },
  linkedin: { label: "LinkedIn", icon: Linkedin },
};

function defaultCaption(post) {
  const caption = (post.caption || "").trim();
  const tags = (post.hashtags || [])
    .map((x) => String(x).trim()).filter(Boolean)
    .map((x) => x.startsWith("#") ? x : `#${x}`);
  const missing = tags.filter((tag) => !caption.toLowerCase().includes(tag.toLowerCase()));
  return [caption, missing.join(" ")].filter(Boolean).join("\n\n");
}

function tokenState(item) {
  if (!item?.tokenExpiresAt) return { kind: "ok", label: "Connected" };
  const expires = new Date(item.tokenExpiresAt);
  if (Number.isNaN(expires.getTime())) return { kind: "ok", label: "Connected" };
  const diff = expires.getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (diff <= 0) return { kind: "expired", label: "Token expired" };
  if (days <= 7) return { kind: "warning", label: `Expires in ${Math.max(1, days)}d` };
  return { kind: "ok", label: "Connected" };
}

const fmt = (value) => value ? new Date(value).toLocaleString() : "";

export default function PublishPanel({ postId, post, exportRefs }) {
  const [integrations, setIntegrations] = useState([]);
  const [selected, setSelected] = useState([]);
  const [caption, setCaption] = useState(() => defaultCaption(post));
  const [publishing, setPublishing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [statusText, setStatusText] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => setCaption(defaultCaption(post)), [post.caption, post.hashtags]);

  async function loadIntegrations() {
    const result = await socialIntegrationsApi.list();
    const rows = Array.isArray(result?.data?.data) ? result.data.data : [];
    setIntegrations(rows);
    const usable = rows
      .filter((x) => x.status === "connected" && tokenState(x).kind !== "expired")
      .map((x) => x.platform);
    setSelected((current) => current.length ? current.filter((x) => usable.includes(x)) : usable);
  }

  async function loadHistory() {
    if (!postId) return;
    const result = await socialPostsApi.publications(postId);
    setHistory(Array.isArray(result?.data?.data) ? result.data.data : []);
  }

  useEffect(() => { loadIntegrations(); loadHistory(); }, [postId]);

  const byPlatform = useMemo(
    () => Object.fromEntries(integrations.map((x) => [x.platform, x])),
    [integrations],
  );

  function toggle(platform) {
    const item = byPlatform[platform];
    if (item?.status !== "connected" || tokenState(item).kind === "expired") return;
    setSelected((current) =>
      current.includes(platform)
        ? current.filter((x) => x !== platform)
        : [...current, platform],
    );
  }

  async function renderAndUpload() {
    setStatusText("Rendering slides...");
    const nodes = exportRefs.current.filter(Boolean);
    if (!nodes.length) throw new Error("No slides are available to publish.");

    const files = await renderNodesToFiles(nodes, { name: post.name, type: "png" });
    setStatusText("Uploading slide images...");

    const upload = await socialPostsApi.uploadPublishingAssets(postId, files);
    if (!upload?.success) throw new Error(upload?.error || "Slide upload failed.");

    const assets = upload?.data?.data;
    if (!Array.isArray(assets) || !assets.length) throw new Error("No publishing assets were returned.");
    return assets;
  }

  async function publishNow() {
    if (!postId || publishing || !selected.length) return;
    setPublishing(true); setResults([]);
    try {
      const assets = await renderAndUpload();
      setStatusText(`Publishing to ${selected.length} platform${selected.length === 1 ? "" : "s"}...`);
      const result = await socialPostsApi.publish(postId, { platforms: selected, assets, caption });
      if (!result?.success) throw new Error(result?.error || "Publishing failed.");
      setResults(Array.isArray(result?.data?.data) ? result.data.data : []);
      setStatusText("");
      await loadHistory();
    } catch (error) {
      setStatusText(error.message || "Publishing failed.");
    } finally {
      setPublishing(false);
    }
  }

  async function schedule() {
    if (!scheduledAt || !selected.length || publishing) return;
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      setStatusText("Choose a future date and time."); return;
    }

    setPublishing(true);
    try {
      const assets = await renderAndUpload();
      setStatusText("Scheduling publication...");
      const result = await socialPostsApi.schedule(postId, {
        platforms: selected, assets, caption, scheduledAt: when.toISOString(),
      });
      if (!result?.success) throw new Error(result?.error || "Scheduling failed.");
      setScheduleOpen(false); setScheduledAt("");
      setStatusText(`Scheduled for ${when.toLocaleString()}.`);
      await loadHistory();
    } catch (error) {
      setStatusText(error.message || "Scheduling failed.");
    } finally {
      setPublishing(false);
    }
  }

  async function retry(item) {
    setBusyId(item._id);
    try {
      const result = await socialPostsApi.retryPublication(postId, item._id);
      if (!result?.success) throw new Error(result?.error || "Retry failed.");
      setStatusText(result?.data?.data?.status === "published"
        ? `${META[item.platform]?.label} published successfully.`
        : result?.data?.data?.error || "Retry failed.");
      await loadHistory();
    } catch (error) {
      setStatusText(error.message || "Retry failed.");
    } finally {
      setBusyId("");
    }
  }

  async function cancel(item) {
    setBusyId(item._id);
    try {
      const result = await socialPostsApi.cancelPublication(postId, item._id);
      if (!result?.success) throw new Error(result?.error || "Could not cancel schedule.");
      setStatusText("Scheduled publication cancelled.");
      await loadHistory();
    } catch (error) {
      setStatusText(error.message || "Could not cancel schedule.");
    } finally {
      setBusyId("");
    }
  }

  if (!postId) {
    return <div className="admin-surface p-4">
      <div className="text-sm font-semibold">Publish to social media</div>
      <p className="mt-1 text-xs text-muted-foreground">Save this post first to enable publishing and scheduling.</p>
    </div>;
  }

  return (
    <div className="admin-surface overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200/80 p-4 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 font-bold"><Send size={16} />Publish</div>
          <p className="mt-1 text-xs text-muted-foreground">Publish now, retry failures, or schedule this post.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setHistoryOpen(!historyOpen); loadHistory(); }}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold">
            <History size={14} />History
          </button>
          <button type="button" onClick={() => setScheduleOpen(!scheduleOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold">
            <CalendarClock size={14} />Schedule
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(META).map(([platform, meta]) => {
            const item = byPlatform[platform];
            const connected = item?.status === "connected";
            const token = tokenState(item);
            const usable = connected && token.kind !== "expired";
            const checked = selected.includes(platform);
            const Icon = meta.icon;

            return <div key={platform}
              className={`rounded-xl border p-3 ${checked ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-zinc-200 dark:border-zinc-800"}`}>
              <button type="button" disabled={!usable || publishing} onClick={() => toggle(platform)}
                className="w-full text-left disabled:cursor-not-allowed disabled:opacity-60">
                <div className="flex items-center justify-between">
                  <Icon size={17} />
                  <span className={`h-4 w-4 rounded-full border ${checked ? "border-primary bg-primary" : "border-zinc-300 dark:border-zinc-700"}`} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{meta.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    token.kind === "expired" ? "bg-rose-500/10 text-rose-600" :
                    token.kind === "warning" ? "bg-amber-500/10 text-amber-600" :
                    connected ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-500/10 text-zinc-500"
                  }`}>{connected ? token.label : "Not connected"}</span>
                </div>
                <div className="mt-1 truncate text-[11px] text-muted-foreground">
                  {connected ? item.accountName || "Connected account" : "Connect this platform first"}
                </div>
              </button>
              {(token.kind === "expired" || token.kind === "warning") &&
                <Link href="/social-integrations" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                  <RefreshCw size={11} />Reconnect
                </Link>}
            </div>;
          })}
        </div>

        {integrations.some((x) => x.status === "connected" && tokenState(x).kind === "expired") &&
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <span>One or more social tokens have expired. Reconnect before publishing.</span>
          </div>}

        <div>
          <div className="mb-1.5 text-xs font-semibold">Caption + hashtags</div>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} disabled={publishing}
            className="w-full resize-y rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-sm leading-6 dark:border-zinc-800" />
        </div>

        {scheduleOpen && <div className="rounded-xl border border-zinc-200 bg-muted/20 p-4 dark:border-zinc-800">
          <div className="text-sm font-semibold">Schedule publication</div>
          <p className="mt-1 text-xs text-muted-foreground">Rendered assets are stored now and published by the backend scheduler.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-sm dark:border-zinc-800" />
            <button type="button" onClick={schedule} disabled={publishing || !scheduledAt || !selected.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900">
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <CalendarClock size={14} />}Schedule
            </button>
          </div>
        </div>}

        {results.length > 0 && <div className="space-y-2">
          {results.map((result) => {
            const ok = result.status === "published";
            return <div key={result.platform} className={`flex items-start justify-between gap-3 rounded-xl border p-3 text-xs ${ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
              <div className="flex items-start gap-2">
                {ok ? <CheckCircle2 size={15} className="mt-0.5 text-emerald-600" /> : <AlertCircle size={15} className="mt-0.5 text-rose-600" />}
                <div>
                  <div className="font-semibold">{META[result.platform]?.label} · {ok ? "Published" : "Failed"}</div>
                  {!ok && result.error && <div className="mt-1 text-muted-foreground">{result.error}</div>}
                </div>
              </div>
              {ok && result.remotePostUrl && <a href={result.remotePostUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary">View <ExternalLink size={11} /></a>}
            </div>;
          })}
        </div>}

        {historyOpen && <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="border-b px-3 py-2.5 text-xs font-bold">Publishing history</div>
          {history.length === 0 ? <div className="p-4 text-xs text-muted-foreground">No publishing history yet.</div> :
            <div className="divide-y">
              {history.map((item) => {
                const Icon = META[item.platform]?.icon || Send;
                const busy = busyId === item._id;
                return <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Icon size={14} /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{META[item.platform]?.label}</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold">{item.status}</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        {item.status === "scheduled" ? `Scheduled ${fmt(item.scheduledAt)}` :
                          item.publishedAt ? `Published ${fmt(item.publishedAt)}` : fmt(item.createdAt)}
                        {item.attempts ? ` · ${item.attempts} attempt${item.attempts === 1 ? "" : "s"}` : ""}
                      </div>
                      {item.status === "failed" && item.errorMessage && <div className="mt-1 max-w-xl text-[10px] text-rose-600">{item.errorMessage}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.remotePostUrl && <a href={item.remotePostUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold"><ExternalLink size={11} />View post</a>}
                    {item.status === "failed" && <button type="button" disabled={busy} onClick={() => retry(item)} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold">{busy ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}Retry</button>}
                    {item.status === "scheduled" && <button type="button" disabled={busy} onClick={() => cancel(item)} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold text-rose-600">{busy ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}Cancel</button>}
                  </div>
                </div>;
              })}
            </div>}
        </div>}

        {statusText && <div className="text-xs text-muted-foreground">{statusText}</div>}

        <button type="button" onClick={publishNow} disabled={publishing || !selected.length}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {publishing ? "Publishing..." : `Publish now to ${selected.length} platform${selected.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
