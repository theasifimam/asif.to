"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RevisionFlashcards from "@/components/home/RevisionFlashcards";
import { TECH_STACKS } from "@/lib/tutorialData";
import { Layers, Sparkles } from "lucide-react";

export default function RevisionPage() {
  const [selectedTech, setSelectedTech] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold w-fit shadow-md shadow-blue-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Mobile Deck</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Revision & Interview Flashcards
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Flip through essential syntax, hooks, schemas, and framework
            concepts for quick mobile revision.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedTech(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !selectedTech
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-foreground shadow-sm"
            }`}
          >
            All Tech Stacks
          </button>
          {TECH_STACKS.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelectedTech(tech.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedTech === tech.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-foreground shadow-sm"
              }`}
            >
              {tech.name}
            </button>
          ))}
        </div>

        {/* Revision Deck Component */}
        <RevisionFlashcards selectedTech={selectedTech} />

        {/* Mobile Tips Box */}
        <div className="p-5 rounded-4xl bg-white dark:bg-zinc-900/90 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-extrabold text-foreground text-sm">
              Mobile Revision Best Practice
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Try recalling the answer or syntax in your head before flipping
              the card. Revisit saved cards 10 minutes before your technical
              interviews!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
