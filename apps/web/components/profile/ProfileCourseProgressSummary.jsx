"use client";
// ASIF_COURSE_LEARNING_FLOW_V1
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL;
export default function ProfileCourseProgressSummary() {
  const [data, setData] = useState(null);
  const load = useCallback(async () => { if (!API) return; try { const response = await fetch(`${API.replace(/\/$/, "")}/courses/progress/me/summary`, { credentials: "include", cache: "no-store" }); if (!response.ok) return; const body = await response.json(); setData(body?.data || null); } catch {} }, []);
  useEffect(() => { load(); const refresh = () => load(); window.addEventListener("asif-course-progress-updated", refresh); return () => window.removeEventListener("asif-course-progress-updated", refresh); }, [load]);
  if (!data?.courses?.length) return null;
  return <section className="rounded-[2rem] border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/10 text-blue-600"><BookOpenCheck className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Learning</p><h2 className="text-sm font-black">Course progress</h2></div></div><span className="text-xl font-black">{data.overallProgress || 0}%</span></div><div className="mt-4 space-y-2">{data.courses.slice(0, 4).map((course) => <div key={course.course?._id} className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-950"><div className="flex items-center justify-between gap-3"><Link href={`/courses/${course.course?.slug}`} className="min-w-0 truncate text-xs font-black hover:text-blue-600">{course.course?.title}</Link><span className="text-xs font-black">{course.overallProgress || 0}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${course.overallProgress || 0}%` }} /></div>{course.nextAction && <Link href={course.nextAction.href} className="mt-2 inline-flex text-[10px] font-black text-blue-600 hover:underline">Continue · {course.nextAction.chapter?.title} →</Link>}</div>)}</div></section>;
}
