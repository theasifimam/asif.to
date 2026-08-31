"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React, { useState, useMemo } from "react";
// ASIF_COURSE_LEARNING_FLOW_V1:quiz-imports
import { useSearchParams } from "next/navigation";
import { recordCourseStage } from "@/lib/courseProgress";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SaveButton from "@/components/articles/SaveButton";
import {
  useGetCoursesQuery,
  useGetQuizQuestionsQuery,
  useSubmitPracticeQuizMutation,
} from "@/lib/api/courseApi";
import { TECH_STACKS } from "@/lib/tutorialData";
import { getImageUrl } from "@/lib/config";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ChevronRight,
  Sparkles,
  GraduationCap,
  BookOpen,
  Layers,
  Search,
  ArrowRight,
} from "lucide-react";

export default function QuizPage() {
  // ASIF_COURSE_LEARNING_FLOW_V1:quiz-query-state
  const searchParams = useSearchParams();
  const initialCourse = searchParams.get("course");
  const initialChapter = searchParams.get("chapter");
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(
    initialCourse || null,
  );
  const [selectedChapterId, setSelectedChapterId] = useState(
    initialChapter || null,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [search, setSearch] = useState("");

  const { isAuthenticated } = useSelector((state) => state.auth);
  const [submitPracticeQuiz] = useSubmitPracticeQuizMutation();

  const { data, isLoading } = useGetQuizQuestionsQuery(
    // ASIF_COURSE_LEARNING_FLOW_V1:quiz-query-filter
    selectedCourseSlug || selectedChapterId
      ? {
          ...(selectedCourseSlug ? { courseId: selectedCourseSlug } : {}),
          ...(selectedChapterId ? { chapterId: selectedChapterId } : {}),
        }
      : undefined,
  );
  const { data: coursesResponse, isLoading: areCoursesLoading } =
    useGetCoursesQuery();
  const QUIZ_QUESTIONS = data?.data || [];
  const courses = coursesResponse?.data || [];

  const filteredCourses = useMemo(() => {
    let list = courses;
    if (selectedCourseSlug) {
      list = list.filter(
        (c) =>
          c.slug?.toLowerCase() === selectedCourseSlug.toLowerCase() ||
          c.techId?.toLowerCase() === selectedCourseSlug.toLowerCase(),
      );
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.techId?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [courses, selectedCourseSlug, search]);

  const selectedCourseObj = courses.find(
    (c) =>
      c.slug === selectedCourseSlug ||
      c.techId === selectedCourseSlug ||
      c._id === selectedCourseSlug,
  );

  const question = QUIZ_QUESTIONS[currentIndex];
  const tech = TECH_STACKS.find(
    (t) => t.id === (question?.techId || selectedCourseObj?.techId),
  );

  const handleSelectOption = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    if (selectedOption === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
    setAnswers((current) => {
      const next = [...current];
      next[currentIndex] = selectedOption;
      return next;
    });
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      // ASIF_COURSE_LEARNING_FLOW_V1:quiz-record-progress
      if (selectedCourseSlug && selectedChapterId) {
        const percentage = Math.round(
          (score / Math.max(QUIZ_QUESTIONS.length, 1)) * 100,
        );
        recordCourseStage({
          courseSlug: selectedCourseSlug,
          chapterId: selectedChapterId,
          stage: "practice",
          score: percentage,
          completed: percentage >= 70,
        });
      }

      if (isAuthenticated) {
        submitPracticeQuiz({
          courseSlug: selectedCourseSlug,
          // ASIF_COURSE_LEARNING_FLOW_V1:quiz-submit-chapter
          chapterId: selectedChapterId,
          questionIds: QUIZ_QUESTIONS.map((item) => item._id),
          answers: QUIZ_QUESTIONS.map((_, index) => answers[index]),
        })
          .unwrap()
          .then(() => toast.success("Quiz score saved to your profile"))
          .catch(() =>
            toast.error("Quiz completed, but the score could not be saved"),
          );
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setAnswers([]);
  };

  const handleSelectCourse = (slug) => {
    // ASIF_COURSE_LEARNING_FLOW_V1:quiz-manual-filter
    setSelectedCourseSlug(slug);
    setSelectedChapterId(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setAnswers([]);
  };

  if (isLoading || areCoursesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 pb-24 sm:pb-12">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LogoLoader className="w-8 h-8 text-blue-500" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold text-zinc-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-200">
            Practice Quiz
          </span>
        </nav>

        {/* Top Mode Switcher Bar */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs w-fit">
          <Link
            href="/courses"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Courses</span>
          </Link>
          <Link
            href="/revision"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Flashcards Deck</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <HelpCircle className="w-4 h-4" />
            <span>Practice Quiz</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/90 p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Interactive Self-Assessment</span>
            </div>

            <h1 className="font-outfit text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white leading-tight">
              Course Practice Quizzes & Final Exams
            </h1>

            <p className="mt-3 text-xs sm:text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Select a course below to take untimed practice quizzes with
              detailed explanations, or challenge proctored final exams to earn
              official developer certificates.
            </p>

            {/* Quick Stats Pill Strip */}
            <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-800/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>{courses.length} Course Quiz Modules</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                <span>Proctored Final Exams</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Feedback & Hints</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search practice quizzes by course title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-11 pr-5 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => handleSelectCourse(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCourseSlug === null
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-emerald-500"
              }`}
            >
              All Courses ({QUIZ_QUESTIONS.length})
            </button>
            {courses.map((c) => {
              const isActive =
                selectedCourseSlug === c.slug ||
                selectedCourseSlug === c.techId;
              return (
                <button
                  key={c._id}
                  onClick={() => handleSelectCourse(c.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                      : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-emerald-500"
                  }`}
                >
                  {c.title.split(":")[0]}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Active Quiz Runner Section ─────────────────── */}
        <div
          id="practice-quiz-section"
          className="scroll-mt-24 max-w-3xl mx-auto w-full space-y-4"
        >
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>
                  {selectedCourseObj ? selectedCourseObj.title : "All Courses"}{" "}
                  Practice Mode:
                </strong>{" "}
                Untimed self-paced practice questions with step-by-step code
                explanations.
              </span>
            </div>
            {selectedCourseSlug && (
              <button
                onClick={() => handleSelectCourse(null)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Active Quiz Question Card / Results Card */}
          {QUIZ_QUESTIONS.length === 0 ? (
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md text-center flex flex-col items-center gap-3 border border-zinc-200/80 dark:border-zinc-800">
              <HelpCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
              <h3 className="font-extrabold text-base text-foreground">
                No Practice Questions Available
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm font-medium">
                There are currently no practice questions for this specific
                filter. Try selecting another course below.
              </p>
              <button
                onClick={() => handleSelectCourse(null)}
                className="mt-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Show All Course Questions
              </button>
            </div>
          ) : !isFinished ? (
            <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-5 border border-zinc-200/80 dark:border-zinc-800">
              {/* Progress bar & stats */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span
                  className={`font-bold px-3 py-1 rounded-full ${tech?.badgeBg || "bg-emerald-500/10 text-emerald-600"}`}
                >
                  {tech?.name ||
                    selectedCourseObj?.title ||
                    question?.techId ||
                    "Practice"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-bold">
                    Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <SaveButton
                    itemId={question?._id}
                    itemType="quiz_question"
                    label="Save"
                    size="sm"
                  />
                </div>
              </div>

              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
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
                      "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/25 scale-[1.01]";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 flex items-center justify-between text-xs sm:text-sm active:scale-[0.99] cursor-pointer ${optionStyle}`}
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
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
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
                    className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/25 cursor-pointer"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/25 cursor-pointer"
                  >
                    <span>
                      {currentIndex + 1 === QUIZ_QUESTIONS.length
                        ? "Finish Practice"
                        : "Next Question"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Final Score Summary Card */
            <div className="p-7 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md text-center flex flex-col items-center gap-4 border border-zinc-200/80 dark:border-zinc-800">
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
                <Award className="w-12 h-12" />
              </div>

              <h2 className="text-2xl font-black text-foreground">
                Practice Completed!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                You scored{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 text-lg font-black">
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
                    💪 Keep practicing! Check out the revision deck and
                    tutorials.
                  </span>
                )}
              </div>

              <button
                onClick={handleRestartQuiz}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/25 mt-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Practice</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Course Quiz Cards Grid (Categorized like Courses are shown) ── */}
        <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                Browse Quizzes & Final Exams by Course
              </h2>
            </div>
            <span className="text-[11px] font-bold text-zinc-400">
              Select course to practice or take exam
            </span>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const slug = course.slug || course.id || course._id;
                const isSelected =
                  selectedCourseSlug === course.slug ||
                  selectedCourseSlug === course.techId ||
                  selectedCourseSlug === course._id;

                return (
                  <article
                    key={course._id || slug}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-4xl border bg-white dark:bg-zinc-900/90 p-5 shadow-xs transition-all hover:shadow-md ${
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20"
                        : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-400"
                    }`}
                  >
                    <div>
                      {/* Thumbnail Header */}
                      {course.thumbnail ? (
                        <div className="relative mb-3.5 block w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 aspect-[2.2/1] border border-zinc-200/60 dark:border-zinc-800">
                          <Image
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-103"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="relative mb-3.5 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-zinc-900 aspect-[2.2/1] border border-emerald-500/20">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <HelpCircle className="h-5 w-5" />
                          </div>
                          <span className="mt-1 font-outfit text-xs font-black tracking-tight text-zinc-900 dark:text-white">
                            {course.title.split(":")[0]}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider bg-emerald-100/90 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                          {course.techId
                            ? course.techId.toUpperCase()
                            : "COURSE QUIZ"}
                        </span>
                        {course.examEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-purple-700 dark:text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                            <GraduationCap className="w-3 h-3 text-purple-500" />
                            <span>Exam Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                            <span>Practice Only</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-outfit text-base font-black tracking-tight text-zinc-950 dark:text-white line-clamp-1 mt-1">
                        {course.title}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                        {course.description ||
                          `Test your knowledge on ${course.title} with practice quiz questions and final certification exams.`}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        <HelpCircle className="w-4 h-4 text-emerald-500" />
                        <span>{course.chapterCount || 10}+ Questions</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            handleSelectCourse(course.slug || course.techId);
                            setTimeout(() => {
                              document
                                .getElementById("practice-quiz-section")
                                ?.scrollIntoView({ behavior: "smooth" });
                            }, 50);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-emerald-500/20"
                              : "bg-zinc-900 text-white hover:bg-emerald-600 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-emerald-600 dark:hover:text-white"
                          }`}
                        >
                          <span>
                            {isSelected ? "Practicing" : "Practice Quiz"}
                          </span>
                        </button>

                        {course.examEnabled && (
                          <Link
                            href={`/courses/${course.slug}/final-exam`}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-purple-500/20"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Exam</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
              <HelpCircle className="w-10 h-10 text-zinc-400 mb-2" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                No Quizzes Found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                No course quizzes matched your filter search criteria.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  handleSelectCourse(null);
                }}
                className="mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
