"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Download, Printer } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TopicMarkdown from "@/components/articles/TopicMarkdown";
import SaveButton from "@/components/articles/SaveButton";
import { useGetCheatsheetBySlugQuery } from "@/lib/api/courseApi";
import { CheatsheetReaderSkeleton } from "@/components/courses/ReaderSkeletons";
import RelatedContentSidebar from "@/components/related/RelatedContentSidebar";
import RelatedContentBottom from "@/components/related/RelatedContentBottom";
import { CheatsheetAd } from "@/components/ads/SemanticAds";

export default function CheatsheetReader({ slug, initialData, relatedData }) {
  const { data, isLoading } = useGetCheatsheetBySlugQuery(slug, {
    skip: !!initialData,
  });
  const cheatsheet = initialData || data?.data;

  if (isLoading && !initialData) return <CheatsheetReaderSkeleton />;
  if (!cheatsheet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-black">Cheatsheet not found</h1>
        <Link href="/cheatsheets" className="text-blue-600">
          Back to cheatsheets
        </Link>
      </div>
    );
  }

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const wordCount = String(cheatsheet.content || "")
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950">
      {/* Web Header (Hidden on print) */}
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24 lg:px-8 print:px-10 print:py-6">
        {/* Back Link (Hidden on print) */}
        <Link
          href="/cheatsheets"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-blue-600 print:hidden mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> All cheatsheets
        </Link>

        {/* Dedicated Print-Only Branded Header with Generous Left/Right Padding */}
        <div className="hidden print:block mb-8 pb-6 border-b-2 border-zinc-900 px-4 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="asif.to logo"
                className="w-12 h-12 rounded-xl object-contain shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-outfit font-black text-3xl tracking-tight text-zinc-950">
                    asif<span className="text-blue-600">.to</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-300">
                    Developer Reference
                  </span>
                </div>
                <span className="text-[11px] font-bold text-zinc-500 block mt-0.5">
                  Curated Technical Cheatsheets & Syntax Guides &bull; https://asif.to
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-zinc-500">
              <div>TECH: {cheatsheet.techId ? cheatsheet.techId.toUpperCase() : "GENERAL"}</div>
              <div>Printed: {currentDateFormatted}</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-1">
              {cheatsheet.techId ? cheatsheet.techId.toUpperCase() : "TECHNICAL"} CHEATSHEET
            </span>
            <h1 className="text-3xl font-black text-zinc-950 font-outfit leading-tight">
              {cheatsheet.title}
            </h1>
            {cheatsheet.seoDescription && (
              <p className="text-xs text-zinc-600 font-medium mt-1 leading-relaxed max-w-3xl">
                {cheatsheet.seoDescription}
              </p>
            )}
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main Content Area */}
          <div className="min-w-0 max-w-full">
            {/* Screen Header Card (Hidden on print) */}
            <header className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-10 print:hidden">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <BookOpen className="h-4 w-4" /> {cheatsheet.techId} cheatsheet
              </span>
              <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {cheatsheet.title}
              </h1>
              {cheatsheet.seoDescription && (
                <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-base sm:leading-7">
                  {cheatsheet.seoDescription}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-2.5">
                <SaveButton
                  itemId={cheatsheet._id}
                  itemType="cheatsheet"
                  label="Save"
                />
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-sm transition hover:bg-blue-700 cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print / Save PDF
                </button>
              </div>
            </header>

            {/* Printed & Screen Markdown Content with Left/Right Padding */}
            <article className="mt-6 min-w-0 py-4 text-justify sm:py-8 cheatsheet-print-article px-0 print:px-6">
              <TopicMarkdown content={cheatsheet.content} />
            </article>

            <div className="print:hidden">
              <CheatsheetAd wordCount={wordCount} />
            </div>

            {/* Dedicated Print Footer with Left/Right Padding */}
            <div className="hidden print:flex items-center justify-between pt-6 border-t border-zinc-300 mt-12 px-6 text-[10px] font-bold text-zinc-500">
              <span>asif.to &bull; Developer Cheatsheet & Syntax Reference</span>
              <span>https://asif.to/cheatsheets/{slug}</span>
            </div>

            {/* Mobile & Bottom Related Section (Hidden on print) */}
            <div className="print:hidden">
              <RelatedContentBottom relatedData={relatedData} />
            </div>
          </div>

          {/* Desktop Sticky Sidebar (Hidden on print) */}
          <div className="hidden lg:sticky lg:top-24 lg:block print:hidden">
            <RelatedContentSidebar relatedData={relatedData} currentType="cheatsheet" />
          </div>
        </div>
      </main>

      {/* Web Footer (Hidden on print) */}
      <Footer />
    </div>
  );
}
