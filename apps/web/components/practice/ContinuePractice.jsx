"use client";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { ArrowRight, History } from "lucide-react";
import { RECENT_PRACTICE_KEY } from "@/lib/playground/client";
export default function ContinuePractice() {
  const stored = useSyncExternalStore(() => () => {}, () => localStorage.getItem(RECENT_PRACTICE_KEY) || "", () => "");
  const recent = useMemo(() => { try { return JSON.parse(stored); } catch { return null; } }, [stored]);
  if (!recent?.href) return null;
  return <section className="mb-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5" aria-labelledby="continue-title"><div className="flex items-center gap-2 text-blue-600"><History className="h-4 w-4"/><h2 id="continue-title" className="text-sm font-black">Continue practicing</h2></div><div className="mt-3 flex items-end justify-between gap-4"><div><p className="font-black">{recent.title}</p><p className="mt-1 text-xs capitalize text-zinc-500">{recent.language}</p></div><Link href={recent.href} className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white">Continue <ArrowRight className="h-3.5 w-3.5"/></Link></div></section>;
}
