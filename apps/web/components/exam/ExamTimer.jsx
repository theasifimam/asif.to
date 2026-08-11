"use client";

import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

/**
 * ExamTimer
 * Circular countdown timer for the final exam.
 * Calls onExpire() when time runs out.
 * Color shifts: green → amber (< 10 min) → red (< 5 min)
 */
export default function ExamTimer({
  onExpire,
  durationMinutes = 30,
  storageKey = "exam_timer_start",
}) {
  const totalSeconds = Math.max(1, Number(durationMinutes) || 30) * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  const onExpireRef = useRef(onExpire);
  const totalSecondsRef = useRef(totalSeconds);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    totalSecondsRef.current = totalSeconds;
    const saved = sessionStorage.getItem(storageKey);
    const started = saved ? parseInt(saved, 10) : Date.now();
    if (!saved) sessionStorage.setItem(storageKey, started.toString());
    setSecondsLeft(
      Math.max(0, totalSeconds - Math.floor((Date.now() - started) / 1000)),
    );

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = secondsLeft / totalSecondsRef.current; // 1 → 0

  // Color states
  const isRed = secondsLeft < 5 * 60;
  const isAmber = !isRed && secondsLeft < 10 * 60;

  const strokeColor = isRed ? "#ef4444" : isAmber ? "#f59e0b" : "#22c55e";

  const bgColor = isRed
    ? "bg-red-500/10"
    : isAmber
      ? "bg-amber-500/10"
      : "bg-emerald-500/10";

  const textColor = isRed
    ? "text-red-500"
    : isAmber
      ? "text-amber-500"
      : "text-emerald-500";

  // SVG circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl ${bgColor} transition-colors duration-1000`}
    >
      <div className="relative w-10 h-10 shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 80 80">
          {/* Track */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-zinc-200 dark:text-zinc-700"
          />
          {/* Progress */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1s linear, stroke 1s ease",
            }}
          />
        </svg>
        <Clock className={`absolute inset-0 m-auto w-4 h-4 ${textColor}`} />
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`text-xs font-extrabold tabular-nums ${textColor} transition-colors`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-zinc-400 font-bold mt-0.5">
          remaining
        </span>
      </div>
    </div>
  );
}
