"use client";
// ASIF_COURSE_LEARNING_FLOW_V1
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL;
export default function ContinueCoursePill() {
  const [current, setCurrent] = useState(null);
  const load = useCallback(async () => { if (!API) return; try { const response = await fetch(`${API.replace(/\/$/, "")}/courses/progress/me/summary`, { credentials: "include", cache: "no-store" }); if (!response.ok) { setCurrent(null); return; } const body = await response.json(); setCurrent(body?.data?.current || null); } catch { setCurrent(null); } }, []);
  useEffect(() => { load(); const refresh = () => load(); window.addEventListener("asif-course-progress-updated", refresh); return () => window.removeEventListener("asif-course-progress-updated", refresh); }, [load]);
  if (!current?.nextAction) return null;
  return <Link href={current.nextAction.href} title={`Continue ${current.course?.title || "learning"}`} className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-100 px-1.5 text-[10px] font-black text-zinc-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 sm:px-2.5"><span className="grid h-6 min-w-6 place-items-center rounded-full bg-blue-600 px-1 text-[9px] text-white">{current.overallProgress || 0}%</span><span className="hidden xl:inline max-w-32 truncate">Continue {current.nextAction.chapter?.title}</span></Link>;
}
