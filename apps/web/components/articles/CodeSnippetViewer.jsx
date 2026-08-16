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
        className="my-5 overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/70 bg-[#0d1117] text-zinc-100 shadow-xs dark:border-zinc-800/70 transition-all"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#161b22] text-xs font-mono text-zinc-400 border-b border-zinc-800/60">
          <div className="flex items-center gap-2 min-w-0">
            <Code className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-bold text-zinc-200 text-xs tracking-wide uppercase">
              {title || language}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showPlay && (
              <button
                type="button"
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
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300 hover:text-white font-semibold text-[11px] shrink-0 cursor-pointer border border-zinc-700/50"
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
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-all hover:bg-zinc-700 hover:text-white active:scale-95 cursor-pointer border border-zinc-700/50"
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
        <div className="max-w-full overflow-auto bg-[#0d1117] p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed text-zinc-200 selection:bg-blue-500/30">
          <pre className="m-0 p-0! max-w-full whitespace-pre-wrap wrap-break-word border-0! bg-transparent!">
            <code
              className={`hljs language-${language} block max-w-full whitespace-pre-wrap wrap-break-word bg-transparent! p-0! m-0!`}
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
