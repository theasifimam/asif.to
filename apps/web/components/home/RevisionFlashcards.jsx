"use client";

import React, { useState } from "react";
import { useGetFlashcardsQuery } from "@/lib/api/courseApi";
import { TECH_STACKS } from "@/lib/tutorialData";
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function RevisionFlashcards({ selectedTech }) {
  const { data, isLoading } = useGetFlashcardsQuery(
    selectedTech ? { courseId: selectedTech, limit: 100 } : { limit: 100 },
  );

  const allCards = data?.data || [];
  const filteredCards = selectedTech
    ? allCards.filter((c) => c.techId === selectedTech)
    : allCards;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  if (isLoading) {
    return (
      <section className="w-full my-4 sm:my-6 bg-blue-50/60 dark:bg-zinc-900/60 p-4 sm:p-7 rounded-3xl sm:rounded-[2.5rem] shadow-xs flex items-center justify-center h-44 border border-blue-500/10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </section>
    );
  }

  if (filteredCards.length === 0) return null;

  const card = filteredCards[currentIndex % filteredCards.length];
  const tech = TECH_STACKS.find((t) => t.id === card.techId);
  const cardId = card._id || card.id;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + filteredCards.length) % filteredCards.length,
    );
  };

  const toggleSave = (e) => {
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId],
    );
  };

  const isSaved = savedIds.includes(cardId);

  return (
    <section className="w-full my-4 sm:my-6 bg-blue-50/60 dark:bg-zinc-900/60 p-4 sm:p-7 rounded-3xl sm:rounded-[2.5rem] shadow-xs border border-blue-500/10 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
              Mobile Revision Deck
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            Tap card to reveal answer
          </p>
        </div>
        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm shrink-0">
          {currentIndex + 1} / {filteredCards.length}
        </span>
      </div>

      {/* Interactive Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative min-h-52 sm:min-h-60 p-4 sm:p-6 rounded-3xl sm:rounded-4xl cursor-pointer transition-all duration-500 select-none shadow-md min-w-0 overflow-hidden ${
          isFlipped
            ? "bg-zinc-950 text-zinc-100 shadow-zinc-950/20"
            : "bg-white dark:bg-zinc-900 text-foreground hover:shadow-lg"
        }`}
      >
        <div className="flex items-center justify-between mb-2.5 text-xs gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className="font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {tech?.name || card.tag || card.techId}
            </span>
            <span className="text-zinc-400 font-medium text-[11px]">
              • {card.difficulty}
            </span>
          </div>

          <button
            onClick={toggleSave}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${
              isSaved
                ? "text-amber-500 bg-amber-500/10"
                : "text-zinc-400 hover:text-foreground"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`}
            />
          </button>
        </div>

        {/* Card Content */}
        {!isFlipped ? (
          <div className="flex flex-col justify-between h-full pt-1">
            <div>
              {card.tag && (
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 truncate">
                  {card.tag}
                </h3>
              )}
              <p className="text-sm sm:text-lg font-bold text-foreground leading-snug">
                {card.front}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold mt-4">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap card to flip answer</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full pt-1 animate-fadeIn">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Answer</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                {card.back}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400 font-bold mt-4">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap to flip back</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-3.5 gap-2">
        <button
          onClick={handlePrev}
          className="h-10 inline-flex items-center gap-1 px-3.5 rounded-full bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all shadow-xs shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-foreground font-semibold truncate"
        >
          {isFlipped ? "Show Question" : "Reveal Answer"}
        </button>
        <button
          onClick={handleNext}
          className="h-10 inline-flex items-center gap-1 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all shadow-md shadow-blue-500/25 shrink-0"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
