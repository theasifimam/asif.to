"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Globe2, Image, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { siteSettingsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SOCIALS = [
  "github",
  "linkedin",
  "instagram",
  "youtube",
  "twitter",
  "facebook",
];
const empty = (site) => ({
  site,
  title: "",
  tagline: "",
  description: "",
  logoUrl: "",
  faviconUrl: "",
  websiteUrl: "",
  supportEmail: "",
  social: Object.fromEntries(SOCIALS.map((key) => [key, ""])),
});

const SITES = [
  { site: "public", label: "asif.to", icon: Globe2, detail: "Public website" },
  {
    site: "admin",
    label: "admin.asif.to",
    icon: ShieldCheck,
    detail: "Control panel",
  },
];

function SiteSettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSiteParam = searchParams.get("site") || "public";
  const activeSite = activeSiteParam === "admin" ? "admin" : "public";

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty(activeSite));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    siteSettingsApi.list().then((response) => {
      if (response.success) {
        const values = response.data?.data || [];
        setItems(values);
        setForm(
          values.find((item) => item.site === activeSite) || empty(activeSite),
        );
      } else {
        toast.error(response.error || "Unable to load site settings");
      }
    });
  }, [activeSite]);

  useEffect(() => {
    if (items.length > 0) {
      setForm(
        items.find((item) => item.site === activeSite) || empty(activeSite),
      );
    } else {
      setForm(empty(activeSite));
    }
  }, [activeSite, items]);

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const setSocial = (field, value) =>
    setForm((current) => ({
      ...current,
      social: { ...current.social, [field]: value },
    }));

  const handleSelectTab = (targetSite) => {
    router.push(`/site-settings?site=${targetSite}`, { scroll: false });
  };

  const save = async () => {
    setSaving(true);
    const response = await siteSettingsApi.save(form);
    setSaving(false);
    if (!response.success)
      return toast.error(response.error || "Unable to save site settings");
    setItems((current) => [
      ...current.filter((item) => item.site !== form.site),
      response.data.data,
    ]);
    toast.success(
      `${form.site === "public" ? "asif.to" : "admin.asif.to"} settings saved`,
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 font-sans sm:p-6 md:p-8">
      {/* Page Header */}
      <header className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          System pages
        </p>
        <h1 className="font-outfit text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
          Site & brand control
        </h1>
        <p className="max-w-2xl text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Update the identity shown across asif.to and the admin control panel.
          Changes are used by public metadata and brand surfaces.
        </p>
      </header>

      {/* Top Horizontal Layout Tabs for Switch Navigation */}
      <div className="inline-flex max-w-full flex-wrap items-center gap-1 p-1 overflow-x-auto">
        {SITES.map(({ site, label, icon: Icon, detail }) => {
          const isActive = activeSite === site;
          return (
            <button
              key={site}
              type="button"
              onClick={() => handleSelectTab(site)}
              className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span>{label}</span>
                <span
                  className={`text-[10px] font-semibold ${
                    isActive
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  ({detail})
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Settings Form Body */}
      <main className="space-y-7 rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-8 dark:border-zinc-800/80 dark:bg-[#121215] shadow-xs">
        {/* Identity Section */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-blue-600" />
            <h2 className="font-outfit text-lg font-black text-zinc-950 dark:text-white">
              Identity ({activeSite === "public" ? "asif.to" : "admin.asif.to"})
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["title", "Title"],
              ["tagline", "Tagline"],
              ["logoUrl", "Logo URL"],
              ["faviconUrl", "Favicon URL"],
              ["websiteUrl", "Website URL"],
              ["supportEmail", "Support email"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-2">
                <Label className="text-xs font-bold">{label}</Label>
                <Input
                  value={form[field] || ""}
                  onChange={(e) => setField(field, e.target.value)}
                  placeholder={field.includes("Url") ? "https://..." : ""}
                  className="h-10 rounded-full bg-zinc-50/80 text-xs dark:bg-[#18181b] border-zinc-200/80 dark:border-zinc-800"
                />
              </div>
            ))}

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold">Description</Label>
              <Textarea
                rows={3}
                value={form.description || ""}
                onChange={(e) => setField("description", e.target.value)}
                className="rounded-2xl bg-zinc-50/80 text-xs dark:bg-[#18181b] border-zinc-200/80 dark:border-zinc-800"
              />
            </div>
          </div>
        </section>

        {/* Social Profiles Section */}
        <section className="border-t border-zinc-100 pt-6 dark:border-zinc-800 space-y-4">
          <div>
            <h2 className="font-outfit text-lg font-black text-zinc-950 dark:text-white">
              Social profiles
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Use full profile URLs. Empty fields are hidden wherever social
              links are rendered.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {SOCIALS.map((field) => (
              <div key={field} className="space-y-2">
                <Label className="text-xs font-bold capitalize">
                  {field === "twitter" ? "X / Twitter" : field}
                </Label>
                <Input
                  value={form.social?.[field] || ""}
                  onChange={(e) => setSocial(field, e.target.value)}
                  placeholder={`https://${field}.com/...`}
                  className="h-10 rounded-full bg-zinc-50/80 text-xs dark:bg-[#18181b] border-zinc-200/80 dark:border-zinc-800"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <Button
            onClick={save}
            disabled={saving}
            className="h-10 rounded-full bg-blue-600 px-6 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function SiteSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-xs font-bold text-zinc-400">
          Loading settings...
        </div>
      }
    >
      <SiteSettingsContent />
    </Suspense>
  );
}
