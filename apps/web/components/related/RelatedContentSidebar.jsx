import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileCode2,
  Flame,
  GraduationCap,
  Layers,
  MessageSquareText,
  Newspaper,
  Sparkles,
} from "lucide-react";

export default function RelatedContentSidebar({
  relatedData,
  currentType = "questions",
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

  return (
    <aside
      className={`hidden lg:block w-full max-w-[310px] xl:max-w-[330px] shrink-0 space-y-5 ${className}`}
      aria-label="Related course and study resources"
    >
      {/* Active Course Card */}
      {activeCourse && (
        <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <GraduationCap className="h-4 w-4 text-orange-500" />
            <span>Complete Course</span>
          </div>

          <h3 className="mt-2 text-base font-black leading-snug tracking-tight text-foreground line-clamp-2">
            {activeCourse.title}
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {activeCourse.subtitle}
          </p>

          <div className="mt-3.5 flex flex-wrap gap-2 text-[11px] font-semibold text-zinc-500">
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 dark:bg-zinc-800">
              {activeCourse.level || "Beginner to Advanced"}
            </span>
            <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-orange-700 dark:text-orange-300">
              {activeCourse.duration || "Self-paced"}
            </span>
          </div>

          <Link
            href={`/courses/${encodeURIComponent(activeCourse.slug)}`}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-white shadow-xs shadow-orange-500/20 transition hover:bg-orange-600"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>View Full Syllabus</span>
          </Link>
        </div>
      )}

      {/* Popular / Featured Chapters */}
      {popularChapters.length > 0 && activeCourse && (
        <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 text-xs font-black dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-foreground">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>Popular Chapters</span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-400">
              {popularChapters.length} lessons
            </span>
          </div>

          <ul className="mt-2 space-y-1">
            {popularChapters.slice(0, 5).map((chapter, idx) => (
              <li key={chapter._id || chapter.slug}>
                <Link
                  href={`/${encodeURIComponent(activeCourse.slug)}/${encodeURIComponent(chapter.slug)}`}
                  className="group flex items-start gap-2.5 rounded-xl p-2 text-xs font-medium text-zinc-600 transition hover:bg-orange-50 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-black text-zinc-500 group-hover:bg-orange-500 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-400">
                    {chapter.order ?? idx + 1}
                  </span>
                  <span className="min-w-0 flex-1 line-clamp-2 leading-tight pt-0.5">
                    {chapter.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sister Interview Categories */}
      {siblingCategories.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2.5 text-xs font-black text-foreground dark:border-zinc-800/80">
            <MessageSquareText className="h-4 w-4 text-orange-500" />
            <span>More Interview Guides</span>
          </div>

          <ul className="mt-2.5 space-y-1.5">
            {siblingCategories.map((cat) => {
              const linkPath = cat.courseSlug
                ? `/${encodeURIComponent(cat.courseSlug)}/interview-questions/${encodeURIComponent(cat.slug)}`
                : `/interview-questions/${encodeURIComponent(cat.slug)}`;

              return (
                <li key={cat._id || cat.slug}>
                  <Link
                    href={linkPath}
                    className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
                  >
                    <span className="min-w-0 flex-1 truncate">{cat.name}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 group-hover:bg-orange-100 group-hover:text-orange-700 dark:bg-zinc-800 dark:text-zinc-400">
                      {cat.questionCount || 0} Qs
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Cheatsheet Recommendations */}
      {cheatsheets.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2.5 text-xs font-black text-foreground dark:border-zinc-800/80">
            <FileCode2 className="h-4 w-4 text-blue-500" />
            <span>Quick Cheatsheets</span>
          </div>

          <div className="mt-2.5 space-y-2">
            {cheatsheets.map((sheet) => (
              <Link
                key={sheet._id || sheet.slug}
                href={`/cheatsheets/${encodeURIComponent(sheet.slug)}`}
                className="group flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-2.5 text-xs transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <span className="block font-bold text-zinc-800 group-hover:text-blue-600 dark:text-zinc-200 dark:group-hover:text-blue-400 truncate">
                    {sheet.title}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                    {sheet.techId || "Syntax Guide"}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-blue-500 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {articles.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-4.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-2.5 text-xs font-black text-foreground dark:border-zinc-800/80">
            <Newspaper className="h-4 w-4 text-emerald-500" />
            <span>Related Articles</span>
          </div>

          <div className="mt-2 space-y-1.5">
            {articles.slice(0, 3).map((art) => (
              <Link
                key={art._id || art.slug}
                href={`/articles/${encodeURIComponent(art.slug)}`}
                className="block rounded-xl p-2 text-xs transition hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
              >
                <span className="line-clamp-2 font-bold text-zinc-700 dark:text-zinc-300 hover:underline">
                  {art.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
