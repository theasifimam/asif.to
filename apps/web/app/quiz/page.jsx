"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import {
  useGetCoursesQuery,
  useGetQuizQuestionsQuery,
  useSubmitPracticeQuizMutation,
} from "@/lib/api/courseApi";
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
} from "lucide-react";

export default function QuizPage() {
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [submitPracticeQuiz] = useSubmitPracticeQuizMutation();

  const { data, isLoading } = useGetQuizQuestionsQuery(
    selectedCourseSlug ? { courseId: selectedCourseSlug } : undefined,
  );
  const { data: coursesResponse, isLoading: areCoursesLoading } =
    useGetCoursesQuery();
  const QUIZ_QUESTIONS = data?.data || [];
  const courses = coursesResponse?.data || [];

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
      if (isAuthenticated) {
        submitPracticeQuiz({
          courseSlug: selectedCourseSlug,
          questionIds: QUIZ_QUESTIONS.map((item) => item._id),
          answers: QUIZ_QUESTIONS.map((_, index) => answers[index]),
        }).unwrap().then(() => toast.success("Quiz score saved to your profile")).catch(() => toast.error("Quiz completed, but the score could not be saved"));
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
    setSelectedCourseSlug(slug);
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold w-fit shadow-md shadow-emerald-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Self-Assessment</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Course Practice Quizzes & Final Exams
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Practice course questions at your own pace (untimed & no certificate
            required), or take proctored course final exams to earn official
            certificates.
          </p>
        </div>

        {/* ── Course List Section ─────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                Courses & Certification Exams
              </h2>
            </div>
            <span className="text-[11px] font-bold text-zinc-400">
              Select course to practice or examine
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {courses.map((course) => {
              const isCurrentSelected =
                selectedCourseSlug === course.slug ||
                selectedCourseSlug === course.techId;

              return (
                <div
                  key={course._id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[2rem] bg-white dark:bg-zinc-900/90 shadow-sm border transition-all duration-200 ${
                    isCurrentSelected
                      ? "border-blue-500 shadow-md ring-2 ring-blue-500/20"
                      : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCurrentSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-base text-foreground leading-snug">
                        {course.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {course.chapterCount ?? course.chapters?.length ?? 0}{" "}
                          Lessons
                        </span>
                        {course.examEnabled && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <GraduationCap className="w-3 h-3" />
                            Final Exam Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for each course */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <SaveButton
                      itemId={course._id}
                      itemType="course"
                      label="Save"
                      size="sm"
                    />
                    <button
                      onClick={() => {
                        handleSelectCourse(course.slug);
                        setTimeout(() => {
                          document
                            .getElementById("practice-quiz-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }}
                      className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                        isCurrentSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                          : "bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>
                        {isCurrentSelected ? "Practicing Now" : "Practice Quiz"}
                      </span>
                    </button>

                    {course.examEnabled ? (
                      <Link
                        href={`/courses/${course.slug}/final-exam`}
                        className="px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-purple-500/25 flex items-center gap-1.5"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Final Exam</span>
                      </Link>
                    ) : (
                      <span className="text-[11px] font-bold text-zinc-400 px-3 py-2 bg-zinc-100 dark:bg-zinc-800/60 rounded-full">
                        Exam Soon
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Divider & Practice Quiz Section Header */}
        <div id="practice-quiz-section" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Untimed Practice Quiz
            </span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Course Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleSelectCourse(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCourseSlug === null
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {c.title.split(":")[0]}
                </button>
              );
            })}
          </div>

          {/* Mode Info Banner */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>
                  {selectedCourseObj ? selectedCourseObj.title : "All Courses"}{" "}
                  Practice Mode:
                </strong>{" "}
                Untimed self-paced questions with explanations. No time limit or
                certificate needed.
              </span>
            </div>
            {selectedCourseSlug && (
              <button
                onClick={() => handleSelectCourse(null)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {QUIZ_QUESTIONS.length === 0 ? (
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md text-center flex flex-col items-center gap-3">
            <HelpCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
            <h3 className="font-extrabold text-base text-foreground">
              No Practice Questions Available
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm font-medium">
              There are currently no practice questions for this specific
              filter. Try switching to &quot;All Courses&quot;.
            </p>
            <button
              onClick={() => handleSelectCourse(null)}
              className="mt-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all"
            >
              Show All Course Questions
            </button>
          </div>
        ) : !isFinished ? (
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-5">
            {/* Progress bar & stats */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span
                className={`font-bold px-3 py-1 rounded-full ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
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
          <div className="p-7 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md text-center flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
              <Award className="w-12 h-12" />
            </div>

            <h2 className="text-2xl font-black text-foreground">
              Practice Completed!
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
              <span>Retry Practice</span>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
