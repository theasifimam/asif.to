"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React from "react";
import Link from "next/link";
import { BookOpen, Bookmark, ChevronRight } from "lucide-react";
import ArticleCard from "@/components/articles/ArticleCard";
import SaveButton from "@/components/articles/SaveButton";

export default function ProfileSavedTab({
  savedItems = [],
  savedItemsLoading = false,
  bookmarks = [],
}) {
  return (
    <div className="space-y-8">
      {/* Saved Learning Resources */}
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span>Saved Learning Resources ({savedItems.length})</span>
        </h3>

        {savedItemsLoading ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
            <LogoLoader className="w-6 h-6  text-blue-500"  />
          </div>
        ) : savedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedItems.map((item) => {
              const metadata = {
                course: {
                  label: "Course",
                  title: item.title,
                  href: `/courses/${item.slug}`,
                },
                chapter: {
                  label: item.course?.title || "Chapter",
                  title: item.title,
                  description: item.summary,
                  href: `/${item.course?.slug}/${item.slug}`,
                },
                cheatsheet: {
                  label: "Cheatsheet",
                  title: item.title,
                  href: item.slug ? `/cheatsheets/${item.slug}` : "/cheatsheets",
                },
                quiz_question: {
                  label: "Quiz Question",
                  title: item.question,
                  href: "/quiz",
                },
                interview_question: {
                  label: item.course?.title || "Interview Question",
                  title: item.question,
                  href: `/${item.course?.slug}/interview-questions/${item.slug}`,
                },
              }[item.itemType];

              if (!metadata) return null;

              return (
                <div
                  key={`${item.itemType}-${item._id}`}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between gap-3 hover:border-blue-500/30 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px] line-clamp-1">
                        {metadata.label}
                      </span>
                      <SaveButton
                        itemId={item._id}
                        itemType={item.itemType}
                        label="Save"
                        size="sm"
                        className="shrink-0"
                      />
                    </div>
                    <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2">
                      {metadata.title}
                    </h4>
                    {metadata.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium line-clamp-2">
                        {metadata.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={metadata.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-1"
                  >
                    <span>Open Resource</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-2 border border-zinc-100 dark:border-zinc-800">
            <Bookmark className="w-8 h-8 text-zinc-200 dark:text-zinc-700" />
            <p className="text-xs text-zinc-500 font-medium">
              Save courses, chapters, cheatsheets, and quiz questions to find them here.
            </p>
          </div>
        )}
      </div>

      {/* Saved Articles */}
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-purple-500" />
          <span>Saved Articles ({bookmarks.length})</span>
        </h3>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((item) => (
              <ArticleCard
                key={item._id}
                article={{
                  id: item._id,
                  slug: item.slug,
                  title: item.title,
                  author: item.author?.fullName || "asif.to Team",
                  date: new Date(item.createdAt).toLocaleDateString(),
                  imageUrl: item.image,
                  views: item.readCount || 120,
                }}
                variant="vertical"
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-2 border border-zinc-100 dark:border-zinc-800">
            <Bookmark className="w-8 h-8 text-zinc-200 dark:text-zinc-700" />
            <p className="text-xs text-zinc-500 font-medium">
              No saved articles found in your bookmarks collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
