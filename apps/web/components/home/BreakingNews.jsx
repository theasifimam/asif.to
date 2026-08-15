"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ArticleCard from "../articles/ArticleCard";
import { format } from "date-fns";
import { ArrowRight, Sparkles } from "lucide-react";

export default function BreakingNews({ articles, selectedCategory = "ALL" }) {
  const filteredArticles = React.useMemo(() => {
    if (!articles || articles.length === 0) return [];
    if (selectedCategory === "ALL") return articles;
    return articles.filter((a) => {
      const topic = a.topic?.[0]?.name || a.category || "";
      return topic.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [articles, selectedCategory]);

  if (!articles || articles.length === 0) return null;

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e1e7d4] dark:border-[#2d3624]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#b6c173] dark:bg-[#c2d08a]" />
          <h2 className="text-xl md:text-2xl font-black font-outfit tracking-tight text-[#1b2111] dark:text-[#f2f5e8] uppercase">
            {selectedCategory === "ALL"
              ? "Latest Dispatches"
              : `${selectedCategory} Dispatches`}
          </h2>
          <span className="text-[10px] font-black font-outfit px-3 py-1 rounded-full bg-[#b6c173]/25 text-[#2e371a] dark:text-[#e2e8c2] border border-[#b6c173]/30">
            {filteredArticles.length} SIGNALS
          </span>
        </div>
        <Link
          href="/articles"
          className="group text-xs font-black tracking-wider uppercase text-[#8e9947] dark:text-[#b6c173] hover:underline inline-flex items-center gap-1.5"
        >
          <span>View Archive</span>
          <ArrowRight
            size={13}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="py-16 text-center text-[#788544] dark:text-[#a0ab6c] text-sm font-medium bg-white dark:bg-[#191f13] rounded-[2rem] border border-[#e1e7d4] dark:border-[#2d3624]">
          No dispatches found under "{selectedCategory}".
        </div>
      ) : (
        /* Asymmetric Bento Grid Flow */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, idx) => {
            // Assign card variants based on layout repeating index
            // Index 0: Bento Major (2 cols)
            // Index 1: Bento Glass (1 col)
            // Index 2: Bento Text (1 col)
            // Index 3: Bento Glass (1 col)
            // Index 4: Bento Text (1 col)
            // Index 5: Bento Major (2 cols) -> starts loop again
            const mod = idx % 5;
            let cardVariant = "bento-glass";
            if (mod === 0) cardVariant = "bento-major";
            if (mod === 2 || mod === 4) cardVariant = "bento-text";

            return (
              <ArticleCard
                key={article._id || article.id}
                article={{
                  id: article._id || article.id,
                  slug: article.slug,
                  title: article.title,
                  category:
                    article.category || article.topic?.[0]?.name || "DISPATCH",
                  author:
                    article.author?.fullName || article.author || "Anonymous",
                  date: article.createdAt
                    ? format(new Date(article.createdAt), "MMM dd, yyyy")
                    : article.date || "Recent",
                  imageUrl: article.image || article.imageUrl,
                  views: article.readCount || article.views,
                }}
                variant={cardVariant}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
