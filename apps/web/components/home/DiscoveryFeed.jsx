"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React, { useState } from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import { useGetArticlesQuery, Article } from '@/lib/api/articlesApi';
import Link from 'next/link';
import { getImageUrl } from '@/lib/config';
import BookmarkButton from "../articles/BookmarkButton";


export default function DiscoveryFeed() {
  const { data: response, isLoading } = useGetArticlesQuery({ limit: 5 });
  const [exitX, setExitX] = useState(null);

  // We'll manage a local stack for the swipe effect
  const [stack, setStack] = useState([]);

  React.useEffect(() => {
    if (response?.success && response.data) {
      setStack(response.data);
    }
  }, [response]);

  const handleSwipe = (direction) => {
    setExitX(direction === 'left' ? -200 : 200);
    setTimeout(() => {
      setStack((prev) => prev.slice(1));
      setExitX(null);
      // If we run out, we could refetch or just show empty
    }, 200);
  };

  if (isLoading) {
    return (
      <section className="md:hidden mb-12 overflow-hidden flex flex-col items-center justify-center p-20 gap-4">
        <LogoLoader className=" text-zinc-300" size={24}  />
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400">Synchronizing Signals...</span>
      </section>);

  }

  if (stack.length === 0) {
    return (
      <section className="md:hidden mb-12 px-6">
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-12 flex flex-col items-center justify-center gap-4 text-center">
          <FileText size={40} className="text-zinc-200 dark:text-zinc-800" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Archive Quiet</span>
        </div>
      </section>);

  }

  const featured = stack[0];

  return (
    <section className="md:hidden mb-12 px-6 overflow-hidden">
      <div className="relative">
        {/* Featured Image with Large Curved Bottom */}
        <div className="relative h-[65vh] w-full overflow-hidden rounded-[3.5rem] shadow-2xl shadow-black/5">Could the US deploy troops to Iran, and how could that play out?News of the day
          Could the US deploy troops to Iran, and how could th
          <img
            src={getImageUrl(featured.image)}
            className="w-full h-full object-cover"
            alt={featured.title} />
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

          {/* News of the Day Badge */}
          <div className="absolute top-8 left-8">
            <span className="bg-white/20 backdrop-blur-xl text-white text-[9px] font-bold px-4 py-2.5 rounded-full uppercase tracking-[0.2em] border border-white/30">
              News of the day
            </span>
          </div>

          <div className="absolute top-8 right-8 z-20">
            <BookmarkButton articleId={featured._id} />
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-12 left-10 right-10 flex flex-col gap-6">
            <h1 className="text-[34px] md:text-5xl font-black font-outfit leading-[0.95] text-white tracking-tight">
              {featured.title}
            </h1>
            <div className="flex items-center">
              <Link
                href={`/articles/${featured.slug}-${featured._id}`}
                className="text-white text-sm font-bold flex items-center gap-2 group/btn">
                
                Learn More
                <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Pagination/Dots - very subtle */}
        <div className="flex justify-center gap-2 mt-8 mb-4">
          {[...Array(3)].map((_, i) =>
          <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === 0 ? 'w-6 bg-zinc-900 dark:bg-zinc-100' : 'w-1 bg-zinc-200/50 dark:bg-zinc-800/50'}`} />
          )}
        </div>
      </div>
    </section>);

}
