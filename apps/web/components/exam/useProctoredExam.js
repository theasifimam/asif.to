"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useProctoredExam
 * Custom hook that enforces anti-cheat rules during the exam session.
 *
 * Rules:
 * - Fullscreen lock (auto-re-prompt on exit)
 * - Tab/window visibility detection (warn → auto-submit on 2nd violation)
 * - Right-click disabled
 * - DevTools shortcuts blocked (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
 * - Copy / paste / select-all blocked
 * - Text selection disabled on body
 * - beforeunload warning
 *
 * @param {boolean} isActive - whether proctoring should be active
 * @param {function} onAutoSubmit - called when exam must be force-submitted
 */
export function useProctoredExam(isActive, onAutoSubmit) {
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const violationsRef = useRef(0);
  const onAutoSubmitRef = useRef(onAutoSubmit);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  const triggerViolation = useCallback((message) => {
    violationsRef.current += 1;
    setViolations(violationsRef.current);
    setWarningMessage(message);
    setShowWarning(true);

    if (violationsRef.current >= 2) {
      // Auto-submit on second violation
      setTimeout(() => {
        onAutoSubmitRef.current?.("cheat");
      }, 2000);
    }

    // Hide warning after 5 seconds (unless it's the final one)
    if (violationsRef.current < 2) {
      setTimeout(() => setShowWarning(false), 5000);
    }
  }, []);

  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // ── Fullscreen ──────────────────────────────────────────────────────────
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isActive) {
        triggerViolation(
          "⚠️ You exited fullscreen! Please return to fullscreen mode immediately."
        );
        // Re-prompt fullscreen after short delay
        setTimeout(() => enterFullscreen(), 1500);
      }
    };

    // ── Visibility / Tab switch ─────────────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation(
          "⚠️ You switched tabs or minimized the window! This is recorded as a violation."
        );
      }
    };

    // ── Block right-click ───────────────────────────────────────────────────
    const handleContextMenu = (e) => e.preventDefault();

    // ── Block keyboard shortcuts ────────────────────────────────────────────
    const handleKeyDown = (e) => {
      const blocked =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U") ||
        (e.ctrlKey && e.key === "c") ||
        (e.ctrlKey && e.key === "v") ||
        (e.ctrlKey && e.key === "a") ||
        (e.ctrlKey && e.key === "p") ||
        (e.ctrlKey && e.key === "s") ||
        e.key === "PrintScreen";

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // ── Disable text selection on body ──────────────────────────────────────
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    // ── beforeunload warning ────────────────────────────────────────────────
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "The exam is in progress. Are you sure you want to leave?";
      return e.returnValue;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Restore text selection
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [isActive, enterFullscreen, triggerViolation]);

  const dismissWarning = useCallback(() => setShowWarning(false), []);

  return {
    violations,
    showWarning,
    warningMessage,
    dismissWarning,
    enterFullscreen,
  };
}
