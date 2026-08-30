import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FileCode2,
  Flame,
  GraduationCap,
  MessageSquareText,
  Newspaper,
  Sparkles,
} from "lucide-react";

export default function RelatedContentBottom({
  relatedData,
  className = "",
}) {
  if (!relatedData) return null;

  const {
    currentCourse,
    relatedCourses = [],
    popularChapters = [],
    siblingCategories = [],
    cheatsheets = [],
    articles = [],
  } = relatedData;

  const activeCourse = currentCourse || (relatedCourses.length > 0 ? relatedCourses[0] : null);

  // If there's literally no related content to show, return null
  if (
    !activeCourse &&
    popularChapters.length === 0 &&
    siblingCategories.length === 0 &&
    cheatsheets.length === 0 &&
    articles.length === 0
  ) {
    return null;
  }

  return (
    <section
      className={`mt-14 border-t border-zinc-200/80 pt-10 dark:border-zinc-800/80 ${className}`}
      aria-label="Related study guides and course resources"
    >
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
        <Sparkles className="h-4 w-4" />
        <span>Explore Related Resources</span>
      </div>
      <h2 className="mt-2 text-xl font-black tracking-tight text-foreground sm:text-2xl">
        Continue Learning & Interview Prep
      </h2>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Recommended Course Card - Eye-Catching Bento Card */}
        {activeCourse && (
          <div className="group flex flex-col justify-between rounded-[2rem] sm:rounded-[2.5rem] border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-white dark:to-zinc-900/95 p-6 shadow-md hover:border-orange-500/50 hover:shadow-lg transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-300">
                  Recommended Track
                </span>
              </div>
              <h3 className="font-outfit text-lg font-black leading-snug text-zinc-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {activeCourse.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed font-medium text-zinc-600 dark:text-zinc-300 line-clamp-3">
                {activeCourse.subtitle}
              </p>
            </div>
            <Link
              href={`/courses/${encodeURIComponent(activeCourse.slug)}`}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 py-3 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Syllabus</span>
            </Link>
          </div>
        )}

        {/* Popular Lessons Bento Card */}
        {popularChapters.length > 0 && activeCourse && (
          <div className="group rounded-[2rem] sm:rounded-[2.5rem] border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-white dark:to-zinc-900/90 p-6 shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2 font-outfit text-sm font-black text-zinc-950 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Flame className="h-4 w-4" />
                </div>
                <span>Popular Lessons</span>
              </div>
              <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                {popularChapters.length} topics
              </span>
            </div>
            <ul className="mt-3.5 space-y-2.5">
              {popularChapters.slice(0, 4).map((chapter, idx) => (
                <li key={chapter._id || chapter.slug}>
                  <Link
                    href={`/${encodeURIComponent(activeCourse.slug)}/${encodeURIComponent(chapter.slug)}`}
                    className="group/item flex items-start gap-2.5 text-xs font-semibold text-zinc-700 transition hover:text-amber-600 dark:text-zinc-300 dark:hover:text-amber-400"
                  >
                    <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-[10px] font-black text-amber-700 group-hover/item:bg-amber-500 group-hover/item:text-white dark:bg-amber-500/20 dark:text-amber-300 dark:group-hover/item:text-white transition-colors">
                      {chapter.order ?? idx + 1}
                    </span>
                    <span className="line-clamp-2 leading-tight pt-0.5 font-medium">
                      {chapter.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sister Categories or Cheatsheets Bento Card */}
        {siblingCategories.length > 0 ? (
          <div className="group rounded-[2rem] sm:rounded-[2.5rem] border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90 p-6 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 border-b border-blue-500/20 pb-3 font-outfit text-sm font-black text-zinc-950 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <span>Question Guides</span>
            </div>
            <ul className="mt-3.5 space-y-2.5">
              {siblingCategories.slice(0, 4).map((cat) => {
                const linkPath = cat.courseSlug
                  ? `/${encodeURIComponent(cat.courseSlug)}/interview-questions/${encodeURIComponent(cat.slug)}`
                  : `/interview-questions/${encodeURIComponent(cat.slug)}`;

                return (
                  <li key={cat._id || cat.slug}>
                    <Link
                      href={linkPath}
                      className="group/item flex items-center justify-between text-xs font-semibold text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="rounded-full bg-blue-500/15 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {cat.questionCount || 0} Qs
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : cheatsheets.length > 0 ? (
          <div className="group rounded-[2rem] sm:rounded-[2.5rem] border border-blue-500/25 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white dark:to-zinc-900/90 p-6 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 border-b border-blue-500/20 pb-3 font-outfit text-sm font-black text-zinc-950 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <FileCode2 className="h-4 w-4" />
              </div>
              <span>Syntax Cheatsheets</span>
            </div>
            <div className="mt-3.5 space-y-2">
              {cheatsheets.slice(0, 3).map((sheet) => (
                <Link
                  key={sheet._id || sheet.slug}
                  href={`/cheatsheets/${encodeURIComponent(sheet.slug)}`}
                  className="group/item flex items-center justify-between rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-3 text-xs transition hover:border-blue-500/40 hover:shadow-xs"
                >
                  <span className="font-bold text-zinc-800 group-hover/item:text-blue-600 dark:text-zinc-200 truncate">
                    {sheet.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover/item:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
