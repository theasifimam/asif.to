"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { REVISION_CARDS, TUTORIALS } from "@/lib/tutorialData";
import { Bookmark, Trash2, BookOpen, Layers } from "lucide-react";

export default function BookmarksPage() {
  const [savedCards, setSavedCards] = useState(REVISION_CARDS.slice(0, 3));
  const [savedTutorials, setSavedTutorials] = useState(TUTORIALS.slice(0, 2));

  const removeCard = (id) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
  };

  const removeTutorial = (id) => {
    setSavedTutorials((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold w-fit shadow-md shadow-amber-500/20">
            <Bookmark className="w-3.5 h-3.5 fill-white" />
            <span>Saved Offline Revision</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Saved Notes & Cards
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Quick access to your saved code snippets, revision cards, and
            tutorial notes.
          </p>
        </div>

        {/* Saved Revision Cards Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-extrabold text-foreground">
              Saved Flashcards ({savedCards.length})
            </h2>
          </div>

          {savedCards.length > 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {savedCards.map((card, idx) => (
                <div
                  key={card.id}
                  className={`p-5 space-y-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    idx === 0 ? "rounded-t-[2.5rem]" : ""
                  } ${idx === savedCards.length - 1 ? "rounded-b-[2.5rem]" : ""}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      {card.topic}
                    </span>
                    <button
                      onClick={() => removeCard(card.id)}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    {card.frontText}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl font-medium">
                    {card.backText}
                  </p>
                  {card.code && (
                    <div className="p-3 bg-zinc-950 rounded-2xl font-mono text-[11px] text-blue-300 overflow-x-auto">
                      <pre>{card.code}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-[2.5rem] bg-white dark:bg-zinc-900/90 text-xs text-zinc-400 font-medium shadow-sm border border-zinc-200/80 dark:border-zinc-800/80">
              No saved flashcards yet. Tap the bookmark icon while revising
              cards to save them here!
            </div>
          )}
        </section>

        {/* Saved Tutorials Section */}
        <section className="space-y-3 mt-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-extrabold text-foreground">
              Saved Tutorials ({savedTutorials.length})
            </h2>
          </div>

          {savedTutorials.length > 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {savedTutorials.map((t, idx) => (
                <div
                  key={t.id}
                  className={`p-5 flex flex-col gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    idx === 0 ? "rounded-t-[2.5rem]" : ""
                  } ${idx === savedTutorials.length - 1 ? "rounded-b-[2.5rem]" : ""}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {t.techId}
                    </span>
                    <button
                      onClick={() => removeTutorial(t.id)}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Link href={`/tutorials/${t.id}`}>
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground hover:text-blue-600 transition-colors">
                      {t.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium">
                    {t.summary}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-[2.5rem] bg-white dark:bg-zinc-900/90 text-xs text-zinc-400 font-medium shadow-sm border border-zinc-200/80 dark:border-zinc-800/80">
              No saved tutorials yet.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
