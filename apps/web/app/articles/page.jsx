"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleCard from "@/components/articles/ArticleCard";
import { useGetArticlesQuery } from "@/lib/api/articlesApi";
import { Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function ArticlesPage() {
  const { data: response, isLoading } = useGetArticlesQuery({});
  const articles = response?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-zinc-400" size={40} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            Synchronizing Archive Dispatches...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <Header />

      <main className="flex-1 w-full flex flex-col pt-24 md:pt-28 pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
          {/* Dateline Subheader */}
          <div className="flex items-center justify-between pb-4 mb-8 border-b border-zinc-200/60 dark:border-zinc-800/60 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
            <div className="flex items-center gap-3">
              <Sparkles size={14} className="text-emerald-500" />
              <span className="text-zinc-900 dark:text-white font-bold">
                asif ARCHIVE
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-zinc-400">
                FULL DISPATCH CATALOGUE
              </span>
            </div>
            <div>
              <span>{articles.length} Total Dispatches</span>
            </div>
          </div>

          {/* Page Header */}
          <div className="flex flex-col gap-4 mb-16 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black font-outfit tracking-tight text-zinc-900 dark:text-white">
              The Archive.
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-base font-light leading-relaxed">
              A complete chronicle of investigative reports, technical analyses,
              and essays examining the systems that define our reality.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {articles.map((article) => (
              <ArticleCard
                key={article._id}
                article={{
                  id: article._id,
                  slug: article.slug,
                  title: article.title,
                  author: article.author?.fullName || "Anonymous",
                  date: article.createdAt
                    ? format(new Date(article.createdAt), "MMM dd, yyyy")
                    : "Recent",
                  imageUrl: article.image,
                  views: article.readCount,
                }}
                variant="vertical"
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
