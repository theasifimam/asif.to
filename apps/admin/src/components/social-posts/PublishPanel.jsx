"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle2,
  ExternalLink,
  Facebook,
  History,
  Instagram,
  Linkedin,
  RefreshCw,
  Send,
  Settings2,
  Unplug,
  Clock,
  X,
} from "lucide-react";
import { socialIntegrationsApi, socialPostsApi } from "@/lib/api";
import { renderNodesToFiles } from "./export/ExportEngine";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

function toLocalDateTimeValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function PublishPanel({ postId, post, exportRefs }) {
  const [integrations, setIntegrations] = useState([]);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState([]);
  const [caption, setCaption] = useState(() => defaultCaption(post));
  const [publishing, setPublishing] = useState(false);
  const [busyPlatform, setBusyPlatform] = useState("");
  const [statusText, setStatusText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const { user } = useAuth();
  
  const canPublish = user?.role === "admin" || user?.role === "super_admin";

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

  const activeScheduled = useMemo(() => {
    return history.find((row) => row.status === "scheduled" && row.scheduledAt);
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

  async function schedulePlatforms(platforms) {
    if (!platforms.length || publishing || !scheduledAt) return;
    setPublishing(true);
    try {
      const assets = await uploadAssets();
      setStatusText("Scheduling...");
      const result = await socialPostsApi.schedule(postId, {
        platforms,
        assets,
        caption,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      if (!result?.success) throw new Error(result?.error || "Scheduling failed.");
      await loadState();
      setSelected([]);
      setPopoverOpen(false);
      setStatusText(`Post scheduled for auto-publishing on ${fmt(scheduledAt, true)}.`);
    } catch (error) {
      setStatusText(error.message || "Scheduling failed.");
    } finally {
      setPublishing(false);
    }
  }

  async function retry(platform) {
    setBusyPlatform(platform);
    await publishPlatforms([platform]);
  }

  if (!postId) return <div className="admin-surface px-4 py-3 text-xs text-muted-foreground">Save this post first to enable publishing.</div>;

  return (
    <div className="admin-surface overflow-hidden border-zinc-200/60 dark:border-zinc-800/60">
      {/* Action Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Send size={15} className="text-primary" />
            <span>Publishing</span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Post once, track every platform, and schedule automatic publishing.
          </div>
        </div>

        <div className="flex gap-1.5 items-center">
          <Link
            href="/social-integrations"
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100/50 dark:bg-zinc-900/50 px-3 text-[11px] font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings2 size={13} />
            <span>Accounts</span>
          </Link>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100/50 dark:bg-zinc-900/50 px-3 text-[11px] font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <History size={13} />
            <span>History</span>
          </button>

          {socialPostsApi.schedule && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold transition-all cursor-pointer ${
                    scheduledAt || activeScheduled
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <CalendarClock size={13} className={scheduledAt || activeScheduled ? "text-blue-500 animate-pulse" : ""} />
                  <span>
                    {scheduledAt
                      ? `Scheduled: ${fmt(scheduledAt, true)}`
                      : activeScheduled
                      ? `Scheduled: ${fmt(activeScheduled.scheduledAt, true)}`
                      : "Schedule"}
                  </span>
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-80 p-4 space-y-3.5 border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Clock size={14} className="text-blue-500" />
                    <span>Schedule Auto-Publish</span>
                  </div>
                  <button
                    onClick={() => setPopoverOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X size={14} />
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Select a date and time for when this post will automatically publish to selected platforms.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Publish Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    min={toLocalDateTimeValue(new Date(Date.now() + 60000))}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Quick Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ["Tomorrow 6 PM", () => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        d.setHours(18, 0, 0, 0);
                        setScheduledAt(toLocalDateTimeValue(d));
                      }],
                      ["Next Sat 6 PM", () => {
                        const d = new Date();
                        d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
                        d.setHours(18, 0, 0, 0);
                        setScheduledAt(toLocalDateTimeValue(d));
                      }],
                      ["In 2 Days", () => {
                        const d = new Date();
                        d.setDate(d.getDate() + 2);
                        d.setHours(18, 0, 0, 0);
                        setScheduledAt(toLocalDateTimeValue(d));
                      }],
                    ].map(([label, fn]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={fn}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground transition-colors cursor-pointer"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60">
                  {scheduledAt && (
                    <button
                      type="button"
                      onClick={() => setScheduledAt("")}
                      className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => schedulePlatforms(selected)}
                    disabled={!scheduledAt || !selected.length || publishing}
                    className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {publishing ? <LogoLoader size={12} className=""  /> : <Clock size={12} />}
                    Confirm Schedule
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Connected Platforms Grid */}
        <div className="grid gap-3 lg:grid-cols-3">
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
              <div
                key={platform}
                className={`rounded-2xl p-3.5 transition-all ${
                  lock
                    ? "bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20"
                    : failed
                    ? "bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20"
                    : checked
                    ? "bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30"
                    : "bg-zinc-50/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-200/60 dark:bg-zinc-800/80 shrink-0">
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                      {meta.label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                          lock
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : failed
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : connected
                            ? "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {lock ? "Posted" : failed ? "Failed" : connected ? "Ready" : "Not connected"}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-muted-foreground font-medium">
                      {item?.accountName || "No account connected"}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {lock ? (
                    <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                      <div>
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 size={11} />
                          Posted {fmt(lock.row.publishedAt, true)}
                        </div>
                        <div className="mt-0.5 text-[9px]">Repost after {fmt(lock.next)}</div>
                      </div>
                      {lock.row.remotePostUrl && (
                        <a
                          href={lock.row.remotePostUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-7 items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 font-semibold text-foreground hover:bg-zinc-200 transition-colors"
                        >
                          View <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ) : failed ? (
                    <>
                      <div className="mb-2 line-clamp-2 text-[10px] text-rose-600 font-medium">
                        {recent.errorMessage || "Publishing failed."}
                      </div>
                      <button
                        onClick={() => retry(platform)}
                        disabled={publishing}
                        className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 text-[10px] font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                      >
                        {busyPlatform === platform ? <LogoLoader size={11} className=""  /> : <RefreshCw size={11} />}
                        Retry {meta.label}
                      </button>
                    </>
                  ) : !connected ? (
                    <Link
                      href="/social-integrations"
                      className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-[10px] font-semibold text-foreground hover:bg-zinc-200 transition-colors"
                    >
                      <Unplug size={11} /> Connect account
                    </Link>
                  ) : token?.expired ? (
                    <Link
                      href="/social-integrations"
                      className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 text-[10px] font-bold text-white hover:bg-amber-600 transition-colors"
                    >
                      <RefreshCw size={11} /> Reconnect
                    </Link>
                  ) : (
                    <button
                      onClick={() =>
                        setSelected((s) =>
                          s.includes(platform) ? s.filter((x) => x !== platform) : [...s, platform]
                        )
                      }
                      disabled={publishing}
                      className={`inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        checked
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800/80 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {checked ? <Check size={11} /> : <Send size={11} />}
                      {checked ? "Selected" : `Post to ${meta.label}`}
                    </button>
                  )}

                  {token && !token.expired && !lock && (
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-amber-600 font-medium">
                      <AlertCircle size={10} />
                      {token.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 🌟 Scheduled reflection banner inside form */}
        {(scheduledAt || activeScheduled) && (
          <div className="flex items-center justify-between rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-blue-500 animate-pulse shrink-0" />
              <span>
                Automated Schedule Set:{" "}
                <strong>{fmt(scheduledAt || activeScheduled?.scheduledAt, true)}</strong>
              </span>
            </div>
            {scheduledAt && (
              <button
                onClick={() => setScheduledAt("")}
                className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Caption + Action Bar */}
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Caption + hashtags
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              disabled={publishing}
              className="w-full resize-y rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/50 px-3.5 py-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="flex flex-col justify-end gap-2">
            <div className="text-[10px] text-muted-foreground font-medium">
              {selected.length
                ? `${selected.length} platform${selected.length === 1 ? "" : "s"} selected`
                : "Select a ready platform above."}
            </div>

            {canPublish ? (
              scheduledAt ? (
                <button
                  onClick={() => schedulePlatforms(selected)}
                  disabled={publishing || !selected.length}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-45 transition-all shadow-sm cursor-pointer"
                >
                  {publishing ? <LogoLoader size={14} className=""  /> : <Clock size={14} />}
                  Schedule Selected
                </button>
              ) : (
                <button
                  onClick={() => publishPlatforms(selected)}
                  disabled={publishing || !selected.length}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-45 transition-all shadow-sm cursor-pointer"
                >
                  {publishing ? <LogoLoader size={14} className=""  /> : <Send size={14} />}
                  Publish Now
                </button>
              )
            ) : (
              <div className="text-center rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                Admin approval required to publish
              </div>
            )}
          </div>
        </div>

        {statusText && (
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2.5 text-[11px] text-muted-foreground font-medium">
            {statusText}
          </div>
        )}

        {showHistory && (
          <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-4">
            <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Publishing History
            </div>
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200/60 dark:border-zinc-800/60 p-4 text-center text-xs text-muted-foreground">
                No publishing attempts yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                {history.slice(0, 15).map((row) => {
                  const meta = META[row.platform];
                  const Icon = meta?.icon || Send;
                  return (
                    <div key={row._id} className="flex flex-wrap items-center gap-3 px-3.5 py-2.5">
                      <Icon size={14} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold">
                          {meta?.label || row.platform}{" "}
                          <span className="ml-1 text-[9px] font-bold text-muted-foreground uppercase">{row.status}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {fmt(row.publishedAt || row.scheduledAt || row.createdAt, true)}
                        </div>
                        {row.status === "failed" && row.errorMessage && (
                          <div className="mt-1 line-clamp-1 text-[10px] text-rose-600 font-medium">{row.errorMessage}</div>
                        )}
                      </div>
                      {row.status === "failed" && (
                        <button
                          onClick={() => retry(row.platform)}
                          className="inline-flex h-7 items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 text-[10px] font-semibold"
                        >
                          <RefreshCw size={10} /> Retry
                        </button>
                      )}
                      {row.remotePostUrl && (
                        <a
                          href={row.remotePostUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-7 items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 text-[10px] font-semibold"
                        >
                          View <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
