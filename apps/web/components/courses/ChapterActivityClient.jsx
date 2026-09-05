"use client";

import LogoLoader from "@/components/ui/LogoLoader";
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
    description: "Revise only the questions mapped to this course and chapter.",
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
  const nextChapter =
    data?.data?.nextChapter || initialData?.nextChapter || null;
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
  const availability = current?.availability || {
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
  const isComplete =
    justCompleted || done(activity, current?.stages?.[activity]);

  useEffect(() => {
    // Ensure the page always opens at the top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Scroll only the sidebar's internal list container without moving the window
    if (activeItemRef.current) {
      const el = activeItemRef.current;
      const container = el.closest(".overflow-y-auto");
      if (container) {
        const elTop = el.offsetTop;
        const containerHeight = container.clientHeight;
        const containerScroll = container.scrollTop;
        if (
          elTop < containerScroll ||
          elTop + el.clientHeight > containerScroll + containerHeight
        ) {
          container.scrollTo({
            top: Math.max(0, elTop - containerHeight / 2 + el.clientHeight / 2),
            behavior: "smooth",
          });
        }
      }
    }
  }, [chapterSlug, allChapters]);

  if ((!chapter && isLoading) || progress.loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="grid min-h-[70vh] place-items-center">
          <LogoLoader className="h-8 w-8  text-blue-600"  />
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
  const prevStage = ORDER.slice(0, ORDER.indexOf(activity))
    .reverse()
    .find((stage) => availability[stage]);

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

  const prevStep = prevStage
    ? {
        href: route(slug, chapter.slug, prevStage),
        label: `Back to ${prevStage}`,
      }
    : {
        href: route(slug, chapter.slug, "learn"),
        label: "Back to chapter",
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
            <div className="rounded-4xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
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
                embedded
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
              <div className="rounded-4xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-500/5">
                <h2 className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                  {config.label} complete
                </h2>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={prevStep.href}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200/50 bg-white/50 px-4 py-2 text-[11px] font-black text-emerald-800 hover:bg-white dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {prevStep.label}
                  </Link>
                  <Link
                    href={nextStep.href}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black text-white"
                  >
                    {nextStep.label}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
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
      <div className="grid min-h-56 place-items-center rounded-4xl bg-white dark:bg-zinc-900">
        <LogoLoader className="h-6 w-6  text-blue-600"  />
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
      <div className="rounded-4xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
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
      <div className="rounded-4xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
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
              {index + 1 === questions.length
                ? "Finish practice"
                : "Next question"}
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
  const requirements = Array.isArray(build.requirements)
    ? build.requirements
    : [];
  const [checked, setChecked] = useState(() => new Set());
  const ready =
    requirements.length === 0 || requirements.every((_, i) => checked.has(i));

  const toggle = (i) => {
    setChecked((current) => {
      const next = new Set(current);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="rounded-4xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
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
                    selected
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-zinc-300"
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
