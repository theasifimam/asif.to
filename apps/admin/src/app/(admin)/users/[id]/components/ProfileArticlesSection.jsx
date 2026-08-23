"use client";

import React from "react";
import { ArrowRight, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import SectionHeader from "./SectionHeader";

export default function ProfileArticlesSection({ recentArticles }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Published Dispatches" />
      <div className="grid grid-cols-1 gap-3">
        {recentArticles && recentArticles.length > 0 ? (
          recentArticles.map((article, i) => (
            <motion.div
              key={article._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group rounded-3xl sm:rounded-[28px] bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-4.5 shadow-xs hover:border-blue-500/80 transition-all cursor-pointer flex items-center gap-4"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-800">
                <img
                  src={article.image}
                  alt={article.title || ""}
                  className="w-full h-full object-cover grayscale-15 group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-sm sm:text-base font-bold font-outfit text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>
                    {article.createdAt
                      ? format(new Date(article.createdAt), "MMM d, yyyy")
                      : "—"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="flex items-center gap-1 font-bold text-zinc-500 dark:text-zinc-400">
                    <Eye size={13} className="text-blue-500" />{" "}
                    {(article.readCount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-all shrink-0">
                <ArrowRight size={14} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-[28px] bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 py-10 text-center text-zinc-400 font-black uppercase tracking-[0.18em] text-[10px]">
            No published articles found
          </div>
        )}
      </div>
    </section>
  );
}
