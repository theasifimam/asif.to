"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ExternalLink, Facebook, Instagram, Linkedin, Loader2, Plug, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { socialIntegrationsApi } from "@/lib/api";

const META = {
  instagram: { label: "Instagram", description: "Connect a professional Instagram account for image and carousel publishing.", icon: Instagram },
  facebook: { label: "Facebook", description: "Connect Facebook and choose the Page admin.asif.to should publish to.", icon: Facebook },
  linkedin: { label: "LinkedIn", description: "Connect your LinkedIn account for developer and educational posts.", icon: Linkedin },
};

function Status({ value }) {
  const connected = value === "connected";
  const selection = value === "needs_selection";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${connected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : selection ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-zinc-500/10 text-zinc-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : selection ? "bg-amber-500" : "bg-zinc-400"}`} />{connected ? "Connected" : selection ? "Choose Page" : "Not connected"}</span>;
}

export default function SocialIntegrationsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const byPlatform = useMemo(() => Object.fromEntries(items.map((item) => [item.platform, item])), [items]);

  async function load() {
    setLoading(true);
    try { const result = await socialIntegrationsApi.list(); setItems(Array.isArray(result?.data?.data) ? result.data.data : []); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status === "connected" && platform) setNotice(`${META[platform]?.label || platform} connected successfully.`);
    else if (status === "needs_selection") setNotice("Facebook connected. Choose the Page you want to publish to.");
    else if (status === "error") setNotice(message || "Social account connection failed.");
  }, [searchParams]);

  async function connect(platform) {
    setBusy(platform); setNotice("");
    try {
      const result = await socialIntegrationsApi.connect(platform);
      const url = result?.data?.data?.authUrl;
      if (!result?.success || !url) throw new Error(result?.error || "Could not start connection.");
      window.location.assign(url);
    } catch (error) { setNotice(error.message || "Could not start connection."); setBusy(""); }
  }

  async function disconnect(platform) {
    if (!window.confirm(`Disconnect ${META[platform].label}?`)) return;
    setBusy(platform);
    try { const result = await socialIntegrationsApi.disconnect(platform); if (!result?.success) throw new Error(result?.error || "Disconnect failed."); await load(); setNotice(`${META[platform].label} disconnected.`); }
    catch (error) { setNotice(error.message || "Disconnect failed."); }
    finally { setBusy(""); }
  }

  async function choosePage(pageId) {
    if (!pageId) return;
    setBusy("facebook");
    try { const result = await socialIntegrationsApi.selectFacebookPage(pageId); if (!result?.success) throw new Error(result?.error || "Could not select Facebook Page."); await load(); setNotice("Facebook Page selected successfully."); }
    catch (error) { setNotice(error.message || "Could not select Facebook Page."); }
    finally { setBusy(""); }
  }

  return <div className="space-y-6 p-4 md:p-6">
    <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Plug size={14}/>Publishing</div><h1 className="mt-2 text-2xl font-black">Social Integrations</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Connect each account once through OAuth. Social Post Studio can later publish using these approved connections.</p></div>
    <div className="admin-surface flex items-start gap-3 p-4"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-primary"/><div><div className="text-sm font-semibold">Secure server-side connections</div><p className="mt-1 text-xs leading-5 text-muted-foreground">OAuth tokens are encrypted before database storage and never returned to the admin browser.</p></div></div>
    {notice && <div className="admin-surface p-4 text-sm">{notice}</div>}
    {loading ? <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 size={16} className="animate-spin"/>Loading integrations...</div> : <div className="grid gap-4 xl:grid-cols-3">{Object.entries(META).map(([platform, meta]) => {
      const item = byPlatform[platform] || { platform, status: "disconnected", accountOptions: [] };
      const Icon = meta.icon; const connected = item.status === "connected"; const isBusy = busy === platform;
      return <section key={platform} className="admin-surface p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted"><Icon size={20}/></div><Status value={item.status}/></div><h2 className="mt-5 text-lg font-bold">{meta.label}</h2><p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{meta.description}</p>
      {item.accountName && <div className="mt-4 rounded-xl border border-zinc-200/80 bg-muted/30 p-3 dark:border-zinc-800"><div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Connected account</div><div className="mt-1 text-sm font-semibold">{item.accountName}</div></div>}
      {platform === "facebook" && item.status === "needs_selection" && item.accountOptions?.length > 0 && <div className="mt-4"><label className="mb-1.5 block text-xs font-semibold">Choose Facebook Page</label><select defaultValue="" disabled={isBusy} onChange={(e) => choosePage(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-sm dark:border-zinc-800"><option value="">Select a Page...</option>{item.accountOptions.map((page) => <option key={page.id} value={page.id}>{page.name}</option>)}</select></div>}
      <div className="mt-5 flex gap-2">{connected ? <><button type="button" onClick={() => connect(platform)} disabled={isBusy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-bold transition hover:bg-muted disabled:opacity-50 dark:border-zinc-800">{isBusy ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}Reconnect</button><button type="button" onClick={() => disconnect(platform)} disabled={isBusy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-bold text-rose-600 dark:border-zinc-800"><Unplug size={14}/>Disconnect</button></> : <button type="button" onClick={() => connect(platform)} disabled={isBusy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground">{isBusy ? <Loader2 size={14} className="animate-spin"/> : <ExternalLink size={14}/>}Connect {meta.label}</button>}</div>
      {item.errorMessage && <p className="mt-3 text-xs leading-5 text-rose-600">{item.errorMessage}</p>}
      {connected && <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"><Check size={13}/>Ready for publishing</div>}
      </section>;
    })}</div>}
  </div>;
}
