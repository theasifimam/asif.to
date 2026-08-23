#!/usr/bin/env python3
from __future__ import annotations
import argparse, re, shutil
from datetime import datetime
from pathlib import Path

MARKER = "ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1"

LOOP = r'''"use client";

import Link from "next/link";
import { BookOpen, Brain, CheckCircle2, Hammer, Layers } from "lucide-react";

// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1
const STAGES = [
  ["learn", "Learn", BookOpen],
  ["revise", "Revise", Layers],
  ["practice", "Practice", Brain],
  ["build", "Build", Hammer],
];

const isDone = (stage, value = {}) =>
  ["revise", "practice"].includes(stage)
    ? Boolean(value.completed) || Number(value.score) >= 70
    : Boolean(value.completed);

const hrefFor = (course, chapter, stage) =>
  stage === "learn"
    ? `/${encodeURIComponent(course)}/${encodeURIComponent(chapter)}`
    : `/${encodeURIComponent(course)}/${encodeURIComponent(chapter)}/${stage}`;

export default function ChapterLearningLoop({ courseSlug, chapter, progress }) {
  if (!chapter) return null;

  const mapped = chapter.learningAvailability || {};
  const build = chapter.learningActivities?.build || {};

  const fallback = {
    learn: true,
    revise: Number(mapped.reviseCount || 0) > 0,
    practice:
      Number(mapped.practiceCount || 0) > 0 ||
      Boolean(String(chapter.tryItChallenge || "").trim()),
    build: Boolean(
      mapped.build ??
        (build.enabled &&
          (String(build.title || "").trim() ||
            String(build.description || "").trim())),
    ),
  };

  const availability = progress?.availability || fallback;
  const visible = STAGES.filter(([key]) => availability[key]);

  if (!visible.length) return null;

  return (
    <section
      id="chapter-learning-loop"
      className="scroll-mt-28 rounded-[2rem] border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Complete this chapter
          </p>
          <h2 className="mt-1 text-xl font-black">
            {visible.map(([, label]) => label).join(" → ")}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Only activities available for this chapter are shown.
          </p>
        </div>
        <span className="text-xs font-black text-zinc-400">
          {progress?.masteryScore || 0}% chapter mastery
        </span>
      </div>

      <div className={`mt-5 grid gap-3 ${visible.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {visible.map(([key, label, Icon]) => {
          const value = progress?.stages?.[key] || {};
          const done = isDone(key, value);
          const count =
            key === "revise"
              ? Number(mapped.reviseCount || 0)
              : key === "practice"
                ? Number(mapped.practiceCount || 0)
                : 0;

          return (
            <div
              key={key}
              className={`rounded-3xl border p-4 ${
                done
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-500/5"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-xl ${
                      done
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="text-xs font-black">{label}</div>
                    {Number(value.score) > 0 && (
                      <div className="text-[10px] font-bold text-zinc-400">
                        Best score {value.score}%
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase ${done ? "text-emerald-600" : "text-zinc-400"}`}>
                  {done ? "Done" : key === "learn" ? "Current" : "Available"}
                </span>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-zinc-500">
                {key === "learn" && "Read and understand the chapter content."}
                {key === "revise" && "Recall only the revision cards mapped to this chapter."}
                {key === "practice" && "Practice only questions and challenges from this chapter."}
                {key === "build" && "Apply this chapter in its focused build challenge."}
              </p>

              {count > 0 && (
                <p className="mt-2 text-[10px] font-black text-zinc-400">
                  {count} {key === "revise" ? "mapped cards" : "mapped questions"}
                </p>
              )}

              {key === "build" && build.estimatedMinutes > 0 && (
                <p className="mt-2 text-[10px] font-black text-zinc-400">
                  ~{build.estimatedMinutes} minutes
                </p>
              )}

              {key === "learn" ? (
                <p className="mt-3 text-[10px] font-bold text-blue-600">
                  Use “Mark Done” above when the lesson is clear.
                </p>
              ) : (
                <Link
                  href={hrefFor(courseSlug, chapter.slug, key)}
                  className="mt-3 inline-flex rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white hover:bg-blue-700"
                >
                  {done ? `${label} again` : `Start ${label.toLowerCase()}`} →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
'''

