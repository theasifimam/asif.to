"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CodeSnippetViewer from "@/components/articles/CodeSnippetViewer";
import { TUTORIALS, TECH_STACKS } from "@/lib/tutorialData";
import AuthorIdentityCard from "@/components/authors/AuthorIdentityCard";
import {
  ArrowLeft,
  Clock,
  Eye,
  Bookmark,
  Share2,
  Check,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function TutorialDetailPage() {
  const params = useParams();
  const tutorialId = params?.id;

  const tutorial = TUTORIALS.find((t) => t.id === tutorialId) || TUTORIALS[0];
  const tech = TECH_STACKS.find((t) => t.id === tutorial.techId);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tutorial.title,
          url: window.location.href,
        });
      } catch {
        /* ignore */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tutorials</span>
          </Link>
        </div>

        {/* Tutorial Header Card */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span
              className={`font-bold px-3 py-1 rounded-full ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
            >
              {tech?.name || tutorial.techId}
            </span>
            <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {tutorial.readTime}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {tutorial.views} views
              </span>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground leading-snug">
            {tutorial.title}
          </h1>

          <p className="text-xs sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {tutorial.summary}
          </p>

          <div className="flex items-center justify-between pt-4 text-xs">
            <span className="text-zinc-400 font-medium">
              By {tutorial.author} • Updated {tutorial.updatedAt}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-full transition-colors ${
                  isBookmarked
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-foreground"
                }`}
                title="Bookmark for revision"
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked ? "fill-amber-500" : ""}`}
                />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-foreground transition-colors"
                title="Share link"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AuthorIdentityCard updatedAt={tutorial.updatedAt} compact />

        {/* Code Snippet Section */}
        {tutorial.codeSnippet && (
          <section>
            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-2">
              Code Implementation & Snippet
            </h2>
            <CodeSnippetViewer
              code={tutorial.codeSnippet}
              title={`${tech?.name} Example`}
            />
          </section>
        )}

        {/* Explanation Points */}
        <section className="p-6 rounded-4xl bg-white dark:bg-zinc-900/90 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Core Concepts Explained
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            {tutorial.explanation.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center mt-0.5 shadow-sm">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="p-6 rounded-4xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 shadow-sm space-y-3">
          <h2 className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Interview & Revision Takeaways
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-foreground font-medium">
            {tutorial.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Next Tutorial Link */}
        <div className="flex items-center justify-between p-5 rounded-4xl bg-white dark:bg-zinc-900/90 shadow-sm">
          <div>
            <span className="text-[11px] text-zinc-400 font-medium block">
              Explore Next Topic
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-foreground">
              React Hooks: useMemo vs useCallback
            </span>
          </div>
          <Link
            href="/tutorials/react-usememo-vs-usecallback"
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-500/25"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
