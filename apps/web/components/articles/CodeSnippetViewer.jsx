"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Code, Maximize2, Minimize2, Play } from "lucide-react";
import CodePlaygroundModal from "@/components/interactive-code/CodePlaygroundModal";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github.css";

export default function CodeSnippetViewer({
  code = "",
  language = "javascript",
  title,
  showPlay = false,
}) {
  const [copied, setCopied] = useState(false);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const codeSnippetRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === codeSnippetRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === codeSnippetRef.current) {
        await document.exitFullscreen();
      } else {
        await codeSnippetRef.current?.requestFullscreen();
      }
    } catch (err) {
      console.error("Failed to toggle code fullscreen", err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  const highlightedHtml = useMemo(() => {
    if (!code) return "";
    try {
      const cleanLang = (language || "javascript").toLowerCase();
      const validLang = hljs.getLanguage(cleanLang) ? cleanLang : "javascript";
      return hljs.highlight(code, { language: validLang }).value;
    } catch {
      return code;
    }
  }, [code, language]);

  return (
    <>
      <div
        ref={codeSnippetRef}
        className="theme-code-snippet my-5 overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-xs transition-all dark:border-zinc-800 dark:bg-[#0d1117] dark:text-zinc-100"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-500 dark:border-zinc-800/60 dark:bg-[#161b22] dark:text-zinc-400 sm:px-5">
          <div className="flex items-center gap-2 min-w-0">
            <Code className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
              {title || language}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showPlay && (
              <button
                type="button"
                data-code-play="true"
                onClick={() => setPlaygroundOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 px-3 py-1 text-[11px] font-bold text-white transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Run and edit this code"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Play</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
              title={fullscreen ? "Exit fullscreen" : "Open code fullscreen"}
              aria-label={
                fullscreen ? "Exit code fullscreen" : "Open code fullscreen"
              }
            >
              {fullscreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Code Area with highlight.js & word wrapping */}
        <div className="max-w-full overflow-auto bg-white p-4 font-mono text-xs leading-relaxed text-zinc-900 selection:bg-blue-200 dark:bg-[#0d1117] dark:text-zinc-200 dark:selection:bg-blue-500/30 sm:p-5 sm:text-sm">
          <pre className="m-0 p-0! max-w-full whitespace-pre-wrap wrap-break-word border-0! bg-transparent!">
            <code
              className={`hljs language-${language} block max-w-full whitespace-pre-wrap wrap-break-word bg-transparent! p-0! m-0!`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
      {showPlay && (
        <CodePlaygroundModal
          open={playgroundOpen}
          onClose={() => setPlaygroundOpen(false)}
          code={code}
          language={language}
          title={title}
        />
      )}
    </>
  );
}
