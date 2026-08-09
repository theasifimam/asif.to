"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGetPageBySlugQuery } from '@/lib/api/pagesApi';
import { motion } from 'framer-motion';

export default function LegalPage() {
  const params = useParams();
  const slug = params.slug;
  const { data: page, isLoading, error } = useGetPageBySlugQuery(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfcfc] dark:bg-[#030303]">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
                    <span className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Syncing Protocol Dispatch...</span>
                </main>
                <Footer />
            </div>);

  }

  // Default title based on slug if page is not found yet
  const displayTitle = page?.title || slug.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white dark:bg-[#030303] dark:text-zinc-100 transition-colors duration-500">
            <Header />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-24">
                <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl">
          
                    <div className="flex items-center gap-4 mb-10">
                        <span className="w-12 h-[1px] bg-zinc-900 dark:bg-emerald-500"></span>
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-emerald-500">Institutional Protocol</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black font-outfit tracking-tighter text-zinc-900 dark:text-white leading-[0.9] mb-12 uppercase">
                        {displayTitle}
                    </h1>

                    {page?.content ?
          <div
            className="prose prose-xl prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed font-light ql-editor max-w-4xl overflow-x-hidden break-words whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: page.content }} /> :


          <div className="flex flex-col gap-8 mt-20">
                            <p className="text-2xl font-light text-zinc-400 italic">
                                "This protocol is currently undergoing encryption or is not yet initialized for this node."
                            </p>
                            <div className="w-20 h-[1px] bg-zinc-100 dark:bg-zinc-900"></div>
                            <p className="text-sm font-medium text-zinc-400">
                                Reference: {slug.toUpperCase()}_STABLE_v1.0
                            </p>
                        </div>
          }
                </motion.section>
            </main>

            <Footer />
        </div>);

}