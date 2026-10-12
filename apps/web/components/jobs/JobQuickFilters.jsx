"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * One-tap filters for what UAE job seekers ask for most (visa, walk-in, Arabic,
 * graduate, urgent). Toggles the comma-separated `tag` URL parameter and keeps every
 * other filter; tags with no live jobs are hidden unless already selected.
 */
export default function JobQuickFilters({ tags = [], searchParams = {}, path = "/jobs" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active = new Set(String(searchParams.tag || "").split(",").filter(Boolean));
  const visible = tags.filter((tag) => tag.count > 0 || active.has(tag.id));
  if (!visible.length) return null;

  const toggle = (id) => {
    const next = new Set(active);
    if (next.has(id)) next.delete(id); else next.add(id);
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) if (value && key !== "tag" && key !== "page") query.set(key, String(value));
    if (next.size) query.set("tag", [...next].join(","));
    startTransition(() => router.push(query.toString() ? `${path}?${query}` : path));
  };

  return (
    <div className={`mb-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none transition-opacity sm:flex-wrap sm:overflow-visible sm:pb-0 ${pending ? "opacity-60" : ""}`} role="group" aria-label="Quick filters">
      {visible.map((tag) => {
        const on = active.has(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(tag.id)}
            className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-bold transition ${
              on
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            }`}
          >
            {tag.label}
            {tag.count > 0 && <span className={`text-[10px] ${on ? "text-blue-100" : "text-zinc-400"}`}>{tag.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
