"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React, { useMemo, useState } from "react";
import { useGetCoursesQuery, useGetFlashcardsQuery } from "@/lib/api/courseApi";
import { TECH_STACKS } from "@/lib/tutorialData";
import { RotateCw, ChevronLeft, ChevronRight, Bookmark, CheckCircle2, Layers } from "lucide-react";

export default function RevisionFlashcards({
  selectedTech,
  selectedChapterId,
  onDeckComplete,
  embedded = false,
}) {
  const [activeCourseId, setActiveCourseId] = useState(selectedTech || "");
  const { data: coursesData } = useGetCoursesQuery();
  const courses = coursesData?.data || [];

  const effectiveCourse = activeCourseId || selectedTech || "";

  const queryParams = useMemo(() => {
    return {
      ...(effectiveCourse ? { courseId: effectiveCourse } : {}),
      ...(selectedChapterId ? { chapterId: selectedChapterId } : {}),
      limit: 100,
    };
  }, [effectiveCourse, selectedChapterId]);

  const { data, isLoading } = useGetFlashcardsQuery(queryParams);

  const allCards = data?.data || [];
  const filteredCards = allCards;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  const handleSelectCourse = (courseKey) => {
    setActiveCourseId(courseKey);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= filteredCards.length) onDeckComplete?.();
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
    const card = filteredCards[currentIndex % filteredCards.length];
    if (!card) return;
    const cardId = card._id || card.id;
    setSavedIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId],
    );
  };

  const courseOptions = useMemo(() => {
    if (courses.length > 0) {
      return courses.map((c) => ({
        key: c.techId || c.slug || c._id,
        label: c.title ? c.title.split(":")[0] : c.name,
      }));
    }
    return TECH_STACKS.map((t) => ({ key: t.id, label: t.name }));
  }, [courses]);

  const renderCourseSelector = () => (
    <div className="mb-3.5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1">
        <Layers className="w-3.5 h-3.5 text-blue-500" />
        Choose Course:
      </span>
      <button
        type="button"
        onClick={() => handleSelectCourse("")}
        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
          !effectiveCourse
            ? "bg-blue-600 text-white shadow-xs"
            : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-foreground border border-zinc-200 dark:border-zinc-700"
        }`}
      >
        All Courses
      </button>
      {courseOptions.map((option) => {
        const isActive =
          effectiveCourse.toLowerCase() === option.key.toLowerCase();
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => handleSelectCourse(option.key)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-foreground border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full my-3 flex flex-col items-center justify-center min-h-36 gap-2">
        <LogoLoader className="w-6 h-6 text-blue-500" />
        <span className="text-xs text-zinc-400 font-medium">Loading flashcards…</span>
      </div>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <div className="w-full my-4 p-5 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        {renderCourseSelector()}
        <div className="py-8 text-center space-y-3">
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
            No flashcards found for this course selection.
          </p>
          <button
            type="button"
            onClick={() => handleSelectCourse("")}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
          >
            Practice All Courses Flashcards
          </button>
        </div>
      </div>
    );
  }

  const card = filteredCards[currentIndex % filteredCards.length];
  const tech = TECH_STACKS.find((t) => t.id === card.techId);
  const cardId = card._id || card.id;
  const isSaved = savedIds.includes(cardId);

  const renderCardBody = () => (
    <div className="w-full min-w-0 space-y-3">
      {renderCourseSelector()}

      {!embedded && (
        <div className="flex items-center justify-between mb-3 gap-2">
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
      )}

      {embedded && (
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Tap card to flip answer
          </span>
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm shrink-0">
            {currentIndex + 1} / {filteredCards.length}
          </span>
        </div>
      )}

      {/* Interactive Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative min-h-40 sm:min-h-52 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 select-none min-w-0 overflow-hidden border ${
          isFlipped
            ? "bg-zinc-950 text-zinc-100 border-zinc-900 shadow-sm"
            : embedded
              ? "bg-zinc-50 dark:bg-zinc-950 text-foreground border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-500/50"
              : "bg-white dark:bg-zinc-900 text-foreground border-zinc-200 dark:border-zinc-800 hover:shadow-md"
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
          className="h-10 inline-flex items-center gap-1 px-3.5 rounded-full bg-white dark:bg-zinc-900 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-foreground font-semibold truncate cursor-pointer"
        >
          {isFlipped ? "Show Question" : "Reveal Answer"}
        </button>
        <button
          onClick={handleNext}
          className="h-10 inline-flex items-center gap-1 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all shadow-md shadow-blue-500/25 shrink-0 cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (embedded) {
    return renderCardBody();
  }

  return (
    <section className="w-full my-4 sm:my-6 bg-blue-50/60 dark:bg-zinc-900/60 p-4 sm:p-7 rounded-3xl sm:rounded-[2.5rem] shadow-xs border border-blue-500/10 min-w-0 overflow-hidden">
      {renderCardBody()}
    </section>
  );
}
