"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  ShieldCheck,
  LogIn,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckSquare,
  Maximize,
} from "lucide-react";
import { useGetCourseExamQuery, useSubmitCourseExamMutation } from "@/lib/api/courseApi";
import ExamTimer from "./ExamTimer";
import ExamQuestion from "./ExamQuestion";
import ExamResultCard from "./ExamResultCard";
import { useProctoredExam } from "./useProctoredExam";

function getExamCooldown(courseId) {
  try {
    const raw = localStorage.getItem(`exam_last_attempt_${courseId}`);
    if (!raw) return null;
    return new Date(raw);
  } catch {
    return null;
  }
}

function setExamCooldown(courseId) {
  try {
    localStorage.setItem(
      `exam_last_attempt_${courseId}`,
      new Date().toISOString(),
    );
  } catch {}
}

function clearExamSession(courseId) {
  try {
    sessionStorage.removeItem(`exam_timer_start_${courseId}`);
  } catch {}
}

// ── Phases ────────────────────────────────────────────────────────────────────
const PHASE_AUTH = "auth"; // not logged in
const PHASE_INTRO = "intro"; // rules screen
const PHASE_EXAM = "exam"; // active exam
const PHASE_RESULT = "result"; // result screen

export default function FinalExamClient({ courseId, course }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    data: examResponse,
    isLoading,
    isError,
    error,
  } = useGetCourseExamQuery(courseId);
  const exam = examResponse?.data;
  const questions = useMemo(() => exam?.questions || [], [exam?.questions]);
  const settings = exam?.settings || {};
  const totalQuestions = questions.length;
  const durationMinutes = settings.durationMinutes || 30;
  const passingPercentage = settings.passingPercentage || 70;
  const passingScore = Math.ceil((totalQuestions * passingPercentage) / 100);
  const cooldownHours = settings.cooldownHours ?? 24;
  const courseName = exam?.course?.title || course?.title || courseId;
  const [submitCourseExam] = useSubmitCourseExamMutation();
  const startedAt = useRef(null);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);

  // ── Cooldown check ──────────────────────────────────────────────────────────
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  useEffect(() => {
    const lastAttempt = getExamCooldown(courseId);
    if (lastAttempt) {
      const hoursSince = (Date.now() - lastAttempt.getTime()) / 3600000;
      if (hoursSince < cooldownHours) {
        const remaining = Math.ceil(cooldownHours - hoursSince);
        queueMicrotask(() => setCooldownRemaining(remaining));
      }
    }
  }, [courseId, cooldownHours]);

  // ── Phase state ────────────────────────────────────────────────────────────
  const initialPhase = !isAuthenticated ? PHASE_AUTH : PHASE_INTRO;
  const [phase, setPhase] = useState(initialPhase);

  // ── Answers array (index = question index, value = selected option index or null) ──
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSubmitReason, setAutoSubmitReason] = useState(null);
  const [score, setScore] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [submitError, setSubmitError] = useState("");

  // ── Anti-cheat ─────────────────────────────────────────────────────────────
  // ── Exam actions ───────────────────────────────────────────────────────────
  const submitExam = useCallback(
    async (finalAnswers, submissionReason = "manual") => {
      const exactQuestions = submittedQuestions.length ? submittedQuestions : questions;
      const computed = exactQuestions.reduce((acc, q, idx) => {
        return acc + (finalAnswers[idx] === q.correctIndex ? 1 : 0);
      }, 0);
      setScore(computed);
      setExamCooldown(courseId);
      clearExamSession(courseId);
      setPhase(PHASE_RESULT);
      try {
        const response = await submitCourseExam({
          courseSlug: courseId,
          questionIds: exactQuestions.map((question) => question._id),
          answers: finalAnswers,
          durationSeconds: startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : 0,
          autoSubmitReason: submissionReason,
        }).unwrap();
        setScore(response.data.attempt.score);
        setCertificate(response.data.certificate);
      } catch (error) {
        setSubmitError(error?.data?.message || "Your result could not be saved. Please try submitting again.");
      }
    },
    [questions, submittedQuestions, courseId, submitCourseExam],
  );

  const handleAutoSubmit = useCallback(
    (reason) => {
      setAutoSubmitReason(reason);
      submitExam(answers, reason);
    },
    [answers, submitExam],
  );

  const {
    violations,
    showWarning,
    warningMessage,
    dismissWarning,
    enterFullscreen,
  } = useProctoredExam(phase === PHASE_EXAM, handleAutoSubmit);

  const startExam = () => {
    clearExamSession(courseId);
    setAnswers(new Array(totalQuestions).fill(null));
    setCurrentIndex(0);
    setAutoSubmitReason(null);
    setScore(null);
    setCertificate(null);
    setSubmitError("");
    setSubmittedQuestions(questions.map((question) => ({
      ...question,
      options: [...question.options],
    })));
    startedAt.current = Date.now();
    setPhase(PHASE_EXAM);
    enterFullscreen();
  };

  const handleTimerExpire = useCallback(() => {
    setAutoSubmitReason("timeout");
    submitExam(answers, "timeout");
  }, [answers, submitExam]);

  const handleRetry = () => {
    const lastAttempt = getExamCooldown(courseId);
    if (lastAttempt) {
      const hoursSince = (Date.now() - lastAttempt.getTime()) / 3600000;
      const remaining = Math.ceil(cooldownHours - hoursSince);
      if (remaining > 0) {
        setCooldownRemaining(remaining);
        return;
      }
    }
    setCooldownRemaining(0);
    clearExamSession(courseId);
    setPhase(PHASE_INTRO);
  };

  const selectAnswer = (optionIdx) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIdx;
      return next;
    });
  };

  const answeredCount = answers.filter((a) => a !== null).length;

  // ── Progress bar for answered questions ───────────────────────────────────
  const progressPct = totalQuestions
    ? (answeredCount / totalQuestions) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm font-bold text-zinc-500">
        Loading exam...
      </div>
    );
  }

  if (isError || !exam || !totalQuestions) {
    const message =
      error?.data?.message || "This course exam is not currently available.";
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <h2 className="text-xl font-black text-foreground">Exam unavailable</h2>
        <p className="text-sm text-zinc-500">{message}</p>
      </div>
    );
  }

  // ── Render: Auth Guard ─────────────────────────────────────────────────────
  if (phase === PHASE_AUTH || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="p-5 rounded-3xl bg-blue-500/10">
          <LogIn className="w-10 h-10 text-blue-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-foreground">
            Sign In Required
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-sm">
            You must be logged into your asif.to account to take the final exam
            and receive your certificate.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/?auth=signin"
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            Sign In
          </Link>
          <Link
            href="/?auth=signup"
            className="px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground font-bold text-sm transition-all active:scale-95"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // ── Render: Intro / Rules Screen ───────────────────────────────────────────
  if (phase === PHASE_INTRO) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {/* Hero card */}
        <div className="p-6 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xl border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10">
              <ShieldCheck className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground">
                {courseName} Final Exam
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Proctored · {totalQuestions} Questions · {durationMinutes}{" "}
                Minutes
              </p>
            </div>
          </div>

          {/* Student info */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shrink-0">
              {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground">
                {user?.name || user?.username}
              </p>
              <p className="text-xs text-zinc-400 font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Cooldown notice */}
          {cooldownRemaining > 0 && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                You recently took this exam. You can retake it in{" "}
                <strong>
                  {cooldownRemaining} hour{cooldownRemaining > 1 ? "s" : ""}
                </strong>
                .
              </p>
            </div>
          )}

          {/* Rules */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-black text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Exam Rules & Proctoring
            </h2>
            <ul className="space-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {[
                `${totalQuestions} questions selected from the course question bank`,
                `You have exactly ${durationMinutes} minutes — timer cannot be paused`,
                "Exam will auto-submit when time expires",
                "You MUST stay in fullscreen mode throughout the exam",
                "Switching tabs or minimizing is recorded as a violation",
                "Two violations = automatic exam submission",
                "Right-click, copy/paste, and DevTools shortcuts are disabled",
                `You must score ${passingScore}/${totalQuestions} (${passingPercentage}%) or above to receive your certificate`,
                `Failed attempts have a ${cooldownHours}-hour cooldown before retaking`,
                "Passing earns a downloadable certificate with your name and score",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[10px] flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={startExam}
            disabled={cooldownRemaining > 0}
            id="start-exam-btn"
            className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            <Maximize className="w-5 h-5" />
            {cooldownRemaining > 0
              ? `Exam locked for ${cooldownRemaining}h`
              : "Start Exam (Enters Fullscreen)"}
          </button>

          <p className="text-center text-[11px] text-zinc-400 font-medium">
            By starting, you agree to the proctoring rules above.
          </p>
        </div>
      </div>
    );
  }

  // ── Render: Active Exam ────────────────────────────────────────────────────
  if (phase === PHASE_EXAM) {
    const question = questions[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalQuestions - 1;

    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
        {/* Anti-cheat warning banner */}
        {showWarning && (
          <div
            className="flex items-start gap-3 p-4 rounded-2xl bg-red-600 text-white text-xs font-bold shadow-xl animate-pulse cursor-pointer z-50"
            onClick={dismissWarning}
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p>{warningMessage}</p>
              <p className="font-medium opacity-80 mt-0.5">
                Violation {violations}/2 —{" "}
                {violations >= 2
                  ? "Submitting now..."
                  : "Next violation will auto-submit your exam."}
              </p>
            </div>
          </div>
        )}

        {/* Top bar: timer + progress */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Proctored Exam</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold">
              {exam.course.techId || courseName}
            </span>
          </div>
          <ExamTimer
            onExpire={handleTimerExpire}
            durationMinutes={durationMinutes}
            storageKey={`exam_timer_start_${courseId}`}
          />
        </div>

        {/* Answered progress */}
        <div className="flex items-center gap-2.5 px-1">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-bold text-zinc-500">
            {answeredCount}/{totalQuestions} answered
          </span>
          <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="p-5 sm:p-7 rounded-[2rem] bg-white dark:bg-zinc-900/90 shadow-md border border-zinc-200/60 dark:border-zinc-800/60">
          <ExamQuestion
            question={question}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
            selectedOption={answers[currentIndex]}
            onSelect={selectAnswer}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((i) => i - 1)}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 font-bold text-xs transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Question dots (desktop) */}
          <div className="hidden sm:flex flex-wrap gap-1 justify-center max-w-xs">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-6 h-6 rounded-lg text-[10px] font-black transition-all ${
                  idx === currentIndex
                    ? "bg-blue-600 text-white shadow-md"
                    : answers[idx] !== null
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {isLast ? (
            <button
              onClick={() => submitExam(answers)}
              id="submit-exam-btn"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all active:scale-95"
            >
              Submit Exam
              <CheckSquare className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Result ─────────────────────────────────────────────────────────
  if (phase === PHASE_RESULT) {
    return (
      <ExamResultCard
        score={score}
        total={totalQuestions}
        questions={submittedQuestions}
        answers={answers}
        studentName={user?.name || user?.username || "Student"}
        studentEmail={user?.email || ""}
        courseName={courseName}
        autoSubmitReason={autoSubmitReason}
        onRetry={handleRetry}
        cooldownHours={cooldownRemaining}
        passingScore={passingScore}
        passingPercentage={passingPercentage}
        durationMinutes={durationMinutes}
        certificate={certificate}
        submitError={submitError}
      />
    );
  }

  return null;
}
