"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Code, Maximize2, Minimize2, Play } from "lucide-react";
import CodePlaygroundModal from "@/components/interactive-code/CodePlaygroundModal";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

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
        className="my-3 overflow-hidden rounded-4xl border border-slate-200 bg-slate-50 text-slate-900 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-100 sm:my-4 sm:rounded-4xl"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-2.5 sm:px-5 py-2.5 sm:py-3 bg-slate-100/90 dark:bg-zinc-900/90 text-xs font-mono text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 min-w-0">
            <Code className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-sans font-black tracking-wider uppercase border border-blue-500/20 shrink-0">
              asif.to
            </span>
            <span className="font-bold text-slate-800 dark:text-zinc-300 truncate">
              {title || language}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {showPlay && (
              <button
                type="button"
                onClick={() => setPlaygroundOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-emerald-400 active:scale-95 cursor-pointer"
                title="Run and edit this code"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95 transition-all text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white font-medium text-[11px] shrink-0 cursor-pointer"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Copied from asif.to!
                  </span>
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 transition-all hover:bg-slate-300 hover:text-slate-900 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
              title={fullscreen ? "Exit fullscreen" : "Open code fullscreen"}
              aria-label={
                fullscreen ? "Exit code fullscreen" : "Open code fullscreen"
              }
            >
              {fullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Code Area with highlight.js & word wrapping */}
        <div className="max-w-full overflow-auto bg-slate-50 p-2.5 font-mono text-xs leading-relaxed text-slate-900 selection:bg-blue-500/30 dark:bg-[#0b0e14] dark:text-zinc-200 sm:p-5 sm:text-sm">
          <pre className="m-0 max-w-full whitespace-pre-wrap wrap-break-word border-0! bg-transparent! p-0!">
            <code
              className={`hljs language-${language} block max-w-full whitespace-pre-wrap wrap-break-word`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
      <CodePlaygroundModal
        open={playgroundOpen}
        onClose={() => setPlaygroundOpen(false)}
        code={code}
        language={language}
        title={title}
      />
    </>
  );
}
