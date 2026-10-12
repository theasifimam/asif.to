"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { GraduationCap } from "lucide-react";

/**
 * Skill chips for the tech jobs page: pick one to see only jobs that ask for it.
 * Only skills that appear on live tech jobs are offered, with their job counts.
 */
export default function JobSkillFilters({ skills = [], searchParams = {}, path = "/jobs/tech" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!skills.length) return null;
  const active = searchParams.skill || "";

  const choose = (id) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) if (value && key !== "skill" && key !== "page") query.set(key, String(value));
    if (id !== active) query.set("skill", id);
    startTransition(() => router.push(query.toString() ? `${path}?${query}` : path));
  };

  return (
    <div className={`mb-4 rounded-3xl border border-zinc-200 bg-white p-4 transition-opacity dark:border-zinc-800 dark:bg-zinc-900 ${pending ? "opacity-60" : ""}`}>
      <p className="text-[11px] font-black uppercase tracking-wide text-zinc-400">Filter by skill</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Skills">
        {skills.map((skill) => {
          const on = active === skill.id;
          return (
            <button
              key={skill.id}
              type="button"
              aria-pressed={on}
              onClick={() => choose(skill.id)}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition ${on ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 text-zinc-700 hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-200"}`}
            >
              {skill.label}
              <span className={`text-[10px] ${on ? "text-blue-100" : "text-zinc-400"}`}>{skill.count}</span>
            </button>
          );
        })}
      </div>
      <Link href="/courses" className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:underline">
        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> Missing a skill? Learn it free on asif.to
      </Link>
    </div>
  );
}
