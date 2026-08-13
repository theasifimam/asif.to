"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, Loader2, Plus, Search, X } from "lucide-react";
import { interviewQuestionsApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FollowUpQuestionPicker({ course, value, onChange, excludeId }) {
  const [resource, setResource] = useState({ course: "", questions: [] });
  const [search, setSearch] = useState("");
  const selected = useMemo(() => String(value || "").split("\n").map((item) => item.trim()).filter(Boolean), [value]);
  const questions = resource.course === course ? resource.questions : [];
  const loading = Boolean(course) && resource.course !== course;

  useEffect(() => {
    if (!course) return undefined;
    let active = true;
    interviewQuestionsApi.list({ course, limit: 100 }).then((response) => {
      if (active) setResource({ course, questions: (response.data?.data || []).filter((item) => item._id !== excludeId) });
    });
    return () => { active = false; };
  }, [course, excludeId]);

  const available = questions.filter((item) => !selected.includes(item.question) && item.question.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 8);
  const setSelected = (items) => onChange(items.join("\n"));
  const add = (question) => {
    setSelected([...selected, question]);
    setSearch("");
  };

  return <div className="space-y-3">
    <div>
      <Label>Linked follow-up questions</Label>
      <p className="mt-1 text-xs leading-5 text-zinc-500">Select existing questions from this course. Their titles are stored exactly, allowing the public interview guide to link directly to their answers.</p>
    </div>
    {!course ? <p className="rounded-2xl bg-amber-50 p-3 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Select a course before adding linked questions.</p> : <>
      {selected.length > 0 && <div className="space-y-2">{selected.map((question) => {
        const linked = questions.some((item) => item.question === question);
        return <div key={question} className="flex items-start gap-2 rounded-xl bg-zinc-100 px-3 py-2.5 text-sm dark:bg-zinc-900"><Link2 className={`mt-0.5 h-4 w-4 shrink-0 ${linked ? "text-emerald-600" : "text-zinc-400"}`} /><span className="min-w-0 flex-1 leading-5">{question}</span><button type="button" aria-label={`Remove ${question}`} onClick={() => setSelected(selected.filter((item) => item !== question))} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-200 hover:text-red-500 dark:hover:bg-zinc-800"><X className="h-4 w-4" /></button></div>;
      })}</div>}
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this course’s questions…" className="pl-9" />{loading && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-zinc-400" />}</div>
      {search.trim() && !loading && <div className="max-h-72 overflow-y-auto rounded-2xl border border-zinc-200 p-1 dark:border-zinc-800">{available.length ? available.map((item) => <button key={item._id} type="button" onClick={() => add(item.question)} className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"><Plus className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /><span>{item.question}</span></button>) : <p className="p-3 text-sm text-zinc-500">No unselected question matches.</p>}</div>}
    </>}
    <details className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800"><summary className="cursor-pointer text-xs font-semibold text-zinc-600 dark:text-zinc-300">Advanced: edit or add unlinked follow-up text</summary><Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={6} placeholder="One question per line" className="mt-3" /><p className="mt-2 text-xs text-zinc-500">A manual entry becomes a hyperlink only when it exactly matches an existing question title in the same course.</p></details>
  </div>;
}
