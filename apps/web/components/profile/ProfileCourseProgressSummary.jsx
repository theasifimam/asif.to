"use client";

// ASIF_COURSE_LEARNING_FLOW_V1
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProfileCourseProgressSummary() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    if (!API) return;
    try {
      const response = await fetch(
        `${API.replace(/\/$/, "")}/courses/progress/me/summary`,
        { credentials: "include", cache: "no-store" }
      );
      if (!response.ok) return;
      const body = await response.json();
      setData(body?.data || null);
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("asif-course-progress-updated", refresh);
    return () =>
      window.removeEventListener("asif-course-progress-updated", refresh);
  }, [load]);

  if (!data?.courses?.length) return null;

  return (
    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Active Learning Progress
          </span>
        </div>
        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
          {data.overallProgress || 0}% Overall
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {data.courses.slice(0, 2).map((course) => (
          <div
            key={course.course?._id}
            className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 p-3 border border-zinc-100 dark:border-zinc-800/60 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/courses/${course.course?.slug}`}
                className="min-w-0 truncate text-xs font-black text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {course.course?.title}
              </Link>
              <span className="text-xs font-bold text-zinc-500">
                {course.overallProgress || 0}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${course.overallProgress || 0}%` }}
              />
            </div>

            {course.nextAction && (
              <Link
                href={course.nextAction.href}
                className="mt-2 inline-flex text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline truncate"
              >
                Continue &middot; {course.nextAction.chapter?.title} &rarr;
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
