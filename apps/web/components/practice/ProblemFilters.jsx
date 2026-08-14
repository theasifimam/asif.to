"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { DIFFICULTIES } from "@/lib/playground/config";

const difficultyStyle = { Easy: "text-emerald-600 bg-emerald-500/10", Medium: "text-amber-600 bg-amber-500/10", Hard: "text-red-600 bg-red-500/10" };

export default function ProblemFilters({ problems, technology, topics, initialTopic = "All", initialDifficulty = "All", initialQuery = "" }) {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [query, setQuery] = useState(initialQuery);
  useEffect(() => {
    const params = new URLSearchParams();
    if (topic !== "All") params.set("topic", topic); if (difficulty !== "All") params.set("difficulty", difficulty); if (query) params.set("q", query);
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
  }, [topic, difficulty, query]);
  const visible = useMemo(() => problems.filter((problem) =>
    (topic === "All" || problem.topics.includes(topic)) &&
    (difficulty === "All" || problem.difficulty === difficulty) &&
    problem.title.toLowerCase().includes(query.toLowerCase())), [problems, topic, difficulty, query]);

  return (
    <div>
      <div className="mb-6 grid gap-3 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-3">
        <label className="relative"><span className="sr-only">Search problems</span><Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search problems" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950" /></label>
        <select aria-label="Filter by topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"><option>All</option>{topics.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"><option>All</option>{DIFFICULTIES.map((value) => <option key={value}>{value}</option>)}</select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((problem) => <Link key={problem.slug} href={`/practice/${technology}/${problem.slug}`} className="group rounded-3xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-4"><div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${difficultyStyle[problem.difficulty]}`}>{problem.difficulty}</span><h2 className="mt-3 text-lg font-black">{problem.title}</h2></div><ArrowRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-blue-500" /></div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{problem.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">{problem.topics.map((value) => <span key={value} className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{value}</span>)}</div>
        </Link>)}
      </div>
      {!visible.length && <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700"><p>No problems match these filters.</p><button type="button" onClick={() => { setTopic("All"); setDifficulty("All"); setQuery(""); }} className="mt-3 font-bold text-blue-600 hover:underline">Clear filters</button></div>}
    </div>
  );
}
