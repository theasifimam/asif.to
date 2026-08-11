"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGetQuizQuestionsQuery } from "@/lib/api/courseApi";
import { TECH_STACKS } from "@/lib/tutorialData";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ChevronRight,
  Sparkles,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function QuizPage() {
  const [selectedTech, setSelectedTech] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const { data, isLoading } = useGetQuizQuestionsQuery(
    selectedTech ? { techId: selectedTech } : undefined,
  );
  const QUIZ_QUESTIONS = data?.data || [];

  const question = QUIZ_QUESTIONS[currentIndex];
  const tech = TECH_STACKS.find((t) => t.id === question?.techId);

  const handleSelectOption = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    if (selectedOption === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 pb-24 sm:pb-12">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold w-fit shadow-md shadow-emerald-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Self-Assessment</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Mobile Practice Quiz
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Test your understanding of Next.js, React, Node.js, Express &
            MongoDB concepts.
          </p>
        </div>

        {/* ── Course Final Exams Section ─────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
              Course Final Exams
            </h2>
          </div>

          <Link
            href="/courses/reactjs/final-exam"
            className="group flex items-center justify-between gap-4 p-5 rounded-[2rem] bg-white dark:bg-zinc-900/90 shadow-md border border-zinc-200/60 dark:border-zinc-800/60 hover:border-purple-500/40 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <span className="text-2xl">⚛️</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  React.js Final Exam
                </h3>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    20 questions
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    30 min
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    Proctored
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Score 70%+ to earn your React.js certificate
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 shrink-0">
              <span className="hidden sm:inline">Take Exam</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Practice Quiz</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {!isFinished ? (
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-5">
            {/* Progress bar & stats */}
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-bold px-3 py-1 rounded-full ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
              >
                {tech?.name || question?.techId}
              </span>
              <span className="text-zinc-400 font-bold">
                Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
              </span>
            </div>

            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-xl font-extrabold text-foreground leading-snug">
              {question.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === question.correctIndex;

                let optionStyle =
                  "bg-zinc-50 dark:bg-zinc-950 text-foreground shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800";
                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle =
                      "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shadow-md";
                  } else if (isSelected && !isCorrect) {
                    optionStyle =
                      "bg-red-500/20 text-red-700 dark:text-red-300 font-bold";
                  } else {
                    optionStyle = "bg-zinc-50 dark:bg-zinc-950 opacity-50";
                  }
                } else if (isSelected) {
                  optionStyle =
                    "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 scale-[1.01]";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 flex items-center justify-between text-xs sm:text-sm active:scale-[0.99] ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && (
                      <div>
                        {isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                        {isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Explanation</span>
                </div>
                <p className="text-zinc-300 leading-relaxed font-medium">
                  {question.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-zinc-400 font-bold">
                Current Score:{" "}
                <strong className="text-foreground text-sm">{score}</strong>
              </span>

              {!isAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-500/25"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/25"
                >
                  <span>
                    {currentIndex + 1 === QUIZ_QUESTIONS.length
                      ? "Finish Quiz"
                      : "Next Question"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Final Score Summary Card */
          <div className="p-7 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md text-center flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
              <Award className="w-12 h-12" />
            </div>

            <h2 className="text-2xl font-black text-foreground">
              Quiz Completed!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              You scored{" "}
              <strong className="text-blue-600 dark:text-blue-400 text-lg font-black">
                {score}
              </strong>{" "}
              out of{" "}
              <strong className="font-black">{QUIZ_QUESTIONS.length}</strong>{" "}
              questions correctly.
            </p>

            <div className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-xs font-bold text-zinc-500">
              {score === QUIZ_QUESTIONS.length ? (
                <span className="text-emerald-500">
                  🎉 Outstanding! You mastered these concepts!
                </span>
              ) : score >= QUIZ_QUESTIONS.length / 2 ? (
                <span className="text-blue-500">
                  👍 Good effort! Review the flashcards to lock in 100%.
                </span>
              ) : (
                <span className="text-amber-500">
                  💪 Keep practicing! Check out the revision deck and tutorials.
                </span>
              )}
            </div>

            <button
              onClick={handleRestartQuiz}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/25 mt-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
