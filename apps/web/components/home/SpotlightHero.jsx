"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Sparkles } from "lucide-react";
import { getImageUrl } from "@/lib/config";
import BookmarkButton from "../BookmarkButton";

export default function SpotlightHero({ leadArticle, trendingArticles = [] }) {
  if (!leadArticle) return null;

  const leadLink = `/articles/${leadArticle.slug}-${leadArticle.id || leadArticle._id}`;

  return (
    <section className="w-full mb-12 pt-24 md:pt-28">
      <div className="max-w-350 mx-auto px-4 md:px-8">
        {/* Bento Grid Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-1 rounded-full bg-linear-to-b from-[#8e9947] to-[#dfeba8]" />
          <h2 className="text-xs font-black tracking-[0.2em] uppercase text-[#788544] dark:text-[#a0ab6c] font-outfit">
            Spotlight & Signal Feed
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Featured Full-Bleed Card (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 relative group rounded-[2.25rem] overflow-hidden min-h-85 xs:min-h-[380px] sm:min-h-105 lg:min-h-auto flex flex-col justify-end p-5 xs:p-6 md:p-10 border border-[#e1e7d4] dark:border-[#2d3624] shadow-md hover:shadow-2xl hover:shadow-[#b6c173]/10 dark:hover:shadow-black/60 transition-all duration-500 cursor-pointer"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0 bg-[#1b2111] overflow-hidden">
              <Image
                src={getImageUrl(leadArticle.imageUrl || leadArticle.image)}
                alt={leadArticle.title}
                fill
                className="object-cover opacity-85 dark:opacity-70 group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                priority
                unoptimized
              />
              {/* Dynamic Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-transparent z-10" />
            </div>

            {/* Float Actions */}
            <div className="absolute top-5 left-5 xs:top-6 xs:left-6 z-20 flex gap-2">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#dfeba8] text-[9px] font-black tracking-widest uppercase shadow-sm">
                <Sparkles size={11} className="text-[#c2d08a] animate-pulse" />
                Featured Intelligence
              </span>
            </div>

            <div className="absolute top-5 right-5 xs:top-6 xs:right-6 z-25">
              <BookmarkButton
                articleId={leadArticle.id || leadArticle._id}
                className="bg-white/10 hover:bg-[#b6c173] text-white hover:text-[#1b2111] border border-white/10 backdrop-blur-md rounded-full p-2.5 transition-colors duration-300"
              />
            </div>

            {/* Story Details Card */}
            <div className="relative z-20 flex flex-col gap-3.5 mt-auto">
              <div className="flex items-center gap-3 text-xs font-bold text-[#c2d08a]">
                <span className="uppercase tracking-widest text-[9px] xs:text-[10px]">
                  {leadArticle.category || "INVESTIGATION"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c2d08a]/50" />
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock size={11} />
                  {leadArticle.date}
                </span>
              </div>

              <Link href={leadLink}>
                <h1 className="text-xl xs:text-2xl sm:text-3.5xl lg:text-4xl font-black font-outfit text-white leading-tight tracking-tight hover:text-[#c2d08a] transition-colors duration-300">
                  {leadArticle.title}
                </h1>
              </Link>

              {leadArticle.content && (
                <p className="text-slate-300 text-[11px] xs:text-xs sm:text-sm leading-relaxed line-clamp-2 max-w-2xl font-light">
                  {leadArticle.content.replace(/<[^>]*>?/gm, "")}
                </p>
              )}

              {/* Author & CTA Row */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#c2d08a] text-[#1b2111] font-black text-sm flex items-center justify-center shadow-inner">
                    {leadArticle.author?.charAt(0) || "M"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">
                      {leadArticle.author}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Editorial Staff
                    </span>
                  </div>
                </div>

                <Link
                  href={leadLink}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#c2d08a] text-[#1b2111] text-xs font-extrabold shadow-lg shadow-[#c2d08a]/10 hover:bg-white hover:scale-102 hover:shadow-xl transition-all duration-300 android-haptic"
                >
                  <span>Analyze Report</span>
                  <ArrowUpRight
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Trending Bento Stack (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#e1e7d4]/60 dark:border-[#2d3624]">
              <h3 className="text-sm font-black font-outfit text-[#1b2111] dark:text-[#f2f5e8] tracking-widest uppercase flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Trending Signals
              </h3>
              <span className="text-[10px] font-black tracking-widest text-[#788544] dark:text-[#a0ab6c] uppercase">
                Realtime Feed
              </span>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 flex-1 justify-between">
              {trendingArticles.slice(0, 3).map((item, idx) => {
                const itemLink = `/articles/${item.slug}-${item.id || item._id}`;
                return (
                  <motion.div
                    key={item.id || item._id || idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * (idx + 1) }}
                    className="group"
                  >
                    <Link
                      href={itemLink}
                      className="flex gap-4 p-4 rounded-[1.75rem] bg-white dark:bg-[#191f13] border border-[#e1e7d4] dark:border-[#2d3624] hover:border-[#b6c173] dark:hover:border-[#c2d08a] hover:bg-[#edf1e4]/25 dark:hover:bg-[#21281a]/30 transition-all duration-300 shadow-xs hover:shadow-md"
                    >
                      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <span className="font-outfit font-black text-xl text-[#788544]/25 dark:text-[#a0ab6c]/25 group-hover:text-[#8e9947] dark:group-hover:text-[#c2d08a] transition-colors duration-300">
                          {`0${idx + 1}`}
                        </span>
                        {/* Interactive glow circle */}
                        <div className="absolute inset-0 rounded-full bg-[#b6c173]/5 dark:bg-[#c2d08a]/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
                      </div>

                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-black text-[#8e9947] dark:text-[#b6c173] tracking-widest uppercase">
                            {item.category || "SIGNAL"}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">
                            {item.date}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold font-outfit leading-snug line-clamp-2 text-[#1b2111] dark:text-[#f2f5e8] group-hover:text-[#8e9947] dark:group-hover:text-[#b6c173] transition-colors duration-300">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
