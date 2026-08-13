"use client";

import React from "react";
import { ArrowRight, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import SectionHeader from "./SectionHeader";

export default function ProfileArticlesSection({ recentArticles }) {
  return (
    <section className="space-y-4">
      <SectionHeader title="Published Dispatches" />
      <div className="grid grid-cols-1 gap-4">
        {recentArticles && recentArticles.length > 0 ? (
          recentArticles.map((article, i) => (
            <motion.div
              key={article._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl rounded-3xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-6 shadow-sm hover:translate-x-1"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-850 shrink-0 shadow-inner">
                <img
                  src={article.image}
                  alt={article.title || ""}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-550"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                  {article.title}
                </h4>
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <span>
                    {article.createdAt
                      ? format(new Date(article.createdAt), "MMM d, yyyy")
                      : "—"}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} className="text-blue-500" />{" "}
                    {(article.readCount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-850 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all shrink-0">
                <ArrowRight size={16} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white/50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl py-12 text-center text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            No published articles found
          </div>
        )}
      </div>
    </section>
  );
}
