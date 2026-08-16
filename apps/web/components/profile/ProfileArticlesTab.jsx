"use client";

import React from "react";
import { Newspaper, Loader2 } from "lucide-react";
import ArticleCard from "@/components/articles/ArticleCard";

export default function ProfileArticlesTab({
  articles = [],
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (articles.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((item) => (
          <ArticleCard
            key={item._id}
            article={{
              id: item._id,
              slug: item.slug,
              title: item.title,
              author: item.author?.fullName || "asif.to Team",
              date: new Date(item.createdAt).toLocaleDateString(),
              imageUrl: item.image,
              views: item.readCount,
            }}
            variant="vertical"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-12 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-3 border border-zinc-100 dark:border-zinc-800">
      <Newspaper className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
      <h3 className="font-extrabold text-base text-foreground">
        No Published Articles Yet
      </h3>
      <p className="text-xs text-zinc-500 max-w-sm">
        Share your technical insights, tutorials, and coding notes with the asif.to community.
      </p>
    </div>
  );
}
