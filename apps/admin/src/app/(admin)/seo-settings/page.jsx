"use client";
import { useEffect, useState } from "react";
import { Save, SearchCheck } from "lucide-react";
import { toast } from "sonner";
import { seoSettingsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const KNOWN_PATHS = ["/practice", "/practice/javascript", "/practice/react", "/practice/html", "/practice/css", "/practice/web", "/practice/nextjs", "/cheatsheets"];
const empty = { path: "/practice", title: "", description: "", keywords: "", canonicalUrl: "", ogImage: "", noIndex: false };
export default function SeoSettingsPage() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(empty); const [saving, setSaving] = useState(false);
  useEffect(() => { seoSettingsApi.list().then((response) => { if (response.success) setItems(response.data?.data || []); else toast.error(response.error); }); }, []);
  const choose = (path) => { const item = items.find((entry) => entry.path === path); setForm(item ? { ...item, keywords: (item.keywords || []).join(", ") } : { ...empty, path }); };
  const save = async () => { setSaving(true); const response = await seoSettingsApi.save({ ...form, keywords: form.keywords.split(",").map((value) => value.trim()).filter(Boolean) }); setSaving(false); if (!response.success) return toast.error(response.error); const saved = response.data?.data; setItems((current) => [...current.filter((item) => item.path !== saved.path), saved].sort((a,b) => a.path.localeCompare(b.path))); toast.success("SEO settings saved"); };
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 md:p-8 font-sans">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          Search appearance
        </p>
        <h1 className="mt-1 font-outfit text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
          Route SEO Settings
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Override metadata for landing pages and code-defined routes. Content editors retain their own SEO fields.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="admin-surface rounded-3xl p-4 self-start">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Common Routes
          </p>
          <div className="space-y-1">
            {[...new Set([...KNOWN_PATHS, ...items.map((item) => item.path)])].map((path) => (
              <button
                key={path}
                onClick={() => choose(path)}
                className={`block w-full rounded-2xl px-3.5 py-2.5 text-left text-xs font-bold transition-all truncate ${
                  form.path === path
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {path}
              </button>
            ))}
          </div>
        </aside>

        <main className="admin-surface space-y-5 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <SearchCheck className="h-4.5 w-4.5" />
            </div>
            <h2 className="font-outfit text-lg font-black text-zinc-950 dark:text-white">
              Metadata Override
            </h2>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Route Path</Label>
            <Input
              value={form.path}
              onChange={(e) => setForm((v) => ({ ...v, path: e.target.value }))}
              placeholder="/practice/javascript/problem-slug"
              className="rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b] h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              SEO Title ({form.title.length}/70)
            </Label>
            <Input
              maxLength={70}
              value={form.title}
              onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
              className="rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b] h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              SEO Description ({form.description.length}/170)
            </Label>
            <Textarea
              maxLength={170}
              rows={4}
              value={form.description}
              onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
              className="rounded-2xl border-zinc-200/80 bg-zinc-50/80 p-4 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Keywords</Label>
            <Input
              value={form.keywords}
              onChange={(e) => setForm((v) => ({ ...v, keywords: e.target.value }))}
              placeholder="javascript, coding practice"
              className="rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b] h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Canonical URL</Label>
            <Input
              value={form.canonicalUrl}
              onChange={(e) => setForm((v) => ({ ...v, canonicalUrl: e.target.value }))}
              placeholder={`https://asif.to${form.path}`}
              className="rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b] h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Open Graph Image URL</Label>
            <Input
              value={form.ogImage}
              onChange={(e) => setForm((v) => ({ ...v, ogImage: e.target.value }))}
              className="rounded-full border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-medium dark:border-zinc-800/80 dark:bg-[#18181b] h-10"
            />
          </div>

          <label className="flex items-center gap-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.noIndex}
              onChange={(e) => setForm((v) => ({ ...v, noIndex: e.target.checked }))}
              className="h-4 w-4 rounded-md accent-blue-600"
            />
            Exclude this route from search engines (noindex)
          </label>

          <div className="pt-3">
            <Button
              onClick={save}
              disabled={saving}
              className="h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 shadow-xs"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? "Saving…" : "Save Metadata"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
