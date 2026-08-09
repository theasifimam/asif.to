"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/config';















export default function HeroSlider({ articles }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  }, [articles.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const article = articles[currentIndex];

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden bg-zinc-950">
            <AnimatePresence mode="wait">
                <motion.div
          key={article?.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0">
          
                    <Image
            src={getImageUrl(article?.imageUrl)}
            alt={article?.title || "Mazlis News Article"}
            fill
            className="object-cover"
            priority />
          
                </motion.div>
            </AnimatePresence>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent opacity-90" />
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#09090b]/60 to-transparent pointer-events-none" />

            {/* Content Container */}
            <div className="absolute bottom-28 left-6 right-6 md:left-12 md:right-12 z-20 flex flex-col gap-6 max-w-4xl">
                <AnimatePresence mode="wait">
                    <motion.div
            key={article?.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4 md:gap-6">
            
                        <div className="w-fit px-5 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full">
                            <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">
                                {article?.category === 'NEWS OF THE DAY' ? 'Trending Signal' : article?.category}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white font-outfit leading-[1] tracking-tighter">
                            {article?.title}
                        </h1>

                        <div className="flex items-center gap-6 mt-2">
                            <Link
                href={`/articles/${article?.slug}-${article?.id}`}
                className="group flex items-center gap-4 py-1">
                
                                <span className="text-sm font-black text-white uppercase tracking-[0.25em]">
                                    Read More
                                </span>
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-zinc-900 group-hover:scale-105 transition-all duration-500">
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-500" />
                                </div>
                            </Link>

                            <div className="hidden md:flex flex-col gap-0.5 border-l border-white/20 pl-6">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Filed by Agent</span>
                                <span className="text-xs font-bold text-white/80">{article?.author}</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation & Progress */}
            <div className="absolute bottom-28 right-6 md:right-12 z-20 flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2">
                    {articles.map((_, idx) =>
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 transition-all duration-500 rounded-full ${idx === currentIndex ? 'w-12 bg-white' : 'w-4 bg-white/20 hover:bg-white/40'}`
            } />

          )}
                </div>

                <div className="flex gap-2">
                    <button
            onClick={prevSlide}
            className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-zinc-900 hover:scale-105 transition-all duration-500 active:scale-95">
            
                        <ChevronLeft size={24} strokeWidth={1.5} />
                    </button>
                    <button
            onClick={nextSlide}
            className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-zinc-900 hover:scale-105 transition-all duration-500 active:scale-95">
            
                        <ChevronRight size={24} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 blur-sm" />
        </div>);

}