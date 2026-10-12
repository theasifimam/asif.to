"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleDashed, GraduationCap, Target } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

const BANDS = {
  strong: { label: "Strong match", bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
  good: { label: "Good match", bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
  partial: { label: "Partial match", bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  low: { label: "Early stage", bar: "bg-zinc-400", text: "text-zinc-600 dark:text-zinc-300" },
};

/**
 * "How do I fit this job?" for the skills asif.to teaches. Rendered only for jobs that
 * have learning content (technical roles). Guests are invited to sign in; members see
 * their score, can mark skills they already have, and get a course link for each gap.
 */
export default function JobMatchCard({ slug, learning }) {
  const { isAuthenticated, requireAuth } = useAuthPrompt();
  const [match, setMatch] = useState(null);
  const [editing, setEditing] = useState(false);
  const [picked, setPicked] = useState([]);
  const [saving, setSaving] = useState(false);
  const applicable = Boolean(learning?.items?.length);

  const load = useCallback(() => {
    api.get(`/jobs/slug/${encodeURIComponent(slug)}/match`)
      .then(({ data }) => setMatch(data?.data || null))
      .catch(() => setMatch(null));
  }, [slug]);

  useEffect(() => {
    if (applicable && isAuthenticated) load();
  }, [applicable, isAuthenticated, load]);

  if (!applicable) return null;

  if (!isAuthenticated) {
    return (
      <section className="mt-7 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"><Target className="h-5 w-5" aria-hidden="true" /></span>
          <div className="min-w-0">
            <h2 className="font-outfit text-base font-black">How well do you fit this role?</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">Sign in to see your skill match and exactly which skills to learn next.</p>
            <button type="button" onClick={() => requireAuth()} className="mt-3 min-h-9 rounded-full bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-500">Sign in to see my match</button>
          </div>
        </div>
      </section>
    );
  }

  if (!match?.applicable) return null;
  const band = BANDS[match.band] || BANDS.low;

  const startEditing = () => { setPicked(match.picker.filter((option) => option.selected).map((option) => option.id)); setEditing(true); };
  const toggle = (id) => setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const save = async () => {
    setSaving(true);
    try {
      await api.put("/jobs/me/skills", { skills: picked });
      load();
      setEditing(false);
      toast.success("Skills updated");
    } catch {
      toast.error("Couldn't save your skills. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="job-match-heading" className="mt-7 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="job-match-heading" className="font-outfit text-base font-black">Your skill match</h2>
          <p className={`mt-0.5 text-xs font-black ${band.text}`}>{band.label} · {match.haveCount} of {match.total} skills</p>
        </div>
        <p className="font-outfit text-3xl font-black tabular-nums" aria-hidden="true">{match.percent}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={match.percent} aria-label={`Skill match ${match.percent} percent`}>
        <div className={`h-full rounded-full ${band.bar} transition-all`} style={{ width: `${match.percent}%` }} />
      </div>

      <ul className="mt-4 space-y-2">
        {match.skills.map((skill) => (
          <li key={skill.id} className="flex items-center gap-2.5 text-sm">
            {skill.status === "have"
              ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="You have this skill" />
              : <CircleDashed className={`h-4 w-4 shrink-0 ${skill.status === "learning" ? "text-amber-500" : "text-zinc-300"}`} aria-label={skill.status === "learning" ? "In progress" : "Not yet"} />}
            <span className="min-w-0 flex-1">
              <span className="font-semibold">{skill.label}</span>
              {skill.source && <span className="ml-2 text-[11px] text-zinc-500">{skill.source}</span>}
            </span>
            {skill.status !== "have" && skill.courseHref && (
              <Link href={skill.courseHref} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300">
                <GraduationCap className="h-3 w-3" aria-hidden="true" /> {skill.status === "learning" ? "Continue" : "Learn"}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {editing ? (
        <div className="mt-4 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-950">
          <p className="text-xs font-bold">Select the skills you already have</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {match.picker.map((option) => (
              <button key={option.id} type="button" aria-pressed={picked.includes(option.id)} onClick={() => toggle(option.id)}
                className={`min-h-8 rounded-full border px-3 text-xs font-bold ${picked.includes(option.id) ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"}`}>
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={save} disabled={saving} className="min-h-9 rounded-full bg-blue-600 px-4 text-xs font-black text-white disabled:opacity-60">{saving ? "Saving…" : "Save skills"}</button>
            <button type="button" onClick={() => setEditing(false)} className="min-h-9 rounded-full px-4 text-xs font-bold text-zinc-500">Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={startEditing} className="mt-4 text-xs font-black text-blue-600 hover:underline">Edit the skills I have</button>
      )}
      <p className="mt-3 text-[11px] leading-4 text-zinc-400">A guide based on the skills this posting mentions and what you tell us. It is not a hiring prediction.</p>
    </section>
  );
}