ACTIVITY = r'''"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronRight,
  Hammer,
  Layers,
  Loader2,
  RotateCcw,
  XCircle,
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileChapterIndex from "@/components/courses/MobileChapterIndex";
import ChapterHeader from "@/components/chapter/ChapterHeader";
import ChapterSidebar from "@/components/chapter/ChapterSidebar";
import RevisionFlashcards from "@/components/home/RevisionFlashcards";
import TryItChallenge from "@/components/chapter/TryItChallenge";
import { TECH_STACKS } from "@/lib/tutorialData";
import {
  useGetChapterBySlugQuery,
  useGetQuizQuestionsQuery,
  useSubmitPracticeQuizMutation,
} from "@/lib/api/courseApi";
import { useCourseProgress } from "@/lib/courseProgress";

// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1
const CFG = {
  revise: {
    label: "Revise",
    icon: Layers,
    eyebrow: "Active recall",
    description:
      "Revise only the questions mapped to this course and chapter.",
  },
  practice: {
    label: "Practice",
    icon: Brain,
    eyebrow: "Focused practice",
    description:
      "Practice only this chapter. No unrelated courses or questions are mixed in.",
  },
  build: {
    label: "Build",
    icon: Hammer,
    eyebrow: "Apply what you learned",
    description:
      "Complete the build task created specifically for this chapter.",
  },
};

const ORDER = ["learn", "revise", "practice", "build"];

const route = (course, chapter, stage) =>
  stage === "learn"
    ? `/${encodeURIComponent(course)}/${encodeURIComponent(chapter)}`
    : `/${encodeURIComponent(course)}/${encodeURIComponent(chapter)}/${stage}`;

const done = (stage, value = {}) =>
  ["revise", "practice"].includes(stage)
    ? Boolean(value.completed) || Number(value.score) >= 70
    : Boolean(value.completed);

export default function ChapterActivityClient({
  courseSlug,
  chapterSlug,
  activity,
  initialData,
}) {
  const [sidebar, setSidebar] = useState(true);
  const [search, setSearch] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const activeItemRef = useRef(null);

  const { data, isLoading, isError } = useGetChapterBySlugQuery({
    courseSlug,
    chapterSlug,
  });

  const course = data?.data?.course || initialData?.course;
  const chapter = data?.data?.chapter || initialData?.chapter;
  const allChapters = useMemo(
    () => data?.data?.allChapters || initialData?.allChapters || [],
    [data?.data?.allChapters, initialData?.allChapters],
  );
  const nextChapter = data?.data?.nextChapter || initialData?.nextChapter || null;
  const slug = course?.slug || courseSlug;
  const index = allChapters.findIndex((item) => item.slug === chapter?.slug);
  const progressChapters = useMemo(
    () =>
      chapter
        ? allChapters.map((item) =>
            String(item._id) === String(chapter._id)
              ? { ...item, ...chapter }
              : item,
          )
        : allChapters,
    [allChapters, chapter],
  );

  const progress = useCourseProgress(slug, progressChapters);
  const current = chapter?._id
    ? progress.chapterMap?.[String(chapter._id)]
    : null;
  const availability =
    current?.availability || {
      learn: true,
      revise: Number(chapter?.learningAvailability?.reviseCount || 0) > 0,
      practice:
        Number(chapter?.learningAvailability?.practiceCount || 0) > 0 ||
        Boolean(String(chapter?.tryItChallenge || "").trim()),
      build: Boolean(chapter?.learningAvailability?.build),
    };

  const tech = TECH_STACKS.find((item) => item.id === course?.techId);
  const position = allChapters.length
    ? Math.round(((index + 1) / allChapters.length) * 100)
    : 0;
  const percent = progress.loading ? position : progress.overallProgress;
  const config = CFG[activity] || CFG.practice;
  const Icon = config.icon;
  const isComplete = justCompleted || done(activity, current?.stages?.[activity]);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [chapterSlug, allChapters]);

  if ((!chapter && isLoading) || progress.loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="grid min-h-[70vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (isError || !course || !chapter || !availability[activity]) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 text-center">
          <div>
            <h1 className="text-xl font-black">Activity not available</h1>
            <Link
              href={route(slug, chapter?.slug || chapterSlug, "learn")}
              className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-xs font-black text-white"
            >
              Back to chapter
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const markComplete = async (score) => {
    await progress.markStage(chapter, activity, {
      ...(score !== undefined
        ? { score, completed: score >= 70 }
        : { completed: true }),
    });
    if (score === undefined || score >= 70) setJustCompleted(true);
  };

  const nextStage = ORDER.slice(ORDER.indexOf(activity) + 1).find(
    (stage) => availability[stage],
  );
  const nextStep = nextStage
    ? {
        href: route(slug, chapter.slug, nextStage),
        label: `${nextStage[0].toUpperCase() + nextStage.slice(1)} this chapter`,
      }
    : nextChapter
      ? {
          href: route(slug, nextChapter.slug, "learn"),
          label: "Continue to next chapter",
        }
      : {
          href: `/courses/${encodeURIComponent(slug)}`,
          label: "Back to course",
        };

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950">
      <Header />

      {allChapters.length > 0 && (
        <MobileChapterIndex chapters={allChapters} activeCourseSlug={slug} />
      )}

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 pb-32 pt-36 sm:gap-6 sm:px-6 sm:pb-16 sm:pt-40 lg:pt-28">
        <ChapterHeader
          courseId={slug}
          course={course}
          tech={tech}
          progressPercentage={percent}
          isSidebarOpen={sidebar}
          setIsSidebarOpen={setSidebar}
        />

        <div className="relative grid grid-cols-1 gap-3 lg:grid-cols-12">
          <section
            className={`flex flex-col gap-3 ${
              sidebar
                ? "lg:col-span-8 xl:col-span-9"
                : "mx-auto w-full max-w-4xl lg:col-span-12"
            }`}
          >
            <div className="rounded-[2rem] border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
              <Link
                href={route(slug, chapter.slug, "learn")}
                className="inline-flex items-center gap-1.5 text-[11px] font-black text-zinc-500 hover:text-blue-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to chapter
              </Link>

              <div className="mt-5 flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                    {config.eyebrow}
                  </p>
                  <h1 className="mt-1 text-xl font-black sm:text-2xl">
                    {config.label}: {chapter.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500">
                    {config.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black text-zinc-500 dark:bg-zinc-800">
                  Chapter {index + 1} of {allChapters.length}
                </span>
                {activity === "revise" && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {chapter.learningAvailability?.reviseCount || 0} cards
                  </span>
                )}
                {activity === "practice" && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {chapter.learningAvailability?.practiceCount || 0} questions
                  </span>
                )}
                {isComplete && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </span>
                )}
              </div>
            </div>

            {activity === "revise" && (
              <RevisionFlashcards
                selectedTech={slug}
                selectedChapterId={chapter._id}
                onDeckComplete={() => markComplete()}
              />
            )}

            {activity === "practice" && (
              <Practice
                courseSlug={slug}
                chapter={chapter}
                onComplete={(score) => markComplete(score)}
              />
            )}

            {activity === "build" && (
              <Build
                chapter={chapter}
                completed={isComplete}
                onComplete={() => markComplete()}
              />
            )}

            {isComplete && (
              <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-500/5">
                <h2 className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                  {config.label} complete
                </h2>
                <Link
                  href={nextStep.href}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white"
                >
                  {nextStep.label}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </section>

          {sidebar && (
            <ChapterSidebar
              courseId={slug}
              chapter={chapter}
              allChapters={allChapters}
              currentChapterIndex={index}
              completedChapters={progress.completedChapters || []}
              sidebarSearch={search}
              setSidebarSearch={setSearch}
              activeItemRef={activeItemRef}
            />
          )}
        </div>
      </main>

      <Footer containerWidth="max-w-7xl" />
    </div>
  );
}

function Practice({ courseSlug, chapter, onComplete }) {
  const mappedCount = Number(chapter.learningAvailability?.practiceCount || 0);
  const hasTryIt = Boolean(String(chapter.tryItChallenge || "").trim());
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetQuizQuestionsQuery(
    { courseId: courseSlug, chapterId: chapter._id, limit: 100 },
    { skip: mappedCount <= 0 },
  );
  const [saveAttempt] = useSubmitPracticeQuizMutation();
  const questions = data?.data || [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setAnswers([]);
    setResult(null);
  }, [chapter._id]);

  if (isLoading) {
    return (
      <div className="grid min-h-56 place-items-center rounded-[2rem] bg-white dark:bg-zinc-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!questions.length && hasTryIt) {
    return (
      <div className="space-y-3">
        <TryItChallenge challenge={chapter.tryItChallenge} />
        <button
          type="button"
          onClick={() => onComplete?.(100)}
          className="rounded-full bg-blue-600 px-5 py-2.5 text-[11px] font-black text-white"
        >
          I completed this practice
        </button>
      </div>
    );
  }

  if (!questions.length) return null;

  const question = questions[index];

  const check = () => {
    if (selected === null || answered) return;
    const nextAnswers = [...answers];
    nextAnswers[index] = selected;
    setAnswers(nextAnswers);
    setAnswered(true);
  };

  const next = async () => {
    if (!answered) return;

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }

    const correct = questions.reduce(
      (sum, item, i) =>
        sum + (Number(answers[i]) === Number(item.correctIndex) ? 1 : 0),
      0,
    );
    const percentage = Math.round((correct / questions.length) * 100);
    setResult(percentage);
    await onComplete?.(percentage);

    if (isAuthenticated) {
      try {
        await saveAttempt({
          courseSlug,
          chapterId: chapter._id,
          questionIds: questions.map((item) => item._id),
          answers,
        }).unwrap();
        toast.success("Chapter practice score saved");
      } catch {
        toast.error("Practice completed, but score could not be saved");
      }
    }
  };

  if (result !== null) {
    return (
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-black">{result}%</h2>
        <p className="mt-2 text-xs text-zinc-500">
          {result >= 70
            ? "Practice complete."
            : "70% is required. Review the chapter and try again."}
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setAnswered(false);
            setAnswers([]);
            setResult(null);
          }}
          className="mt-4 inline-flex items-center gap-1 rounded-full border border-zinc-200 px-4 py-2 text-[11px] font-black dark:border-zinc-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Practice again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-[2rem] border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
          Question {index + 1} of {questions.length}
        </p>
        <h2 className="mt-4 text-base font-black sm:text-lg">
          {question.question}
        </h2>

        <div className="mt-5 grid gap-2">
          {(question.options || []).map((option, i) => {
            const chosen = selected === i;
            const correct = answered && i === question.correctIndex;
            const wrong = answered && chosen && i !== question.correctIndex;

            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => setSelected(i)}
                className={`flex items-start gap-3 rounded-2xl border p-3 text-left text-xs font-semibold ${
                  correct
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                    : wrong
                      ? "border-red-400 bg-red-50 dark:bg-red-500/10"
                      : chosen
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                }`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[10px] font-black dark:bg-zinc-900">
                  {correct ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : wrong ? (
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="leading-5">{option}</span>
              </button>
            );
          })}
        </div>

        {answered && question.explanation && (
          <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
            {question.explanation}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          {!answered ? (
            <button
              type="button"
              disabled={selected === null}
              onClick={check}
              className="rounded-full bg-blue-600 px-5 py-2.5 text-[11px] font-black text-white disabled:opacity-40"
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-5 py-2.5 text-[11px] font-black text-white"
            >
              {index + 1 === questions.length ? "Finish practice" : "Next question"}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {hasTryIt && <TryItChallenge challenge={chapter.tryItChallenge} />}
    </div>
  );
}

function Build({ chapter, completed, onComplete }) {
  const build = chapter.learningActivities?.build || {};
  const requirements = Array.isArray(build.requirements) ? build.requirements : [];
  const [checked, setChecked] = useState(() => new Set());
  const ready =
    requirements.length === 0 ||
    requirements.every((_, i) => checked.has(i));

  const toggle = (i) => {
    setChecked((current) => {
      const next = new Set(current);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="rounded-[2rem] border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
      <h2 className="text-lg font-black">{build.title || "Build challenge"}</h2>
      {build.description && (
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {build.description}
        </p>
      )}

      {requirements.length > 0 && (
        <div className="mt-5 space-y-2">
          {requirements.map((item, i) => {
            const selected = checked.has(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left text-xs font-semibold ${
                  selected
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-500/10"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                    selected ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300"
                  }`}
                >
                  {selected && <CheckCircle2 className="h-3 w-3" />}
                </span>
                {item}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/run"
          className="rounded-full border border-zinc-200 px-4 py-2.5 text-[11px] font-black dark:border-zinc-700"
        >
          Open Playground
        </Link>
        <button
          type="button"
          disabled={!ready || completed}
          onClick={() => onComplete?.()}
          className="rounded-full bg-blue-600 px-5 py-2.5 text-[11px] font-black text-white disabled:opacity-45"
        >
          {completed ? "Build completed ✓" : "Mark build complete"}
        </button>
      </div>
    </div>
  );
}
'''

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--root", default=".")
    p.add_argument("--dry-run", action="store_true")
    return p.parse_args()

