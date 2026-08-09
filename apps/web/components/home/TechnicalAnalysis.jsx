"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ShieldAlert, ArrowUpRight, BookOpen, Terminal, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function TechnicalAnalysis({ articles }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="my-12">
      {/* Tactical Panel Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#8e9947] dark:text-[#b6c173] mb-2 font-mono text-[10px] tracking-widest uppercase">
            <Terminal size={14} className="animate-pulse" />
            <span>[ SYSTEM PORTAL // VERIFIED DATAFEED ]</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-black font-outfit tracking-tight text-[#1b2111] dark:text-[#f2f5e8] uppercase">
              Intelligence Reports
            </h2>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b6c173] dark:bg-[#c2d08a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b6c173] dark:bg-[#c2d08a]"></span>
            </span>
          </div>
        </div>
        <p className="text-[#788544] dark:text-[#a0ab6c] text-xs font-semibold max-w-md leading-relaxed font-mono">
          // IN-DEPTH DECODING: System breakdowns and security intelligence logs compiled by field researchers.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, idx) => {
          const topicName =
            article.topic?.[0]?.name || article.category || "ANALYSIS";
          const articleDate = article.createdAt
            ? format(new Date(article.createdAt), "MMM dd, yyyy")
            : "Recent";
          const articleLink = `/articles/${article.slug}-${article._id || article.id}`;

          return (
            <motion.div
              key={article._id || article.id || idx}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="group relative p-6 sm:p-7 rounded-[2rem] border border-[#e1e7d4] dark:border-[#2d3624] bg-white dark:bg-[#151a10] hover:border-[#b6c173] dark:hover:border-[#c2d08a] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle visual scanline effect on background */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#b6c173]/30 dark:via-[#c2d08a]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div>
                <div className="flex items-center justify-between mb-5 font-mono text-[10px]">
                  <span className="text-[#8e9947] dark:text-[#b6c173] px-2.5 py-1 rounded bg-[#b6c173]/10 dark:bg-[#c2d08a]/10 border border-[#b6c173]/20 dark:border-[#c2d08a]/20 font-black uppercase">
                    {topicName}
                  </span>
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <BookOpen size={11} />
                    {articleDate}
                  </span>
                </div>

                {/* Cyber Document ID */}
                <div className="font-mono text-[9px] text-slate-400 mb-3 tracking-widest uppercase">
                  [ INTEL-LOG: #00{idx + 1} // SECURE_ACCESS ]
                </div>

                <Link href={articleLink}>
                  <h3 className="text-base sm:text-lg font-black font-outfit leading-tight mb-4 text-[#1b2111] dark:text-[#f2f5e8] group-hover:text-[#8e9947] dark:group-hover:text-[#b6c173] transition-colors duration-300">
                    {article.title}
                  </h3>
                </Link>
              </div>

              {/* Author Details and Link */}
              <div className="pt-4 border-t border-[#edf1e4]/80 dark:border-[#2d3624] flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#8e9947] dark:text-[#b6c173]" />
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    AUTHOR: {article.author?.fullName || article.author || "ANON_AGENT"}
                  </span>
                </div>
                <Link
                  href={articleLink}
                  className="w-8 h-8 rounded-lg bg-[#b6c173] dark:bg-[#c2d08a] text-[#1b2111] flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-md shadow-[#b6c173]/20 dark:shadow-[#c2d08a]/20"
                >
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
