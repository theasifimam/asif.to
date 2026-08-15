import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowRight, Check } from 'lucide-react';

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-900 dark:selection:bg-zinc-100 selection:text-white dark:selection:text-zinc-900 transition-colors duration-300">
            <Header />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-24">
                {/* Header Section */}
                <section className="text-center max-w-3xl mx-auto mb-20 lg:mb-24">
                    <h1 className="text-4xl md:text-6xl font-black font-outfit tracking-tighter leading-none mb-6 text-zinc-900 dark:text-white uppercase">
                        Membership Index.
                    </h1>
                    <p className="text-lg md:text-xl font-light text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                        Support independent investigative journalism. Your membership funds deep technical reporting and untangled political discourse.
                    </p>
                </section>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Digital Tier - Light Minimal */}
                    <div className="bg-white dark:bg-[#111111] p-10 md:p-14 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-10 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors rounded-[40px]">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">Tier 01</span>
                                <h2 className="text-2xl font-black font-outfit tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Digital.</h2>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">$12</span>
                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-widest mt-1">/ Month</span>
                            </div>
                        </div>

                        <ul className="flex flex-col gap-5 text-sm text-zinc-700 dark:text-zinc-300 font-light flex-1">
                            <li className="flex items-start gap-4"><Check size={16} className="text-zinc-900 dark:text-zinc-400 mt-0.5 shrink-0" /> <span className="leading-tight">Full access to weekly investigative dispatches</span></li>
                            <li className="flex items-start gap-4"><Check size={16} className="text-zinc-900 dark:text-zinc-400 mt-0.5 shrink-0" /> <span className="leading-tight">Unrestricted archive reading</span></li>
                            <li className="flex items-start gap-4"><Check size={16} className="text-zinc-900 dark:text-zinc-400 mt-0.5 shrink-0" /> <span className="leading-tight">The Friday editorial newsletter</span></li>
                        </ul>

                        <button className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold py-5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors uppercase tracking-[0.2em] text-[10px] flex justify-center items-center gap-2 group rounded-[40px]">
                            Start Membership <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Research Tier - High Contrast Dark */}
                    <div className="bg-zinc-900 dark:bg-zinc-100 p-10 md:p-14 text-white dark:text-zinc-900 shadow-2xl flex flex-col gap-10 border border-zinc-900 dark:border-zinc-100 rounded-[40px] relative">
                        <div className="absolute top-0 right-0 p-8">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white dark:text-zinc-900/50">Pro</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">Tier 02</span>
                                <h2 className="text-2xl font-black font-outfit tracking-tighter uppercase leading-none text-white dark:text-zinc-900">Research.</h2>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black tracking-tighter text-white dark:text-zinc-900">$120</span>
                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-widest mt-1">/ Annual</span>
                            </div>
                        </div>

                        <ul className="flex flex-col gap-5 text-sm text-zinc-300 dark:text-zinc-700 font-light flex-1">
                            <li className="flex items-start gap-4"><Check size={16} className="text-white dark:text-zinc-500 mt-0.5 shrink-0" /> <span className="leading-tight">All digital access passes</span></li>
                            <li className="flex items-start gap-4"><Check size={16} className="text-white dark:text-zinc-500 mt-0.5 shrink-0" /> <span className="leading-tight">Quarterly printed technical journals delivered</span></li>
                            <li className="flex items-start gap-4"><Check size={16} className="text-white dark:text-zinc-500 mt-0.5 shrink-0" /> <span className="leading-tight">Institutional raw data briefings</span></li>
                            <li className="flex items-start gap-4"><Check size={16} className="text-white dark:text-zinc-500 mt-0.5 shrink-0" /> <span className="leading-tight">Exclusive event protocols</span></li>
                        </ul>

                        <button className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold py-5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors uppercase tracking-[0.2em] text-[10px] flex justify-center items-center gap-2 group rounded-[40px]">
                            Select Annual Phase <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Institutional Call */}
                <section className="mt-32 max-w-2xl mx-auto border-t border-zinc-200 dark:border-zinc-800 pt-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                    <div className="flex flex-col gap-2 text-center md:text-left">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-zinc-100">Institutional Protocol</h3>
                        <p className="text-sm font-light text-zinc-500 dark:text-zinc-400">Enterprise deployment and academic licensing.</p>
                    </div>
                    <Link href="/contact" className="text-[10px] whitespace-nowrap font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 px-8 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2 group rounded-[40px]">
                        Inquire Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </section>
            </main>

            <Footer />
        </div>);

}