"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowUpRight, Sparkles, BookOpen } from "lucide-react";
import { getImageUrl } from "@/lib/config";
import BookmarkButton from "./BookmarkButton";

export default function ArticleCard({ article, variant = "horizontal" }) {
  const articleLink = `/articles/${article.slug}-${article.id}`;

  // 1. Bento Major: Immersive, full-bleed eye-catching featured card
  if (variant === "bento-major") {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative group rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[300px] xs:min-h-[340px] md:min-h-[380px] flex flex-col justify-end p-6 xs:p-7 md:p-8 border border-blue-500/30 dark:border-blue-500/30 shadow-md hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer col-span-1 md:col-span-2"
      >
        {/* Cover Image with Subtle Overlay */}
        <div className="absolute inset-0 z-0 bg-zinc-950">
          <Image
            src={getImageUrl(article.imageUrl)}
            alt={article.title}
            fill
            className="object-cover opacity-80 dark:opacity-65 group-hover:scale-103 transition-transform duration-700 ease-out"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-transparent z-10" />
        </div>

        {/* Floating Category Badge */}
        <div className="absolute top-5 left-5 z-20 flex gap-2">
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300 text-[10px] font-black tracking-widest uppercase">
            <Sparkles size={11} className="text-blue-400" />
            {article.category || "FEATURED STORY"}
          </span>
        </div>

        {/* Bookmark Icon */}
        <div className="absolute top-5 right-5 z-25">
          <BookmarkButton
            articleId={article.id}
            className="bg-zinc-900/60 hover:bg-blue-600 text-white border border-white/20 backdrop-blur-md rounded-full p-2.5 transition-all duration-300"
          />
        </div>

        {/* Card Details */}
        <div className="relative z-20 flex flex-col gap-2.5 mt-auto">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-300">
            <span className="text-blue-400 font-bold">By {article.author}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-500" />
            <span className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Clock size={11} />
              {article.date}
            </span>
          </div>

          <Link href={articleLink}>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-black font-outfit text-white leading-snug tracking-tight hover:text-blue-400 transition-colors duration-300 line-clamp-2">
              {article.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/15">
            <span className="text-xs text-zinc-400 font-medium">
              Featured Deep Dive
            </span>
            <Link
              href={articleLink}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 hover:scale-105 transition-all shadow-md"
            >
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. Bento Glass: Standard translucent minimal card
  if (variant === "bento-glass") {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col justify-between group cursor-pointer p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-zinc-500/5 via-transparent to-white dark:to-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all duration-300"
      >
        <div className="flex flex-col gap-3.5">
          {/* Cover Image Frame */}
          <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
            <Link href={articleLink} className="block w-full h-full">
              <Image
                src={getImageUrl(article.imageUrl)}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-104"
                unoptimized
              />
            </Link>

            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[9.5px] font-black tracking-wider uppercase backdrop-blur-md">
                {article.category || "ARTICLE"}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20">
              <BookmarkButton
                articleId={article.id}
                className="bg-zinc-900/60 text-white backdrop-blur-md border border-white/20 p-2 rounded-full hover:bg-blue-600 transition-colors"
              />
            </div>
          </div>

          {/* Content Details */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {article.author}
              </span>
              <span className="flex items-center gap-1 text-[10.5px]">
                <Clock size={11} />
                {article.date}
              </span>
            </div>

            <Link href={articleLink}>
              <h3 className="text-base font-black font-outfit leading-snug line-clamp-2 text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {article.title}
              </h3>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // 3. Bento Text: Minimal text-focused squircle card
  if (variant === "bento-text") {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-zinc-500/5 via-transparent to-white dark:to-zinc-900/90 hover:border-blue-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">
              {article.category || "GUIDE"}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
              <BookOpen size={11} />
              {article.date}
            </span>
          </div>

          <Link href={articleLink}>
            <h3 className="text-base sm:text-lg font-black font-outfit leading-snug line-clamp-3 text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {article.title}
            </h3>
          </Link>
        </div>

        <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center border border-blue-500/20">
              {article.author?.charAt(0) || "A"}
            </div>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
              {article.author}
            </span>
          </div>
          <Link
            href={articleLink}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-600 text-zinc-600 dark:text-zinc-300 group-hover:text-white flex items-center justify-center transition-all duration-300"
          >
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </motion.div>
    );
  }

  // 4. Default Vertical Variant (Clean minimal card)
  if (variant === "vertical") {
    return (
      <div className="flex flex-col justify-between group cursor-pointer p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-zinc-500/5 via-transparent to-white dark:to-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-500/40 shadow-xs hover:shadow-md transition-all duration-300">
        <div className="flex flex-col gap-3.5">
          {/* Cover Image Frame */}
          <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
            <Link href={articleLink} className="block w-full h-full">
              <Image
                src={getImageUrl(article.imageUrl)}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-104"
                unoptimized
              />
            </Link>

            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="px-3.5 py-1 rounded-full bg-blue-600 text-white text-[9.5px] font-black shadow-xs tracking-wider uppercase">
                {article.category || "ARTICLE"}
              </span>
            </div>

            <div className="absolute top-3.5 right-3.5 z-20">
              <BookmarkButton
                articleId={article.id}
                className="bg-zinc-900/60 text-white backdrop-blur-md border border-white/20 p-2.5 rounded-full hover:bg-blue-600 transition-colors"
              />
            </div>
          </div>

          {/* Content Details */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center justify-center border border-blue-500/20">
                  {article.author?.charAt(0) || "A"}
                </div>
                <span className="text-zinc-700 dark:text-zinc-300 font-bold">
                  {article.author}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                <Clock size={12} className="text-blue-500" />
                {article.date}
              </span>
            </div>

            <Link href={articleLink}>
              <h3 className="text-base sm:text-lg font-black font-outfit leading-snug line-clamp-2 text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {article.title}
              </h3>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. Default Horizontal Variant (Clean minimal row card)
  return (
    <div className="flex gap-4 items-center group p-4 sm:p-5 rounded-[2rem] bg-gradient-to-br from-zinc-500/5 via-transparent to-white dark:to-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-500/40 shadow-xs hover:shadow-md transition-all duration-300 relative cursor-pointer">
      <Link
        href={articleLink}
        className="relative w-22 h-22 shrink-0 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800"
      >
        <Image
          src={getImageUrl(article.imageUrl)}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      </Link>

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <Link href={articleLink}>
          <h3 className="text-sm sm:text-base font-black font-outfit leading-snug line-clamp-2 text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {article.title}
          </h3>
        </Link>
        <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
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
          className="bg-transparent text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 border-none shadow-none"
        />
      </div>
    </div>
  );
}
