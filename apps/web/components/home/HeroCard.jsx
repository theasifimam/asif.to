"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import BookmarkButton from "../articles/BookmarkButton";













export default function HeroCard({ article }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full aspect-[4/5] md:aspect-[16/8] rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden group shadow-2xl">
      
            <Image
        src={article.imageUrl}
        alt={article.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority />
      
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

            <div className="absolute top-8 right-8 z-20">
                <BookmarkButton articleId={article.id} />
            </div>

            <div className="absolute top-32 left-8 transition-opacity duration-300 group-hover:opacity-100">
                <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                    <span className="text-[11px] font-bold text-white uppercase tracking-widest">News of the day</span>
                </div>
            </div>

            <div className="absolute bottom-10 left-8 right-8">
                <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-6xl font-bold text-white font-outfit leading-[1.1] mb-6 tracking-tight max-w-2xl">
          
                    {article.title}
                </motion.h1>
                <Link href={`/articles/${article.slug}-${article.id}`} className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group/link pb-2">
                    <span className="text-sm font-bold uppercase tracking-widest">Learn More</span>
                    <ArrowRight size={18} className="transition-transform group-hover/link:translate-x-1" />
                </Link>
            </div>
        </motion.div>);

}
