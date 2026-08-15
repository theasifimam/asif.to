"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TopicMarkdown from "@/components/articles/TopicMarkdown";
import SaveButton from "@/components/articles/SaveButton";
import { useGetCheatsheetBySlugQuery } from "@/lib/api/courseApi";
import { CheatsheetReaderSkeleton } from "@/components/courses/ReaderSkeletons";

export default function CheatsheetReader({ slug, initialData }) {
  const { data, isLoading } = useGetCheatsheetBySlugQuery(slug, {
    skip: !!initialData,
  });
  const cheatsheet = initialData || data?.data;
  if (isLoading && !initialData) return <CheatsheetReaderSkeleton />;
  if (!cheatsheet) return <div className="flex min-h-screen flex-col items-center justify-center gap-4"><h1 className="text-2xl font-black">Cheatsheet not found</h1><Link href="/cheatsheets" className="text-blue-600">Back to cheatsheets</Link></div>;


  return <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950"><Header /><main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-24 sm:px-6">
    <Link href="/cheatsheets" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> All cheatsheets</Link>
    <header className="mt-6 rounded-4xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
      <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-600"><BookOpen className="h-4 w-4" /> {cheatsheet.techId} cheatsheet</span>
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{cheatsheet.title}</h1>
      {cheatsheet.seoDescription && <p className="mt-4 text-base leading-7 text-zinc-500">{cheatsheet.seoDescription}</p>}
      <div className="mt-6 flex flex-wrap gap-2"><SaveButton itemId={cheatsheet._id} itemType="cheatsheet" label="Save" /><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-xs font-bold dark:bg-zinc-800"><Download className="h-4 w-4 text-blue-500" /> Print / Save PDF</button></div>
    </header>
    <article className="mt-6 min-w-0 py-6 text-justify sm:py-10"><TopicMarkdown content={cheatsheet.content} /></article>
  </main><Footer /></div>;
}
