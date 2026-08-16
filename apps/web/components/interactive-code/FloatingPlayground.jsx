"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Code2, ExternalLink, Loader2, X } from "lucide-react";

const FreePlayground = dynamic(() => import("./FreePlayground"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center text-zinc-400">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading playground…
    </div>
  ),
});

export default function FloatingPlayground() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef(null);

  const openFullscreen = async () => {
    flushSync(() => setOpen(true));
    try {
      await overlayRef.current?.requestFullscreen();
    } catch {
      // Keep the full-viewport overlay open if the browser blocks fullscreen.
    }
  };

  const closeFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !document.fullscreenElement) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    const closeAfterFullscreenExit = () => {
      if (!document.fullscreenElement) setOpen(false);
    };
    document.addEventListener("fullscreenchange", closeAfterFullscreenExit);
    
    const handleCustomClose = () => setOpen(false);
    window.addEventListener("close-floating-playground", handleCustomClose);
    
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener(
        "fullscreenchange",
        closeAfterFullscreenExit,
      );
      window.removeEventListener("close-floating-playground", handleCustomClose);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openFullscreen}
        className="fixed bottom-24 right-4 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-black text-white shadow-2xl shadow-blue-600/30 transition hover:-translate-y-1 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 sm:bottom-6 sm:right-6"
        aria-label="Open code playground in fullscreen"
        title="Open code playground in fullscreen"
      >
        <Code2 className="h-5 w-5" />
        <span className="hidden sm:inline">Playground</span>
      </button>
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-100 flex flex-col bg-zinc-950 text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Code playground"
        >
          <FreePlayground fillViewport />
        </div>
      )}
    </>
  );
}
