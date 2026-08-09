"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGetPageBySlugQuery } from '@/lib/api/pagesApi';
import { motion } from 'framer-motion';
import { ShieldAlert, Compass, Target, Feather } from 'lucide-react';

export default function AboutPage() {
  const { data: page, isLoading } = useGetPageBySlugQuery('about');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-2 border-zinc-300 border-t-zinc-800 dark:border-t-white rounded-full animate-spin"></div>
                    <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading Protocol Overview...</span>
                </main>
                <Footer />
            </div>);

  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans transition-colors duration-500">
            <Header />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-24 md:pt-28 pb-20">
                {/* Dateline Bar */}
                <div className="flex items-center justify-between pb-4 mb-10 border-b border-zinc-200/60 dark:border-zinc-800/60 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <Feather size={14} />
                        <span className="text-zinc-900 dark:text-white font-bold">MAZLIS MANIFESTO</span>
                        <span>•</span>
                        <span className="text-zinc-400">EDITORIAL PHILOSOPHY</span>
                    </div>
                </div>

                <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mb-16">
          
                    <h1 className="text-4xl md:text-7xl font-black font-outfit tracking-tight text-zinc-900 dark:text-white leading-tight mb-8">
                        {page?.title || "Independent Journalism. Zero Noise."}
                    </h1>

                    {page?.content ?
          <div
            className="prose prose-xl prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 leading-relaxed font-light break-words whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: page.content }} /> :


          <p className="text-xl md:text-2xl font-light leading-relaxed text-zinc-500 dark:text-zinc-400 italic max-w-3xl">
                            "Mazlis News was founded on a single premise: that the infrastructure of our information determines the quality of our reality."
                        </p>
          }
                </motion.section>

                {/* Editorial Pillars */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 my-20 pt-12 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    {[
          {
            icon: <Compass size={20} className="text-emerald-500" />,
            title: 'SIGNAL OVER NOISE',
            desc: 'We only publish when we have something significant and thoroughly researched to add to the discourse.'
          },
          {
            icon: <Target size={20} className="text-amber-500" />,
            title: 'RADICAL INDEPENDENCE',
            desc: 'No venture capital influence. No clickbait advertisers. Driven purely by curiosity and investigative rigor.'
          },
          {
            icon: <ShieldAlert size={20} className="text-blue-500" />,
            title: 'SYSTEMIC RIGOR',
            desc: 'Every dispatch undergoes a multi-layer verification process evaluating technology, architecture, and political economy.'
          }].
          map((value) =>
          <div key={value.title} className="flex flex-col gap-4 p-8 bg-white dark:bg-[#121215] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                {value.icon}
                            </div>
                            <h3 className="text-lg font-bold font-outfit tracking-tight text-zinc-900 dark:text-white uppercase">{value.title}</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-light">{value.desc}</p>
                        </div>
          )}
                </section>
            </main>

            <Footer />
        </div>);

}