class Patch:
    def __init__(self, root, dry):
        self.root, self.dry = root, dry
        self.changed, self.skipped = [], []
        self.backed = set()
        self.backup_root = root / ".contextual_learning_backup" / datetime.now().strftime("%Y%m%d_%H%M%S")

    def backup(self, path):
        if self.dry or path in self.backed or not path.exists():
            return
        target = self.backup_root / path.relative_to(self.root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        self.backed.add(path)

    def save(self, rel, content):
        path = self.root / rel
        old = path.read_text(encoding="utf-8") if path.exists() else None
        if old == content:
            self.skipped.append(rel)
            return
        if path.exists():
            self.backup(path)
        if not self.dry:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8", newline="\n")
        self.changed.append(rel)

    def edit(self, rel, fn):
        path = self.root / rel
        if not path.exists():
            raise RuntimeError(f"Missing {rel}")
        old = path.read_text(encoding="utf-8")
        new = fn(old)
        if new == old:
            self.skipped.append(rel)
            return
        self.backup(path)
        if not self.dry:
            path.write_text(new, encoding="utf-8", newline="\n")
        self.changed.append(rel)

    def report(self):
        print("\nContextual chapter learning", "DRY RUN" if self.dry else "APPLIED")
        for x in dict.fromkeys(self.changed):
            print(" +", x)
        if self.backed and not self.dry:
            print("Backups:", self.backup_root.relative_to(self.root))
        print("\nRoutes:")
        print(" /<course>/<chapter>/revise")
        print(" /<course>/<chapter>/practice")
        print(" /<course>/<chapter>/build")

def validate(root):
    required = [
        "apps/web/components/courses/ChapterClient.jsx",
        "apps/web/app/[username]/[topicSlug]/[...nestedSlug]/page.jsx",
        "apps/web/lib/courseProgress.js",
        "server/src/controllers/course.controller.js",
        "server/src/controllers/courseProgress.controller.js",
        "server/src/controllers/quiz.controller.js",
        "server/src/services/courseProgress.service.js",
    ]
    missing = [x for x in required if not (root / x).exists()]
    if missing:
        raise RuntimeError("Missing:\n" + "\n".join(missing))

def patch_course_controller(text):
    pat = re.compile(
        r'// ASIF_QUESTION_LEARNING_MAPPING_V1:availability-helper\nasync function attachLearningAvailability\(courseId, chapters = \[\]\) \{.*?\n\}',
        re.S,
    )
    repl = r'''// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:availability-helper
async function attachLearningAvailability(courseId, chapters = []) {
  if (!chapters.length) return chapters;
  const ids = chapters.map((chapter) => chapter._id);
  const eligible = {
    course: courseId,
    chapter: { $in: ids },
    $or: [
      { source: { $in: ["manual", "legacy"] } },
      { source: "auto", confidence: { $gte: 75 } },
    ],
  };

  const rows = await Question.aggregate([
    {
      $match: {
        type: "quiz",
        status: "published",
        learningMappings: { $elemMatch: eligible },
      },
    },
    { $unwind: "$learningMappings" },
    {
      $match: {
        "learningMappings.course": courseId,
        "learningMappings.chapter": { $in: ids },
        $or: [
          { "learningMappings.source": { $in: ["manual", "legacy"] } },
          {
            "learningMappings.source": "auto",
            "learningMappings.confidence": { $gte: 75 },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$learningMappings.chapter",
        reviseCount: {
          $sum: {
            $cond: [{ $ne: ["$flashcardEnabled", false] }, 1, 0],
          },
        },
        practiceCount: {
          $sum: {
            $cond: [{ $ne: ["$quizEnabled", false] }, 1, 0],
          },
        },
      },
    },
  ]);

  const map = new Map(rows.map((row) => [String(row._id), row]));

  return chapters.map((chapter) => {
    const row = map.get(String(chapter._id)) || {};
    const build = chapter.learningActivities?.build || {};
    return {
      ...chapter,
      learningAvailability: {
        reviseCount: Number(row.reviseCount || 0),
        practiceCount: Number(row.practiceCount || 0),
        build: Boolean(
          build.enabled &&
            (String(build.title || "").trim() ||
              String(build.description || "").trim()),
        ),
      },
    };
  });
}'''
    new, n = pat.subn(repl, text, count=1)
    if not n and MARKER not in text:
        raise RuntimeError("course availability helper not found")
    return new

def patch_progress_controller(text):
    if 'import Question from "../models/Question.js";' not in text:
        text = text.replace(
            'import CourseProgress from "../models/CourseProgress.js";',
            'import CourseProgress from "../models/CourseProgress.js";\nimport Question from "../models/Question.js";',
            1,
        )

    if "ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:progress-availability" not in text:
        anchor = '// ASIF_COURSE_LEARNING_FLOW_V1\n'
        helper = r'''// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:progress-availability
async function withLearningAvailability(courseId, chapters = []) {
  if (!chapters.length) return chapters;
  const ids = chapters.map((chapter) => chapter._id);
  const rows = await Question.aggregate([
    {
      $match: {
        type: "quiz",
        status: "published",
        learningMappings: {
          $elemMatch: {
            course: courseId,
            chapter: { $in: ids },
            $or: [
              { source: { $in: ["manual", "legacy"] } },
              { source: "auto", confidence: { $gte: 75 } },
            ],
          },
        },
      },
    },
    { $unwind: "$learningMappings" },
    {
      $match: {
        "learningMappings.course": courseId,
        "learningMappings.chapter": { $in: ids },
        $or: [
          { "learningMappings.source": { $in: ["manual", "legacy"] } },
          {
            "learningMappings.source": "auto",
            "learningMappings.confidence": { $gte: 75 },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$learningMappings.chapter",
        reviseCount: {
          $sum: { $cond: [{ $ne: ["$flashcardEnabled", false] }, 1, 0] },
        },
        practiceCount: {
          $sum: { $cond: [{ $ne: ["$quizEnabled", false] }, 1, 0] },
        },
      },
    },
  ]);
  const map = new Map(rows.map((row) => [String(row._id), row]));
  return chapters.map((chapter) => {
    const row = map.get(String(chapter._id)) || {};
    const build = chapter.learningActivities?.build || {};
    return {
      ...chapter,
      learningAvailability: {
        reviseCount: Number(row.reviseCount || 0),
        practiceCount: Number(row.practiceCount || 0),
        build: Boolean(
          build.enabled &&
            (String(build.title || "").trim() ||
              String(build.description || "").trim()),
        ),
      },
    };
  });
}

'''
        text = text.replace(anchor, helper + anchor, 1)

    text = text.replace(
        '  const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();\n  return summarizeCourseProgress({ course, chapters, progress });',
        '  const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();\n'
        '  const decorated = await withLearningAvailability(course._id, chapters);\n'
        '  return summarizeCourseProgress({ course, chapters: decorated, progress });',
        1,
    )

    text = text.replace(
        '    const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();\n    const progress = await CourseProgress.findOne({ user: req.user._id, course: course._id }).lean();\n    res.json({ success: true, data: summarizeCourseProgress({ course, chapters, progress }) });',
        '    const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();\n'
        '    const decorated = await withLearningAvailability(course._id, chapters);\n'
        '    const progress = await CourseProgress.findOne({ user: req.user._id, course: course._id }).lean();\n'
        '    res.json({ success: true, data: summarizeCourseProgress({ course, chapters: decorated, progress }) });',
        1,
    )

    text = text.replace(
        '      const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();\n      courses.push(summarizeCourseProgress({ course, chapters, progress }));',
        '      const chapters = await Chapter.find({ course: course._id, status: "published" }).sort({ order: 1 }).select(chapterSelect).lean();\n'
        '      const decorated = await withLearningAvailability(course._id, chapters);\n'
        '      courses.push(summarizeCourseProgress({ course, chapters: decorated, progress }));',
        1,
    )
    return text

def patch_quiz(text):
    marker = "// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:eligible-mapping"
    if marker in text:
        return text
    needle = '      filter.learningMappings = { $elemMatch: elem };'
    if needle not in text:
        raise RuntimeError("public question mapping filter not found")
    return text.replace(
        needle,
        marker + '\n'
        '      elem.$or = [\n'
        '        { source: { $in: ["manual", "legacy"] } },\n'
        '        { source: "auto", confidence: { $gte: 75 } },\n'
        '      ];\n'
        '      filter.learningMappings = { $elemMatch: elem };',
        1,
    )

def patch_nested(text):
    if MARKER in text:
        return text
    text = 'import ChapterActivityClient from "@/components/courses/ChapterActivityClient";\n' + text
    text = text.replace(
        'import { getPublicInterviewCategory } from "@/lib/publicContent";',
        'import { getChapterData, getPublicInterviewCategory } from "@/lib/publicContent";\nimport { notFound } from "next/navigation";',
        1,
    )
    text = text.replace(
        'export const dynamic = "force-dynamic";',
        '''export const dynamic = "force-dynamic";

// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1
const CHAPTER_ACTIVITIES = new Set(["revise", "practice", "build"]);

function activityAvailable(data, activity) {
  const chapter = data?.chapter;
  const available = chapter?.learningAvailability || {};
  if (!chapter) return false;
  if (activity === "revise") return Number(available.reviseCount || 0) > 0;
  if (activity === "practice")
    return Number(available.practiceCount || 0) > 0 ||
      Boolean(String(chapter.tryItChallenge || "").trim());
  if (activity === "build") return Boolean(available.build);
  return false;
}''',
        1,
    )

    meta_anchor = '  const { page } = (await searchParams) || {};\n\n  if (topicSlug === "interview-questions") {'
    meta_insert = '''  const { page } = (await searchParams) || {};

  if (nestedSlug.length === 1 && CHAPTER_ACTIVITIES.has(nestedSlug[0])) {
    const chapterData = await getChapterData(courseSlug, topicSlug);
    if (
      chapterData?.course &&
      chapterData?.chapter &&
      activityAvailable(chapterData, nestedSlug[0])
    ) {
      const label = nestedSlug[0][0].toUpperCase() + nestedSlug[0].slice(1);
      return {
        title: `${label}: ${chapterData.chapter.title} - ${chapterData.course.title}`,
        description: `${label} ${chapterData.chapter.title} inside the ${chapterData.course.title} course.`,
        robots: { index: false, follow: true },
      };
    }
  }

  if (topicSlug === "interview-questions") {'''
    if meta_anchor not in text:
        raise RuntimeError("metadata anchor not found")
    text = text.replace(meta_anchor, meta_insert, 1)

    page_anchor = '  const { page } = (await searchParams) || {};\n\n  if (topicSlug === "interview-questions") {'
    page_insert = '''  const { page } = (await searchParams) || {};

  if (nestedSlug.length === 1 && CHAPTER_ACTIVITIES.has(nestedSlug[0])) {
    const chapterData = await getChapterData(courseSlug, topicSlug);
    if (chapterData?.course && chapterData?.chapter) {
      if (!activityAvailable(chapterData, nestedSlug[0])) notFound();
      return (
        <ChapterActivityClient
          courseSlug={courseSlug}
          chapterSlug={topicSlug}
          activity={nestedSlug[0]}
          initialData={chapterData}
        />
      );
    }
  }

  if (topicSlug === "interview-questions") {'''
    if page_anchor not in text:
        raise RuntimeError("page anchor not found")
    return text.replace(page_anchor, page_insert, 1)

def patch_client(text):
    text = text.replace('import TryItChallenge from "@/components/chapter/TryItChallenge";\n', "", 1)
    old = '            {/* Try It Challenge */}\n            {/* ASIF_COURSE_LEARNING_FLOW_V1:practice-anchor */}\n            <div id="chapter-practice" className="scroll-mt-28"><TryItChallenge challenge={chapter?.tryItChallenge} /></div>\n            <ChapterLearningLoop courseSlug={activeCourseSlug} chapter={chapter} progress={currentProgress} onStageChange={(stage, options) => courseProgress.markStage(chapter, stage, options)} />'
    new = '''            {/* Contextual learning activities */}
            <ChapterLearningLoop
              courseSlug={activeCourseSlug}
              chapter={chapter}
              progress={currentProgress}
            />'''
    if old not in text and "Contextual learning activities" not in text:
        raise RuntimeError("ChapterClient activity block not found")
    return text.replace(old, new, 1)

def patch_backend_progress(text):
    if "ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:next-route" in text:
        return text
    pat = re.compile(
        r'const href = stage === "learn"\s*\? `\/\$\{course\.slug\}\/\$\{target\.chapter\.slug\}`\s*: stage === "revise"\s*\? `\/revision\?course=.*?`\s*: `\/\$\{course\.slug\}\/\$\{target\.chapter\.slug\}#chapter-learning-loop`;',
        re.S,
    )
    repl = '''// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:next-route
      const href = stage === "learn"
        ? `/${course.slug}/${target.chapter.slug}`
        : `/${course.slug}/${target.chapter.slug}/${stage}`;'''
    new, n = pat.subn(repl, text, count=1)
    if not n:
        raise RuntimeError("backend next route not found")
    return new

def patch_web_progress(text):
    if "ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:local-next-route" in text:
        return text
    pat = re.compile(
        r'href:\s*stage === "learn"\s*\? `\/\$\{courseSlug\}\/\$\{target\.chapter\.slug\}`\s*: stage === "revise"\s*\? `\/revision\?course=.*?`\s*: `\/\$\{courseSlug\}\/\$\{target\.chapter\.slug\}#chapter-learning-loop`,',
        re.S,
    )
    repl = '''href:
          // ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1:local-next-route
          stage === "learn"
            ? `/${courseSlug}/${target.chapter.slug}`
            : `/${courseSlug}/${target.chapter.slug}/${stage}`,'''
    new, n = pat.subn(repl, text, count=1)
    if not n:
        raise RuntimeError("frontend next route not found")
    return new

def main():
    args = parse_args()
    root = Path(args.root).resolve()
    validate(root)
    p = Patch(root, args.dry_run)

    p.save("apps/web/components/courses/ChapterLearningLoop.jsx", LOOP)
    p.save("apps/web/components/courses/ChapterActivityClient.jsx", ACTIVITY)
    p.edit("server/src/controllers/course.controller.js", patch_course_controller)
    p.edit("server/src/controllers/courseProgress.controller.js", patch_progress_controller)
    p.edit("server/src/controllers/quiz.controller.js", patch_quiz)
    p.edit("apps/web/app/[username]/[topicSlug]/[...nestedSlug]/page.jsx", patch_nested)
    p.edit("apps/web/components/courses/ChapterClient.jsx", patch_client)
    p.edit("server/src/services/courseProgress.service.js", patch_backend_progress)
    p.edit("apps/web/lib/courseProgress.js", patch_web_progress)
    p.report()

if __name__ == "__main__":
    main()
