"use client";

import React, { useState, useMemo } from "react";
import { Check, Copy, Code } from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

export default function CodeSnippetViewer({
  code = "",
  language = "javascript",
  title,
}) {
  const [copied, setCopied] = useState(false);

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
    <div className="my-3 sm:my-4 rounded-xl sm:rounded-3xl bg-zinc-950 text-zinc-100 overflow-hidden shadow-xl border border-zinc-800/80">
      {/* Header bar */}
      <div className="flex items-center justify-between px-2.5 sm:px-5 py-2.5 sm:py-3 bg-zinc-900/90 text-xs font-mono text-zinc-400 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 min-w-0">
          <Code className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-sans font-black tracking-wider uppercase border border-blue-500/20 shrink-0">
            asif.to
          </span>
          <span className="font-bold text-zinc-300 truncate">
            {title || language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300 hover:text-white font-medium text-[11px] shrink-0"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied from asif.to!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with highlight.js & word wrapping */}
      <div className="p-2.5 sm:p-5 text-xs sm:text-sm font-mono leading-relaxed bg-[#282c34] text-zinc-200 selection:bg-blue-500/30 selection:text-white">
        <pre className="whitespace-pre-wrap wrap-break-word m-0 font-mono">
          <code
            className={`hljs language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}
