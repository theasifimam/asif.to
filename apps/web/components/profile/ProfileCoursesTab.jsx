"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, GraduationCap } from "lucide-react";

export default function ProfileCoursesTab({
  completedCourses = [],
}) {
  return (
    <div>
      <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span>Completed Courses ({completedCourses.length})</span>
      </h3>

      {completedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedCourses.map((course) => (
            <Link
              key={course._id || course}
              href={`/courses/${course.slug || course}`}
              className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col gap-3 hover:border-emerald-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-foreground leading-snug group-hover:text-emerald-600 transition-colors">
                  {course.title || "Course"}
                </h4>
                <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                  Completed
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-3 border border-zinc-100 dark:border-zinc-800">
          <GraduationCap className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
          <h3 className="font-extrabold text-base text-foreground">
            No Completed Courses Yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Complete a course and pass the final exam to see it appear here.
          </p>
          <Link
            href="/courses"
            className="mt-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
