"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Layers3 } from "lucide-react";
import { format } from "date-fns";
import { getTopicHref } from "../homeUtils";

export default function HomeTopicGuides({ displayTopics = [] }) {
  if (displayTopics.length === 0) return null;

  return (
    <section id="topics" className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Layers3 className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
              Topic Deep Dives
            </span>
          </div>
          <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
            Featured Guides & Concepts
          </h2>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Focused conceptual guides, architecture breakdowns, and step-by-step
            topics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2 min-w-0">
        {displayTopics.map((topic) => {
          const topicUrl = getTopicHref(topic);
          return (
            <Link
              key={topic._id || topic.slug}
              href={topicUrl}
              className="group flex flex-col justify-between rounded-4xl sm:rounded-[2.5rem] border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-zinc-900/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all min-w-0 overflow-hidden"
            >
              <div>
                {/* Top Row: Icon Glow Badge + Category/Course Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Layers3 className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1.5 min-w-0">
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {topic.type === "interview" ? "Interview Q&A" : "Guide"}
                    </span>
                    {topic.course?.title && (
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 px-2.5 py-0.5 text-[9.5px] font-bold text-zinc-600 dark:text-zinc-300 truncate max-w-32.5 xs:max-w-[170px]">
                        {topic.course.title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-outfit text-base sm:text-lg font-black leading-snug text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mt-4">
                  {topic.title}
                </h3>

                {topic.excerpt && (
                  <p className="line-clamp-2 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
                    {topic.excerpt}
                  </p>
                )}
              </div>

              {/* Bottom Divider Row */}
              <div className="mt-5 pt-3 border-t border-emerald-500/15 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
                <span className="inline-flex items-center gap-1">
                  <span>
                    {topic.type === "interview" ? "Explore Q&A" : "Read Guide"}
                  </span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                {topic.publishedAt && (
                  <span className="text-zinc-400 font-medium text-[10px]">
                    {format(
                      new Date(topic.publishedAt || topic.createdAt),
                      "MMM d, yyyy",
                    )}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
