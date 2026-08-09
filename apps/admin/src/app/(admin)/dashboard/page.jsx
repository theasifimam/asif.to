"use client";

import React from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  FileText,
  ArrowUpRight,
  Clock,
  Globe,
  Plus,
  Loader2 } from
'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button, Badge, Card } from "@/components/ui";
import { useGetDashboardStatsQuery } from '@/redux/services/dashboardApi';

const ICON_MAP = {
  Users,
  Clock,
  TrendingUp,
  FileText
};

export default function DashboardPage() {
  const { data: response, isLoading, isError, refetch } = useGetDashboardStatsQuery();

  const dashboardData = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-zinc-900 border-t-[#E2FF54] rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">Loading Dashboard...</span>
            </div>);

  }

  if (isError) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
                <h3 className="text-xl font-black uppercase tracking-tighter">Connection Failed</h3>
                <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Unable to connect to backend server.</p>
                <Button onClick={() => refetch()} variant="outline" className="rounded-full px-8 py-6 uppercase font-black tracking-widest text-[10px]">
                    Try Again
                </Button>
            </div>);

  }

  return (
    <div className="p-4 sm:p-6 md:p-12 flex flex-col gap-8 md:gap-12 max-w-[1600px] mx-auto text-zinc-800 dark:text-zinc-400">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex items-center gap-4">
                        <span className="w-12 h-[1px] bg-zinc-300 dark:bg-zinc-800"></span>
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500 italic">Dashboard</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
                        Overview.
                    </h1>
                </div>
                <Button
          asChild
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-6 md:py-7 rounded-2xl md:rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-black/10 dark:shadow-white/5 border-none">
          
                    <Link href="/articles/new">
                        <Plus size={18} />
                        Write Article
                    </Link>
                </Button>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(dashboardData?.stats || []).map((stat, i) => {
          const StatIcon = ICON_MAP[stat.icon] || Globe;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}>
              
                            <Card className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 shadow-none backdrop-blur-sm flex flex-col gap-4 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                        <StatIcon size={18} className="md:w-5 md:h-5" />
                                    </div>
                                    <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-500 text-[10px] md:text-[11px] font-black tracking-widest bg-emerald-500/10 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border-none">
                                        {stat.trend}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-0.5 md:gap-1">
                                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600">
                                        {stat.label}
                                    </span>
                                    <span className="text-3xl md:text-4xl font-black font-outfit text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
                                        {stat.value}
                                    </span>
                                </div>
                            </Card>
                        </motion.div>);

        })}
            </section>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Recent Activity */}
                <section className="lg:col-span-8 flex flex-col gap-8">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
                        <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white">Recent Articles</h2>
                        <Link href="/articles/published" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">View All Articles</Link>
                    </div>

                    <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
                        {(dashboardData?.recentArticles || []).map((article, i) =>
            <div key={i} className="py-5 md:py-6 flex items-start md:items-center justify-between group cursor-pointer" onClick={() => window.location.href = `/articles/${article.id}`}>
                                <div className="flex items-start md:items-center gap-4 md:gap-8 min-w-0">
                                    <span className="text-[10px] md:text-[11px] font-black italic text-zinc-400 dark:text-zinc-700 mt-1 md:mt-0">0{i + 1}</span>
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <h3 className="text-base md:text-lg font-bold font-outfit tracking-tight text-zinc-800 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors uppercase truncate pr-4">{article.title}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
                                            <span>{article.author}</span>
                                            <span className="hidden md:inline">&bull;</span>
                                            <span>{article.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 md:gap-12 shrink-0">
                                    <div className="hidden sm:flex flex-col items-end gap-1">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-700">Views</span>
                                        <span className="text-[13px] font-black text-zinc-900 dark:text-white italic">{article.views}</span>
                                    </div>
                                    <Badge variant="outline" className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] px-2 md:px-3 py-0.5 md:py-1 rounded-full border ${article.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20' :
                article.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20' :
                'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20'}`
                }>
                                        {article.status}
                                    </Badge>
                                </div>
                            </div>
            )}
                        {(!dashboardData?.recentArticles || dashboardData?.recentArticles.length === 0) &&
            <div className="py-12 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">No active articles found.</div>
            }
                    </div>
                </section>

                {/* Real-time Intel */}
                <section className="lg:col-span-4 flex flex-col gap-8">
                    <Card className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-zinc-950 shadow-none border-zinc-200 dark:border-zinc-800 flex flex-col gap-8 md:gap-10 lg:sticky lg:top-12">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-600">Topics Summary</span>
                            <h3 className="text-xl font-bold font-outfit uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">Popular Categories</h3>
                        </div>

                        <div className="flex flex-col gap-6">
                            {(dashboardData?.editorialFocus || []).map((focus) =>
              <div key={focus.label} className="flex flex-col gap-2">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                        <span className="text-zinc-500">{focus.label}</span>
                                        <span className="text-zinc-900 dark:text-white italic">{focus.intensity}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                        <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${focus.percentage || 10}%` }}
                    className={`h-full ${focus.color}`} />
                  
                                    </div>
                                </div>
              )}
                            {(!dashboardData?.editorialFocus || dashboardData?.editorialFocus.length === 0) &&
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No focus areas identified.</div>
              }
                        </div>

                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Total Users</span>
                                <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white tracking-tighter">{dashboardData?.counts?.users || 0}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Topics</span>
                                <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white tracking-tighter">{dashboardData?.counts?.topics || 0}</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button variant="ghost" className="w-full flex items-center justify-between group p-2 h-auto hover:bg-transparent">
                                <Link href="/articles/published" className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">View All Articles</Link>
                                <ArrowUpRight size={16} className="text-zinc-400 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-white transition-all" />
                            </Button>
                        </div>
                    </Card>
                </section>
            </div>
        </div>);

}