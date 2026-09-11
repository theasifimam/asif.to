"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, FileText } from "lucide-react";
import { SafeArticleCover } from "../SafeCovers";
import { getArticleHref } from "../homeUtils";

export default function HomeArticlesSection({ displayArticles = [] }) {
  if (displayArticles.length === 0) return null;

  return (
    <section id="articles" className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
            <FileText className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
              Technical Dispatches
            </span>
          </div>
          <h2 className="font-outfit mt-1 text-lg sm:text-2xl font-black tracking-tight">
            Latest Articles & System Design
          </h2>
          <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Technical analyses, architecture explorations, and system design
            writeups.
          </p>
        </div>
        <Link
          href="/articles"
          className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline shrink-0"
        >
          View all articles <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayArticles.map((article) => {
          const articleUrl = getArticleHref(article);
          const categoryName =
            article.topic?.[0]?.name || article.category || "Article";
          const authorName = article.author?.fullName || "Asif";
          const authorInitial = authorName.charAt(0).toUpperCase();

          return (
            <Link
              key={article._id || article.id}
              href={articleUrl}
              className="group flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-purple-500/40 hover:shadow-md"
            >
              <div>
                <SafeArticleCover
                  image={article.image}
                  title={article.title}
                  categoryName={categoryName}
                />

                {/* Article Title */}
                <h3 className="font-outfit text-sm sm:text-base font-black leading-snug text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 mt-3">
                  {article.title}
                </h3>

                <p className="line-clamp-2 text-[11px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
                  {article.subtitle ||
                    article.description ||
                    (article.content
                      ? article.content.replace(/<[^>]*>?/gm, "").slice(0, 110)
                      : `Deep dive technical analysis into ${article.title} on asif.to.`)}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0 max-w-[65%]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[9px] font-black text-purple-400 border border-purple-500/30">
                    {authorInitial}
                  </span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 truncate text-[11px]">
                    {authorName}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 shrink-0">
                  <span>Read</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
