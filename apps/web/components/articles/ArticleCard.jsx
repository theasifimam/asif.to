"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowUpRight, Sparkles, BookOpen } from "lucide-react";
import { getImageUrl } from "@/lib/config";
import BookmarkButton from "./BookmarkButton";

export default function ArticleCard({ article, variant = "horizontal" }) {
  const articleLink = `/articles/${article.slug}-${article.id}`;

  // 1. Bento Major: Immersive, full-bleed card taking up 2 columns
  if (variant === "bento-major") {
    return (
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative group rounded-[2.25rem] overflow-hidden min-h-72.5 xs:min-h-[340px] md:min-h-95 flex flex-col justify-end p-5 xs:p-6 md:p-8 border border-[#e1e7d4] dark:border-[#2d3624] shadow-md hover:shadow-2xl hover:shadow-[#b6c173]/10 dark:hover:shadow-black/50 transition-all duration-300 cursor-pointer col-span-1 md:col-span-2"
      >
        {/* Cover Image with Zoom Effect */}
        <div className="absolute inset-0 z-0 bg-[#1b2111]">
          <Image
            src={getImageUrl(article.imageUrl)}
            alt={article.title}
            fill
            className="object-cover opacity-85 dark:opacity-65 group-hover:scale-103 transition-transform duration-700 ease-out"
            unoptimized
          />
          {/* Gradient Shades */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/45 to-transparent z-10" />
          <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent z-10" />
        </div>

        {/* Floating Category Badge */}
        <div className="absolute top-5 left-5 z-20 flex gap-2">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#dfeba8] text-[9px] font-black tracking-widest uppercase">
            <Sparkles size={10} className="text-[#c2d08a]" />
            {article.category || "HOT STORY"}
          </span>
        </div>

        {/* Bookmark Icon */}
        <div className="absolute top-5 right-5 z-25">
          <BookmarkButton
            articleId={article.id}
            className="bg-white/15 hover:bg-[#b6c173] text-white hover:text-[#1b2111] border border-white/10 backdrop-blur-md rounded-full p-2.5 transition-colors duration-300"
          />
        </div>

        {/* Card Details */}
        <div className="relative z-20 flex flex-col gap-3 mt-auto">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-[#c2d08a]">
            <span>By {article.author}</span>
            <span className="w-1 h-1 rounded-full bg-white/35" />
            <span className="flex items-center gap-1 text-[11px]">
              <Clock size={10} />
              {article.date}
            </span>
          </div>

          <Link href={articleLink}>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-black font-outfit text-white leading-tight tracking-tight hover:text-[#c2d08a] transition-colors duration-300">
              {article.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/15">
            <span className="text-[10px] text-slate-400 font-medium">
              Featured Analysis
            </span>
            <Link
              href={articleLink}
              className="w-8 h-8 rounded-full bg-[#c2d08a] text-[#1b2111] flex items-center justify-center hover:bg-white hover:scale-105 transition-all"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. Bento Glass: Translucent grid card with glow effects
  if (variant === "bento-glass") {
    return (
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 group cursor-pointer p-4 sm:p-5 rounded-[2.25rem] bg-white/70 dark:bg-[#191f13]/60 backdrop-blur-md border border-[#e1e7d4] dark:border-[#2d3624] shadow-xs hover:shadow-xl hover:border-[#b6c173] dark:hover:border-[#c2d08a] transition-all duration-300"
      >
        {/* Cover Image Frame */}
        <div className="relative aspect-16/10 w-full rounded-[1.75rem] overflow-hidden bg-[#edf1e4] dark:bg-[#21281a] border border-[#e1e7d4]/60 dark:border-[#2d3624]">
          <Link href={articleLink} className="block w-full h-full">
            <Image
              src={getImageUrl(article.imageUrl)}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-750 ease-out group-hover:scale-104"
              unoptimized
            />
          </Link>

          <div className="absolute top-3 left-3 z-10">
            <span className="px-3 py-1 rounded-full bg-[#b6c173] text-[#1b2111] text-[9px] font-black tracking-wider uppercase shadow-xs">
              {article.category || "DISPATCH"}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-20">
            <BookmarkButton
              articleId={article.id}
              className="bg-black/25 hover:bg-[#b6c173] text-white hover:text-[#1b2111] border border-white/10 backdrop-blur-md rounded-full p-2 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Content Details */}
        <div className="flex flex-col gap-2 px-1 pb-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#788544] dark:text-[#a0ab6c]">
            <span className="text-[#8e9947] dark:text-[#b6c173]">
              {article.author}
            </span>
            <span className="flex items-center gap-1 font-semibold text-[10px]">
              <Clock size={11} />
              {article.date}
            </span>
          </div>

          <Link href={articleLink}>
            <h3 className="text-base font-bold font-outfit leading-snug line-clamp-2 text-[#1b2111] dark:text-[#f2f5e8] group-hover:text-[#8e9947] dark:group-hover:text-[#b6c173] transition-colors duration-300">
              {article.title}
            </h3>
          </Link>
        </div>
      </motion.div>
    );
  }

  // 3. Bento Text: Retro asymmetric card with neat borders
  if (variant === "bento-text") {
    return (
      <motion.div
        whileHover={{ y: -6, skewX: -0.5 }}
        transition={{ duration: 0.25 }}
        className="group relative p-5 sm:p-6 rounded-[2.25rem] border-2 border-dashed border-[#edf1e4] dark:border-[#2d3624] bg-transparent hover:border-[#b6c173] dark:hover:border-[#c2d08a] transition-all duration-300 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black tracking-widest text-[#8e9947] dark:text-[#b6c173] uppercase">
              {article.category || "ANALYSIS"}
            </span>
            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
              <BookOpen size={10} />
              {article.date}
            </span>
          </div>

          <Link href={articleLink}>
            <h3 className="text-base sm:text-lg font-black font-outfit leading-tight line-clamp-3 text-[#1b2111] dark:text-[#f2f5e8] group-hover:text-[#8e9947] dark:group-hover:text-[#b6c173] transition-colors duration-300">
              {article.title}
            </h3>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#e1e7d4] dark:border-[#2d3624] flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#edf1e4] dark:bg-[#21281a] text-xs font-bold flex items-center justify-center text-[#788544] dark:text-[#a0ab6c]">
              {article.author?.charAt(0) || "E"}
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {article.author}
            </span>
          </div>
          <Link
            href={articleLink}
            className="w-7 h-7 rounded-full bg-[#edf1e4] dark:bg-[#21281a] group-hover:bg-[#b6c173] text-[#788544] group-hover:text-[#1b2111] flex items-center justify-center transition-all duration-300"
          >
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </motion.div>
    );
  }

  // 4. Default Vertical Variant (Cleaned and enhanced)
  if (variant === "vertical") {
    return (
      <div className="flex flex-col gap-4 group cursor-pointer p-4 sm:p-5 rounded-[2.25rem] bg-white dark:bg-[#191f13] border border-[#e1e7d4] dark:border-[#2d3624] hover:border-[#b6c173] dark:hover:border-[#c2d08a] shadow-xs hover:shadow-xl transition-all duration-300 android-tile">
        {/* Cover Image Frame */}
        <div className="relative aspect-16/10 w-full rounded-[1.75rem] overflow-hidden bg-[#edf1e4] dark:bg-[#21281a] border border-[#e1e7d4]/60 dark:border-[#2d3624]">
          <Link href={articleLink} className="block w-full h-full">
            <Image
              src={getImageUrl(article.imageUrl)}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-104"
              unoptimized
            />
          </Link>

          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-[#b6c173] text-[#1b2111] text-[10px] font-bold shadow-md shadow-[#b6c173]/25 tracking-wider uppercase">
              {article.category || "FEATURED"}
            </span>
          </div>

          <div className="absolute top-3.5 right-3.5 z-20">
            <BookmarkButton
              articleId={article.id}
              className="bg-black/30! text-white! backdrop-blur-md! border-white/20! p-2.5! rounded-full! hover:bg-[#b6c173]! hover:text-[#1b2111]!"
            />
          </div>
        </div>

        {/* Content Details */}
        <div className="flex flex-col gap-2.5 px-1 pb-1">
          <div className="flex items-center justify-between text-xs font-bold text-[#788544] dark:text-[#a0ab6c]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#b6c173] text-[#1b2111] text-[10px] font-black flex items-center justify-center">
                {article.author?.charAt(0) || "M"}
              </div>
              <span className="text-[#8e9947] dark:text-[#b6c173] font-bold">
                {article.author}
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Clock size={12} className="text-[#8e9947] dark:text-[#b6c173]" />
              {article.date}
            </span>
          </div>

          <Link href={articleLink}>
            <h3 className="text-base sm:text-lg font-bold font-outfit leading-tight line-clamp-2 text-[#1b2111] dark:text-[#f2f5e8] group-hover:text-[#8e9947] dark:group-hover:text-[#b6c173] transition-colors duration-300">
              {article.title}
            </h3>
          </Link>
        </div>
      </div>
    );
  }

  // 5. Default Horizontal Variant (Cleaned and enhanced)
  return (
    <div className="flex gap-4 items-center group p-3.5 rounded-[1.75rem] bg-white dark:bg-[#191f13] border border-[#e1e7d4] dark:border-[#2d3624] hover:border-[#b6c173] dark:hover:border-[#c2d08a] shadow-xs hover:shadow-lg transition-all duration-300 relative cursor-pointer">
      <Link
        href={articleLink}
        className="relative w-22 h-22 shrink-0 rounded-[1.35rem] overflow-hidden bg-[#edf1e4] dark:bg-[#21281a] border border-[#e1e7d4]/60 dark:border-[#2d3624]"
      >
        <Image
          src={getImageUrl(article.imageUrl)}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      </Link>

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <Link href={articleLink}>
          <h3 className="text-sm font-bold font-outfit leading-snug line-clamp-2 text-[#1b2111] dark:text-[#f2f5e8] group-hover:text-[#8e9947] dark:group-hover:text-[#b6c173] transition-colors duration-300">
            {article.title}
          </h3>
        </Link>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#788544] dark:text-[#a0ab6c]">
          <div className="flex items-center gap-1 text-[#8e9947] dark:text-[#b6c173]">
            <Clock size={12} />
            <span>{article.date}</span>
          </div>
          {article.views && (
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{article.views.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <BookmarkButton
          articleId={article.id}
          className="bg-transparent! text-[#788544]! hover:text-[#1b2111]! dark:hover:text-white! p-2! border-none! shadow-none!"
        />
      </div>
    </div>
  );
}
