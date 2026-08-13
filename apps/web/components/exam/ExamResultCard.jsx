"use client";

import React, { useState } from "react";
import {
  Award,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { generateCertificate } from "./generateCertificate";

/**
 * ExamResultCard
 * Shows the final exam result — pass (with cert download) or fail (with retry info).
 */
export default function ExamResultCard({
  score,
  total,
  questions,
  answers,
  studentName,
  studentEmail,
  courseName,
  autoSubmitReason,
  onRetry,
  cooldownHours,
  passingScore,
  passingPercentage,
  durationMinutes,
  certificate,
  submitError,
}) {
  const [downloading, setDownloading] = useState(false);
  const requiredScore =
    passingScore ?? Math.ceil((total * (passingPercentage ?? 70)) / 100);
  const passed = score >= requiredScore;
  const percentage = Math.round((score / total) * 100);
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateCertificate({
        studentName,
        studentEmail,
        courseName,
        score,
        total,
        date: today,
        verificationUrl: certificate?.certificateUrl ? `${window.location.origin}${certificate.certificateUrl}` : "",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {submitError && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-400">{submitError}</div>}
      {/* Auto-submit warning */}
      {autoSubmitReason === "cheat" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Your exam was automatically submitted due to multiple anti-cheat
            violations (tab switching / fullscreen exit). The result below
            reflects your answers at the time of submission.
          </p>
        </div>
      )}
      {autoSubmitReason === "timeout" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Time&apos;s up! Your exam was automatically submitted when the
            {durationMinutes}-minute timer expired.
          </p>
        </div>
      )}

      {/* Main result card */}
      <div
        className={`p-7 sm:p-10 rounded-[2.5rem] shadow-xl flex flex-col items-center gap-5 text-center ${
          passed
            ? "bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10 border border-emerald-500/20"
            : "bg-linear-to-br from-red-500/10 via-rose-500/5 to-orange-500/10 border border-red-500/20"
        }`}
      >
        {/* Icon */}
        <div
          className={`p-5 rounded-full ${
            passed ? "bg-emerald-500/15" : "bg-red-500/15"
          }`}
        >
          {passed ? (
            <Award className="w-14 h-14 text-emerald-500" />
          ) : (
            <XCircle className="w-14 h-14 text-red-500" />
          )}
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">
            {passed ? "🎉 Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-sm">
            {passed
              ? `You passed the ${courseName} Final Exam and have earned your certificate.`
              : `You scored ${score}/${total} — you need at least ${requiredScore}/${total} (${passingPercentage}%) to pass. Review the course material and try again.`}
          </p>
        </div>

        {/* Score ring */}
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-zinc-200 dark:text-zinc-700"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke={passed ? "#22c55e" : "#ef4444"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - percentage / 100)}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-2xl font-black ${passed ? "text-emerald-500" : "text-red-500"}`}
            >
              {percentage}%
            </span>
            <span className="text-[10px] text-zinc-400 font-bold">
              {score}/{total}
            </span>
          </div>
        </div>

        {/* Student details */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium space-y-0.5">
          <p className="font-bold text-foreground">{studentName}</p>
          <p>{studentEmail}</p>
          <p>Completed on {today}</p>
        </div>

        {/* Actions */}
        {passed ? (
          <button
            onClick={handleDownload}
            disabled={downloading || !certificate || Boolean(submitError)}
            id="download-certificate-btn"
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Generating..." : !certificate && !submitError ? "Issuing certificate..." : "Download Certificate (PDF)"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onRetry}
              id="retry-exam-btn"
              className="flex items-center gap-2 px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Exam
              {cooldownHours > 0 && (
                <span className="text-xs opacity-75 font-medium ml-1">
                  (after {cooldownHours}h cooldown)
                </span>
              )}
            </button>
            {cooldownHours > 0 && (
              <p className="text-[11px] text-zinc-400 font-medium">
                You can retake the exam after a {cooldownHours}-hour cooldown.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Answer review */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Answer Review
        </h3>
        <div className="space-y-2.5">
          {questions.map((q, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correctIndex;
            const wasAnswered = userAnswer !== null && userAnswer !== undefined;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl text-xs font-medium border ${
                  isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 min-w-0">
                    <p className="font-bold text-foreground leading-snug">
                      Q{idx + 1}. {q.question}
                    </p>
                    {wasAnswered ? (
                      <p
                        className={`${isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        Your answer: {q.options[userAnswer]}
                      </p>
                    ) : (
                      <p className="text-zinc-400">Not answered</p>
                    )}
                    {!isCorrect && (
                      <p className="text-emerald-600 dark:text-emerald-400">
                        Correct: {q.options[q.correctIndex]}
                      </p>
                    )}
                    <p className="text-zinc-400 dark:text-zinc-500 leading-relaxed pt-0.5">
                      💡 {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
