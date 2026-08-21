"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { socialIntegrationsApi } from "@/lib/api";
import SocialMediaTabs from "@/components/social-posts/SocialMediaTabs";
import { AdminPage, AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const META = {
  instagram: {
    label: "Instagram",
    description:
      "Connect a professional Instagram account for image and carousel publishing.",
    icon: Instagram,
  },
  facebook: {
    label: "Facebook",
    description:
      "Connect Facebook and choose the Page admin.asif.to should publish to.",
    icon: Facebook,
  },
  linkedin: {
    label: "LinkedIn",
    description:
      "Connect your LinkedIn account for developer and educational posts.",
    icon: Linkedin,
  },
};

function StatusBadge({ value }) {
  const connected = value === "connected";
  const selection = value === "needs_selection";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        connected
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20"
          : selection
            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20"
            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected
            ? "bg-emerald-500"
            : selection
              ? "bg-amber-500"
              : "bg-zinc-400"
        }`}
      />
      {connected ? "Connected" : selection ? "Choose Page" : "Not connected"}
    </span>
  );
}

export default function SocialIntegrationsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const byPlatform = useMemo(
    () => Object.fromEntries(items.map((item) => [item.platform, item])),
    [items],
  );

  async function load() {
    setLoading(true);
    try {
      const result = await socialIntegrationsApi.list();
      setItems(Array.isArray(result?.data?.data) ? result.data.data : []);
    } catch (error) {
      console.error("Failed to load social integrations:", error);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status === "connected" && platform)
      setNotice(`${META[platform]?.label || platform} connected successfully.`);
    else if (status === "needs_selection")
      setNotice("Facebook connected. Choose the Page you want to publish to.");
    else if (status === "error")
      setNotice(message || "Social account connection failed.");
  }, [searchParams]);

  async function connect(platform) {
    setBusy(platform);
    setNotice("");
    try {
      const result = await socialIntegrationsApi.connect(platform);
      const url = result?.data?.data?.authUrl;
      if (!result?.success || !url)
        throw new Error(result?.error || "Could not start connection.");
      window.location.assign(url);
    } catch (error) {
      setNotice(error.message || "Could not start connection.");
      toast.error(error.message || "Could not start connection.");
      setBusy("");
    }
  }

  async function handleDisconnect() {
    if (!disconnectTarget) return;
    const platform = disconnectTarget;
    setDisconnecting(true);
    setBusy(platform);
    try {
      const result = await socialIntegrationsApi.disconnect(platform);
      if (!result?.success)
        throw new Error(result?.error || "Disconnect failed.");
      await load();
      const label = META[platform]?.label || platform;
      setNotice(`${label} disconnected.`);
      toast.success(`${label} disconnected.`);
      setDisconnectTarget(null);
    } catch (error) {
      setNotice(error.message || "Disconnect failed.");
      toast.error(error.message || "Disconnect failed.");
    } finally {
      setBusy("");
      setDisconnecting(false);
    }
  }

  async function choosePage(pageId) {
    if (!pageId) return;
    setBusy("facebook");
    try {
      const result = await socialIntegrationsApi.selectFacebookPage(pageId);
      if (!result?.success)
        throw new Error(result?.error || "Could not select Facebook Page.");
      await load();
      setNotice("Facebook Page selected successfully.");
      toast.success("Facebook Page selected successfully.");
    } catch (error) {
      setNotice(error.message || "Could not select Facebook Page.");
      toast.error(error.message || "Could not select Facebook Page.");
    } finally {
      setBusy("");
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Social Media & Publishing"
        title="Social Integrations"
        description="Manage connected accounts and authentication tokens used by Social Media publishing."
        back={
          <Link
            href="/social-posts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to social posts
          </Link>
        }
        actions={<SocialMediaTabs />}
      />

      <div className="admin-surface flex items-start gap-3.5 p-5 rounded-3xl sm:rounded-4xl shadow-xs">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white">
            Secure server-side connections
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            OAuth tokens are encrypted before database storage and never
            returned to the admin browser.
          </p>
        </div>
      </div>

      {notice && (
        <div className="admin-surface p-4 rounded-2xl text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 border-l-4 border-l-blue-600">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {Object.entries(META).map(([platform, meta]) => {
            const item = byPlatform[platform] || {
              platform,
              status: "disconnected",
              accountOptions: [],
            };
            const Icon = meta.icon;
            const connected = item.status === "connected";
            const isBusy = busy === platform;

            return (
              <section
                key={platform}
                className="admin-surface group flex flex-col justify-between p-6 rounded-3xl sm:rounded-4xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <StatusBadge value={item.status} />
                  </div>

                  <h2 className="mt-5 font-outfit text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                    {meta.label}
                  </h2>
                  <p className="mt-1.5 min-h-10 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                    {meta.description}
                  </p>

                  {item.accountName && (
                    <div className="mt-4 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60">
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Connected account
                      </div>
                      <div className="mt-1 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                        {item.accountName}
                      </div>
                    </div>
                  )}

                  {platform === "facebook" &&
                    item.status === "needs_selection" &&
                    item.accountOptions?.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Choose Facebook Page
                        </label>
                        <Select
                          defaultValue=""
                          disabled={isBusy}
                          onValueChange={(val) => choosePage(val)}
                        >
                          <SelectTrigger className="h-10 w-full rounded-xl border border-zinc-200 bg-white text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-950">
                            <SelectValue placeholder="Select a Page..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                            {item.accountOptions.map((page) => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex gap-2">
                    {connected ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => connect(platform)}
                          disabled={isBusy}
                          className="flex-1 rounded-xl text-xs font-bold"
                        >
                          {isBusy ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Reconnect
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setDisconnectTarget(platform)}
                          disabled={isBusy}
                          className="rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-950/50"
                        >
                          <Unplug className="mr-1.5 h-3.5 w-3.5" />
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => connect(platform)}
                        disabled={isBusy}
                        className="w-full rounded-xl text-xs font-bold shadow-md shadow-blue-500/10"
                      >
                        {isBusy ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Connect {meta.label}
                      </Button>
                    )}
                  </div>

                  {item.errorMessage && (
                    <p className="mt-3 text-xs leading-relaxed text-rose-600 dark:text-rose-400 font-medium">
                      {item.errorMessage}
                    </p>
                  )}

                  {connected && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      Ready for publishing
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(disconnectTarget)}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={handleDisconnect}
        loading={disconnecting}
        variant="destructive"
        title={`Disconnect ${META[disconnectTarget]?.label || disconnectTarget}?`}
        description="This will revoke social publishing tokens for this platform."
        confirmText="Disconnect account"
      />
    </AdminPage>
  );
}
