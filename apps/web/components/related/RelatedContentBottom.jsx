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
        {/* Course Card */}
        {activeCourse && (
          <div className="flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                <GraduationCap className="h-4 w-4" />
                <span>Recommended Course</span>
              </div>
              <h3 className="mt-2 text-base font-black leading-snug text-foreground">
                {activeCourse.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-3">
                {activeCourse.subtitle}
              </p>
            </div>
            <Link
              href={`/courses/${encodeURIComponent(activeCourse.slug)}`}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-white shadow-xs shadow-orange-500/20 transition hover:bg-orange-600"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Explore Syllabus</span>
            </Link>
          </div>
        )}

        {/* Popular Chapters */}
        {popularChapters.length > 0 && activeCourse && (
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 text-xs font-bold dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-foreground font-black">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Popular Lessons</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                {popularChapters.length} topics
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {popularChapters.slice(0, 4).map((chapter, idx) => (
                <li key={chapter._id || chapter.slug}>
                  <Link
                    href={`/${encodeURIComponent(activeCourse.slug)}/${encodeURIComponent(chapter.slug)}`}
                    className="group flex items-start gap-2.5 text-xs font-medium text-zinc-600 transition hover:text-orange-600 dark:text-zinc-300 dark:hover:text-orange-400"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-black text-zinc-500 group-hover:bg-orange-500 group-hover:text-white dark:bg-zinc-800">
                      {chapter.order ?? idx + 1}
                    </span>
                    <span className="line-clamp-2 leading-tight pt-0.5">
                      {chapter.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sister Categories or Cheatsheets */}
        {siblingCategories.length > 0 ? (
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2.5 text-xs font-black text-foreground dark:border-zinc-800">
              <MessageSquareText className="h-4 w-4 text-orange-500" />
              <span>Other Question Guides</span>
            </div>
            <ul className="mt-3 space-y-2">
              {siblingCategories.slice(0, 4).map((cat) => {
                const linkPath = cat.courseSlug
                  ? `/${encodeURIComponent(cat.courseSlug)}/interview-questions/${encodeURIComponent(cat.slug)}`
                  : `/interview-questions/${encodeURIComponent(cat.slug)}`;

                return (
                  <li key={cat._id || cat.slug}>
                    <Link
                      href={linkPath}
                      className="group flex items-center justify-between text-xs font-semibold text-zinc-700 hover:text-orange-600 dark:text-zinc-300 dark:hover:text-orange-400"
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">
                        {cat.questionCount || 0} Qs
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : cheatsheets.length > 0 ? (
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2.5 text-xs font-black text-foreground dark:border-zinc-800">
              <FileCode2 className="h-4 w-4 text-blue-500" />
              <span>Syntax Cheatsheets</span>
            </div>
            <div className="mt-3 space-y-2">
              {cheatsheets.slice(0, 3).map((sheet) => (
                <Link
                  key={sheet._id || sheet.slug}
                  href={`/cheatsheets/${encodeURIComponent(sheet.slug)}`}
                  className="group flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-2 text-xs transition hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <span className="font-bold text-zinc-800 group-hover:text-blue-600 dark:text-zinc-200 truncate">
                    {sheet.title}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
