"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, FileText } from "lucide-react";
import { useGetArticlesQuery, Article } from "@/lib/api/articlesApi";
import { formatDistanceToNow } from "date-fns";
import { getImageUrl } from "@/lib/config";
import ArticleCard from "./ArticleCard";
import BookmarkButton from "./BookmarkButton";

export default function LatestArticles() {
  const { data: response, isLoading } = useGetArticlesQuery({ limit: 4 });
  const articles = response?.success ? response.data : [];

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <LogoLoader className=" text-zinc-300" size={32}  />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
          Loading Latest Dispatches...
        </span>
      </div>
    );
  }

  if (!articles || articles.length === 0) return null;

  const leadArticle = articles[0];
  const secondaryArticles = articles.slice(1);

  return (
    <>
      {/* Editorial Hero Layout */}
      <section className="mb-24 md:mb-32 hidden md:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-7 flex flex-col gap-8 order-2 lg:order-1">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Lead Investigation
                </span>
              </div>

              <Link
                href={`/articles/${leadArticle.slug}-${leadArticle._id}`}
                className="group"
              >
                <h1 className="text-4xl md:text-[5.5rem] xl:text-[6.5rem] font-black font-outfit tracking-tighter text-zinc-900 dark:text-zinc-100 leading-[0.9] group-hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors uppercase">
                  {leadArticle.title.split(" ").map((word, i) => (
                    <React.Fragment key={i}>
                      {word}
                      {i === 1 ? <br /> : " "}
                    </React.Fragment>
                  ))}
                </h1>
              </Link>

              <div
                className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-xl font-light line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: leadArticle.content.substring(0, 200) + "...",
                }}
              />
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Author
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  {leadArticle.author?.fullName || "Anonymous"}
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Published
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  {formatDistanceToNow(new Date(leadArticle.createdAt))} ago
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
              <Link
                href={`/articles/${leadArticle.slug}-${leadArticle._id}`}
                className="hidden sm:flex items-center gap-2 group ml-auto"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-500 transition-colors">
                  Read Report
                </span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 relative">
            <Link
              href={`/articles/${leadArticle.slug}-${leadArticle._id}`}
              className="block relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 aspect-4/5 md:aspect-3/4 rounded-2xl md:rounded-4xl"
            >
              <img
                src={getImageUrl(leadArticle.image)}
                alt={leadArticle.title || "asif.to Lead Article"}
                className="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 ease-out"
              />
            </Link>
            <div className="absolute top-6 right-6 z-20">
              <BookmarkButton articleId={leadArticle._id} />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-16"></div>

      {/* Secondary Articles Section (Breaking News on Mobile) */}
      {secondaryArticles.length > 0 && (
        <section className="mb-24 md:mb-32">
          <div className="mb-8 flex items-center justify-between px-2">
            <h2 className="text-lg font-black font-outfit uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
              Breaking News
            </h2>
            <Link
              href="/archive"
              className="text-[11px] font-bold text-zinc-400 group flex items-center gap-1"
            >
              More{" "}
              <ArrowRight
                size={12}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 lg:gap-14">
            {secondaryArticles.map((item) => (
              <ArticleCard
                key={item._id}
                article={{
                  id: item._id,
                  slug: item.slug,
                  title: item.title,
                  author: item.author?.fullName || "Anonymous",
                  date: `${formatDistanceToNow(new Date(item.createdAt))} ago`,
                  imageUrl: item.image,
                  views: item.readCount,
                }}
                variant="vertical"
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
