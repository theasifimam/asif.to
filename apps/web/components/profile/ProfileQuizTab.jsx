"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function ProfileQuizTab({
  quizAttempts = [],
  updatingPrivacy = false,
  onChangeScorePrivacy,
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-zinc-400">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span>Quiz attempts ({quizAttempts.length})</span>
        </h3>
        {quizAttempts.length ? (
          <div className="space-y-3">
            {[...quizAttempts].reverse().map((attempt) => (
              <div
                key={attempt._id}
                className="flex flex-col gap-4 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:flex-row sm:items-center"
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                    attempt.passed
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {attempt.percentage}%
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground">
                    {attempt.courseId?.title || "Course quiz"}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-500">
                    {attempt.score}/{attempt.total} correct ·{" "}
                    {attempt.passed ? "Passed" : "Not passed"} ·{" "}
                    {new Date(attempt.attemptedAt).toLocaleDateString()}
                  </p>
                  {attempt.certificateId && (
                    <Link
                      href={`/certificates/${attempt.certificateId}`}
                      className="mt-2 inline-flex text-xs font-bold text-emerald-600 hover:underline"
                    >
                      View earned certificate
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  <span>Public score</span>
                  <Switch
                    checked={attempt.visibility === "public"}
                    disabled={updatingPrivacy}
                    onCheckedChange={(checked) =>
                      onChangeScorePrivacy &&
                      onChangeScorePrivacy(
                        attempt._id,
                        checked ? "public" : "private",
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl bg-white p-8 text-center text-sm text-zinc-500 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            Your logged-in quiz attempts will appear here.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="p-6 rounded-4xl bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-foreground">
              Interactive Practice Quizzes
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Test your JavaScript, React, Next.js, and Node.js knowledge with real-time feedback and explanations.
            </p>
          </div>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/25 hover:bg-amber-600 transition-all active:scale-95 w-full sm:w-auto"
          >
            <span>Start Quiz Now</span>
          </Link>
        </div>

        <div className="p-6 rounded-4xl bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-foreground">
              Flashcard Revision Deck
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Quickly review key full-stack concepts, syntax definitions, and interview questions on the go.
            </p>
          </div>
          <Link
            href="/revision"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:bg-purple-700 transition-all active:scale-95 w-full sm:w-auto"
          >
            <span>Practice Flashcards</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
