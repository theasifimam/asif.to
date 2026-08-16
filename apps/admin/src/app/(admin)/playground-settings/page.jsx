"use client";

import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import { playgroundSettingsApi } from "@/lib/api";
import { Switch } from "@/components/ui/switch";

const LANGUAGES = [
  "javascript",
  "typescript",
  "html",
  "css",
  "web",
  "react",
  "react-typescript",
  "nextjs",
  "python",
  "c",
  "cpp",
  "java",
];

const RUNTIMES = ["sandpack", "python", "clang", "java", "nextjs"];

const title = (id) =>
  ({
    cpp: "C++",
    react: "React",
    "react-typescript": "React + TypeScript",
    nextjs: "Next.js",
    web: "HTML + CSS + JavaScript",
  }[id] || id[0].toUpperCase() + id.slice(1));

export default function PlaygroundSettingsPage() {
  const [form, setForm] = useState();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    playgroundSettingsApi.get().then((r) => r.success && setForm(r.data?.data));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (status) => {
    setBusy(true);
    const r = await playgroundSettingsApi.save({ ...form, status });
    setBusy(false);
    setNotice(
      r.success
        ? status === "draft"
          ? "Draft saved."
          : "Published."
        : r.error
    );
    if (r.success) setForm(r.data?.data);
  };

  const publish = async () => {
    setBusy(true);
    const saved = await playgroundSettingsApi.save({ ...form, status: "draft" });
    if (!saved.success) {
      setBusy(false);
      setNotice(saved.error);
      return;
    }
    const r = await playgroundSettingsApi.publish();
    setBusy(false);
    setNotice(r.success ? "Published configuration is live." : r.error);
    if (r.success) setForm(r.data?.data);
  };

  if (!form) {
    return (
      <div className="p-8 text-sm text-zinc-500 dark:text-zinc-400">
        Loading playground controls…
      </div>
    );
  }

  const languages = form.languages || {};

  return (
    <div className="space-y-6 px-4 py-6 sm:p-6 pb-12 text-zinc-900 dark:text-zinc-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
            Code Playground Control
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Control availability without redeploying the web app.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-fit rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
          <button
            disabled={busy}
            onClick={() => save("draft")}
            className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#121215] dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save size={14} /> Save draft
          </button>
          <button
            disabled={busy}
            onClick={publish}
            className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            <Upload size={14} /> Publish
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-sm text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-300">
          {notice}
        </div>
      )}

      {/* Emergency Controls */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-[#121215]">
        <h2 className="font-black text-zinc-900 dark:text-white text-base">
          Emergency controls
        </h2>
        <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-6">
          <label className="flex items-center justify-between sm:justify-start sm:gap-3 text-sm font-semibold select-none cursor-pointer w-full sm:w-auto">
            <span>Editor enabled</span>
            <Switch
              className="sm:order-first"
              checked={form.editorEnabled}
              onCheckedChange={(checked) => set("editorEnabled", checked)}
            />
          </label>
          <label className="flex items-center justify-between sm:justify-start sm:gap-3 text-sm font-semibold select-none cursor-pointer w-full sm:w-auto">
            <span>Execution enabled</span>
            <Switch
              className="sm:order-first"
              checked={form.executionEnabled}
              onCheckedChange={(checked) => set("executionEnabled", checked)}
            />
          </label>
        </div>
        <textarea
          className="mt-4 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          rows="2"
          value={form.maintenanceMessage || ""}
          onChange={(e) => set("maintenanceMessage", e.target.value)}
          placeholder="Maintenance message"
        />
      </section>

      {/* Languages */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-[#121215]">
        <h2 className="font-black text-zinc-900 dark:text-white text-base">
          Languages
        </h2>
        <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {LANGUAGES.map((id) => {
            const item = languages[id] || {};
            const patch = (key, value) =>
              set("languages", {
                ...languages,
                [id]: { ...item, [key]: value },
              });

            return (
              <div
                className="grid gap-4 py-4 md:grid-cols-[1fr_auto_auto_auto] items-center"
                key={id}
              >
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white text-sm">
                    {item.label || title(id)}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                    {id}
                  </p>
                </div>
                <label className="flex items-center justify-between sm:justify-start sm:gap-3 text-sm font-semibold select-none cursor-pointer w-full sm:w-auto">
                  <span>Available</span>
                  <Switch
                    className="sm:order-first"
                    checked={item.enabled !== false}
                    onCheckedChange={(checked) => patch("enabled", checked)}
                  />
                </label>
                <label className="flex items-center justify-between sm:justify-start sm:gap-3 text-sm font-semibold select-none cursor-pointer w-full sm:w-auto">
                  <span>Selectable</span>
                  <Switch
                    className="sm:order-first"
                    checked={item.selectable !== false}
                    onCheckedChange={(checked) => patch("selectable", checked)}
                  />
                </label>
                <label className="flex items-center justify-between sm:justify-start sm:gap-3 text-sm font-semibold select-none cursor-pointer w-full sm:w-auto">
                  <span>Can run</span>
                  <Switch
                    className="sm:order-first"
                    checked={item.executionEnabled !== false}
                    onCheckedChange={(checked) =>
                      patch("executionEnabled", checked)
                    }
                  />
                </label>
                <div className="md:col-span-4 mt-1">
                  <label className="flex flex-col gap-2 text-xs font-semibold cursor-pointer w-full">
                    <span className="text-zinc-500 dark:text-zinc-400">Initial Code Override</span>
                    <textarea
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 font-mono"
                      rows="3"
                      value={item.initialCode || ""}
                      onChange={(e) => patch("initialCode", e.target.value)}
                      placeholder={`Leave blank to use default template for ${title(id)}`}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Runtime Circuit Breakers */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-[#121215]">
        <h2 className="font-black text-zinc-900 dark:text-white text-base">
          Runtime circuit breakers
        </h2>
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
          {RUNTIMES.map((id) => (
            <label
              className="flex items-center justify-between sm:justify-start sm:gap-3 text-sm font-semibold select-none cursor-pointer w-full sm:w-auto"
              key={id}
            >
              <span>{title(id)}</span>
              <Switch
                className="sm:order-first"
                checked={form.runtimes?.[id] !== false}
                onCheckedChange={(checked) =>
                  set("runtimes", { ...form.runtimes, [id]: checked })
                }
              />
            </label>
          ))}
        </div>
      </section>

      {/* Editor Features */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-[#121215]">
        <h2 className="font-black text-zinc-900 dark:text-white text-base">
          Editor features
        </h2>
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6">
          {Object.entries(form.features || {}).map(([id, value]) => (
            <label
              className="flex items-center justify-between sm:justify-start sm:gap-3 text-sm font-semibold select-none cursor-pointer w-full sm:w-auto"
              key={id}
            >
              <span>{title(id)}</span>
              <Switch
                className="sm:order-first"
                checked={value !== false}
                onCheckedChange={(checked) =>
                  set("features", { ...form.features, [id]: checked })
                }
              />
            </label>
          ))}
        </div>
      </section>

      {/* Execution Limits */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-[#121215]">
        <h2 className="font-black text-zinc-900 dark:text-white text-base">
          Execution limits
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {Object.entries(form.limits || {}).map(([key, value]) => (
            <label
              className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex flex-col gap-1.5"
              key={key}
            >
              {key}
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-sm font-normal text-zinc-900 outline-none focus-visible:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                type="number"
                value={value}
                onChange={(e) =>
                  set("limits", {
                    ...form.limits,
                    [key]: Number(e.target.value),
                  })
                }
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
