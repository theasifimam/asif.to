"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Facebook, Instagram, Linkedin, Loader2, Send } from "lucide-react";
import { socialIntegrationsApi, socialPostsApi } from "@/lib/api";
import { renderNodesToFiles } from "./export/ExportEngine";

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

export default function PublishPanel({ postId, post, exportRefs }) {
  const [integrations, setIntegrations] = useState([]);
  const [selected, setSelected] = useState([]);
  const [caption, setCaption] = useState(() => defaultCaption(post));
  const [publishing, setPublishing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => setCaption(defaultCaption(post)), [post.caption, post.hashtags]);
  useEffect(() => {
    socialIntegrationsApi.list().then((result) => {
      const rows = Array.isArray(result?.data?.data) ? result.data.data : [];
      setIntegrations(rows);
      setSelected(rows.filter((x) => x.status === "connected").map((x) => x.platform));
    });
  }, []);

  const byPlatform = useMemo(() => Object.fromEntries(integrations.map((x) => [x.platform, x])), [integrations]);
  const toggle = (platform) => {
    if (byPlatform[platform]?.status !== "connected") return;
    setSelected((s) => s.includes(platform) ? s.filter((x) => x !== platform) : [...s, platform]);
  };

  async function publish() {
    if (!postId || publishing || !selected.length) return;
    setPublishing(true);
    setResults([]);
    try {
      setStatusText("Rendering slides...");
      const files = await renderNodesToFiles(exportRefs.current.filter(Boolean), { name: post.name, type: "png" });
      setStatusText("Uploading slide images...");
      const upload = await socialPostsApi.uploadPublishingAssets(postId, files);
      if (!upload?.success) throw new Error(upload?.error || "Slide upload failed.");
      const assets = upload?.data?.data;
      if (!Array.isArray(assets) || !assets.length) throw new Error("No publishing assets returned.");

      setStatusText(`Publishing to ${selected.length} platform${selected.length === 1 ? "" : "s"}...`);
      const result = await socialPostsApi.publish(postId, { platforms: selected, assets, caption });
      if (!result?.success) throw new Error(result?.error || "Publishing failed.");
      setResults(Array.isArray(result?.data?.data) ? result.data.data : []);
      setStatusText("");
    } catch (error) {
      setStatusText(error.message || "Publishing failed.");
    } finally {
      setPublishing(false);
    }
  }

  if (!postId) {
    return <div className="admin-surface p-4"><div className="text-sm font-semibold">Publish to social media</div><p className="mt-1 text-xs text-muted-foreground">Save this post first. Publishing becomes available after it has a post ID.</p></div>;
  }

  return (
    <div className="admin-surface overflow-hidden">
      <div className="border-b border-zinc-200/80 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-bold"><Send size={16} />Publish</div>
        <p className="mt-1 text-xs text-muted-foreground">Publish the current rendered slides with a caption.</p>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(META).map(([platform, meta]) => {
            const item = byPlatform[platform];
            const connected = item?.status === "connected";
            const checked = selected.includes(platform);
            const Icon = meta.icon;
            return (
              <button key={platform} type="button" disabled={!connected || publishing} onClick={() => toggle(platform)} className={`rounded-xl border p-3 text-left transition ${checked ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-zinc-200 bg-background dark:border-zinc-800"} disabled:cursor-not-allowed disabled:opacity-45`}>
                <div className="flex items-center justify-between"><Icon size={17} /><span className={`h-4 w-4 rounded-full border ${checked ? "border-primary bg-primary" : "border-zinc-300 dark:border-zinc-700"}`} /></div>
                <div className="mt-3 text-sm font-semibold">{meta.label}</div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{connected ? item.accountName || "Connected" : "Not connected"}</div>
              </button>
            );
          })}
        </div>

        <div>
          <div className="mb-1.5 text-xs font-semibold">Caption + hashtags</div>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} disabled={publishing} className="w-full resize-y rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-sm leading-6 outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-800" />
        </div>

        {results.length > 0 && <div className="space-y-2">{results.map((result) => {
          const ok = result.status === "published";
          return <div key={result.platform} className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
            {ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" /> : <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />}
            <div><div className="font-semibold">{META[result.platform]?.label || result.platform} · {ok ? "Published" : "Failed"}</div>{!ok && result.error && <div className="mt-1 text-muted-foreground">{result.error}</div>}</div>
          </div>;
        })}</div>}

        {statusText && <div className="text-xs text-muted-foreground">{statusText}</div>}
        <button type="button" onClick={publish} disabled={publishing || selected.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
          {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {publishing ? "Publishing..." : `Publish to ${selected.length} platform${selected.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
