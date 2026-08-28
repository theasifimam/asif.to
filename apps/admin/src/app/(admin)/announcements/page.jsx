"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Info,
  Megaphone,
  Save,
  ShieldAlert,
} from "lucide-react";
import { announcementsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const EMPTY = {
  enabled: false,
  type: "maintenance",
  title: "Scheduled maintenance",
  message: "asif.to will be temporarily unavailable while we perform maintenance.",
  details: "",
  linkLabel: "",
  linkUrl: "",
  eventStartsAt: "",
  eventEndsAt: "",
  visibleFrom: "",
  visibleUntil: "",
  dismissible: true,
};

const TYPES = [
  { value: "maintenance", label: "Maintenance", icon: CalendarClock },
  { value: "info", label: "Information", icon: Info },
  { value: "warning", label: "Warning", icon: AlertTriangle },
  { value: "success", label: "Resolved", icon: CheckCircle2 },
];

const TYPE_STYLES = {
  maintenance: {
    container:
      "border-purple-400/50 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/20",
    icon: "text-white",
    title: "text-white font-black",
    body: "text-white/90 font-medium",
    badge: "bg-black/25 text-white border border-white/25",
    link: "text-white hover:text-white/80",
  },
  info: {
    container:
      "border-blue-400/50 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20",
    icon: "text-white",
    title: "text-white font-black",
    body: "text-white/90 font-medium",
    badge: "bg-black/25 text-white border border-white/25",
    link: "text-white hover:text-white/80",
  },
  warning: {
    container:
      "border-amber-400/50 bg-gradient-to-r from-amber-600 via-amber-600 to-orange-700 text-white shadow-lg shadow-amber-600/20",
    icon: "text-white",
    title: "text-white font-black",
    body: "text-white/90 font-medium",
    badge: "bg-black/25 text-white border border-white/25",
    link: "text-white hover:text-white/80",
  },
  success: {
    container:
      "border-emerald-400/50 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20",
    icon: "text-white",
    title: "text-white font-black",
    body: "text-white/90 font-medium",
    badge: "bg-black/25 text-white border border-white/25",
    link: "text-white hover:text-white/80",
  },
};

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function formatSchedule(start, end) {
  if (!start && !end) return "No maintenance window added";
  const format = (value) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  if (start && end) return `${format(start)} – ${format(end)}`;
  return start ? `Starts ${format(start)}` : `Until ${format(end)}`;
}

export default function AnnouncementsPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let active = true;
    announcementsApi.get().then((response) => {
      if (!active) return;
      setLoading(false);
      if (!response.success) {
        toast.error(response.error || "Unable to load announcement settings");
        return;
      }
      const item = response.data?.data || {};
      setForm({
        ...EMPTY,
        ...item,
        eventStartsAt: toLocalInput(item.eventStartsAt),
        eventEndsAt: toLocalInput(item.eventEndsAt),
        visibleFrom: toLocalInput(item.visibleFrom),
        visibleUntil: toLocalInput(item.visibleUntil),
      });
      setLastUpdated(item.updatedAt || null);
    });
    return () => {
      active = false;
    };
  }, []);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectedType = TYPES.find((item) => item.value === form.type) || TYPES[0];
  const PreviewIcon = selectedType.icon;
  const schedule = useMemo(
    () => formatSchedule(form.eventStartsAt, form.eventEndsAt),
    [form.eventEndsAt, form.eventStartsAt],
  );

  const save = async () => {
    if (form.enabled && !form.title.trim() && !form.message.trim()) {
      toast.error("Add a title or message before publishing.");
      return;
    }
    setSaving(true);
    const response = await announcementsApi.save({
      ...form,
      eventStartsAt: toIso(form.eventStartsAt),
      eventEndsAt: toIso(form.eventEndsAt),
      visibleFrom: toIso(form.visibleFrom),
      visibleUntil: toIso(form.visibleUntil),
    });
    setSaving(false);
    if (!response.success) {
      toast.error(response.error || "Unable to save announcement");
      return;
    }
    const saved = response.data?.data || {};
    setLastUpdated(saved.updatedAt || new Date().toISOString());
    toast.success(form.enabled ? "Announcement published" : "Announcement saved and hidden");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
            Site communication
          </p>
          <h1 className="mt-1 font-outfit text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Header Announcement
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">
            Publish maintenance windows and important notices directly below the asif.to header.
          </p>
        </div>
        <Button onClick={save} disabled={loading || saving} className="h-10 rounded-full px-5 text-xs font-bold">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : form.enabled ? "Publish announcement" : "Save announcement"}
        </Button>
      </header>

      <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", form.enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900")}>
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black text-zinc-950 dark:text-white">Show on asif.to</p>
              <p className="text-xs text-zinc-500">Visibility dates below can publish and expire it automatically.</p>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {form.enabled ? "Published" : "Hidden"}
            <Switch checked={form.enabled} onCheckedChange={(checked) => set("enabled", checked)} />
          </label>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <h2 className="text-sm font-black text-zinc-950 dark:text-white">Announcement content</h2>
            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <Label>Announcement type</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TYPES.map(({ value, label, icon: Icon }) => (
                    <button key={value} type="button" onClick={() => set("type", value)} className={cn("flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-bold transition", form.type === value ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-500/10 dark:bg-violet-950/40 dark:text-violet-300" : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900")}>
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title ({form.title.length}/120)</Label>
                <Input maxLength={120} value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Scheduled maintenance" />
              </div>
              <div className="space-y-2">
                <Label>Short message ({form.message.length}/500)</Label>
                <Textarea maxLength={500} rows={3} value={form.message} onChange={(event) => set("message", event.target.value)} placeholder="Tell visitors what is happening and what to expect." />
              </div>
              <div className="space-y-2">
                <Label>More information ({form.details.length}/2000)</Label>
                <Textarea maxLength={2000} rows={5} value={form.details} onChange={(event) => set("details", event.target.value)} placeholder="Optional affected services, expected impact, support information, or updates." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Link label</Label>
                  <Input maxLength={60} value={form.linkLabel} onChange={(event) => set("linkLabel", event.target.value)} placeholder="Status updates" />
                </div>
                <div className="space-y-2">
                  <Label>Link URL</Label>
                  <Input maxLength={500} value={form.linkUrl} onChange={(event) => set("linkUrl", event.target.value)} placeholder="/status or https://status.asif.to" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-black text-zinc-950 dark:text-white">Maintenance and visibility schedule</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Maintenance dates appear to visitors. Visibility dates control when the banner itself is shown.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["eventStartsAt", "Maintenance starts"],
                ["eventEndsAt", "Maintenance ends"],
                ["visibleFrom", "Show banner from"],
                ["visibleUntil", "Hide banner after"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input type="datetime-local" value={form[key]} onChange={(event) => set(key, event.target.value)} />
                </div>
              ))}
            </div>
            <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4 text-xs font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <span>
                Let visitors dismiss this announcement
                <span className="mt-0.5 block font-medium text-zinc-500">An edited announcement will appear again even if an older version was dismissed.</span>
              </span>
              <Switch checked={form.dismissible} onCheckedChange={(checked) => set("dismissible", checked)} />
            </label>
          </section>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Live preview</p>
            {(() => {
              const previewStyles = TYPE_STYLES[form.type] || TYPE_STYLES.info;
              return (
                <div className={cn("mt-4 rounded-2xl border p-4 backdrop-blur-md transition-all duration-300", previewStyles.container)}>
                  <div className="flex gap-3">
                    <PreviewIcon className={cn("mt-0.5 h-5 w-5 shrink-0 font-bold", previewStyles.icon)} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-black tracking-tight", previewStyles.title)}>{form.title || "Announcement title"}</p>
                      <p className={cn("mt-1 text-xs leading-5 font-medium", previewStyles.body)}>{form.message || "Your announcement message will appear here."}</p>
                      {(form.eventStartsAt || form.eventEndsAt) && (
                        <p className={cn("mt-2.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide", previewStyles.badge)}>
                          {schedule}
                        </p>
                      )}
                      {form.details && (
                        <p className={cn("mt-2.5 whitespace-pre-line border-t border-black/10 pt-2 text-xs leading-5 font-medium dark:border-white/10", previewStyles.body)}>
                          {form.details}
                        </p>
                      )}
                      {form.linkUrl && (
                        <span className={cn("mt-2.5 inline-flex items-center gap-1 text-xs font-black underline underline-offset-2", previewStyles.link)}>
                          {form.linkLabel || "Learn more"}
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>

          <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 text-xs text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2 font-black text-zinc-900 dark:text-white"><ShieldAlert className="h-4 w-4 text-amber-500" /> Publishing behavior</div>
            <ul className="mt-3 space-y-2 leading-5">
              <li>• Empty visibility dates publish immediately and stay visible.</li>
              <li>• Times are entered in your current device timezone.</li>
              <li>• The public banner refreshes automatically while visitors browse.</li>
            </ul>
            {lastUpdated && <p className="mt-4 border-t border-zinc-100 pt-3 text-[10px] dark:border-zinc-800">Last saved {new Date(lastUpdated).toLocaleString()}</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}
