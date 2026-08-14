"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import InteractiveCode from "./InteractiveCode";

const LANGUAGE_ALIASES = {
  js: "javascript",
  javascript: "javascript",
  jsx: "react",
  react: "react",
  ts: "typescript",
  typescript: "typescript",
  tsx: "react-typescript",
  html: "html",
  css: "css",
  next: "nextjs",
  "next.js": "nextjs",
  "next-js": "nextjs",
  nextjs: "nextjs",
  py: "python",
  python: "python",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  java: "java",
};

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML + CSS + JavaScript" },
  { value: "css", label: "CSS" },
  { value: "react", label: "React.js / JSX" },
  { value: "react-typescript", label: "React + TypeScript / TSX" },
  { value: "nextjs", label: "Next.js" },
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

export function runnableLanguage(language = "javascript", code = "") {
  const cleanLanguage = String(language)
    .toLowerCase()
    .replace(/^language-/, "")
    .trim();

  const looksLikeNext =
    /(?:from\s+["']next(?:\/[^"']*)?["']|require\(["']next(?:\/[^"']*)?["']\)|\bget(?:Static|ServerSide)Props\b|\bNextResponse\b|\bNextRequest\b)/.test(
      code,
    );
  if (looksLikeNext) return "nextjs";

  const looksLikeReact =
    /\b(import\s+.*from\s+["']react|use(State|Effect)|<[A-Z][\w.]*)/.test(code);
  if (["js", "javascript"].includes(cleanLanguage) && looksLikeReact) {
    return "react";
  }
  if (LANGUAGE_ALIASES[cleanLanguage]) return LANGUAGE_ALIASES[cleanLanguage];
  if (looksLikeReact) return "react";
  return "javascript";
}

export default function CodePlaygroundModal({
  open,
  onClose,
  code,
  language,
  title,
}) {
  const detectedLanguage = runnableLanguage(language, code);
  const [selectedLanguage, setSelectedLanguage] = useState(detectedLanguage);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => setSelectedLanguage(detectedLanguage), 0);
    return () => clearTimeout(timer);
  }, [open, detectedLanguage, code]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col bg-zinc-950/80 p-2 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Run ${title || "code snippet"}`}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-950 sm:rounded-3xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <Play className="h-4 w-4 fill-current" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{title || "Interactive code"}</p>
              <p className="text-[11px] font-semibold text-zinc-500">Edit the code, press Run, and inspect the output</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-500 dark:bg-zinc-800 dark:text-zinc-300" aria-label="Close interactive editor" title="Close editor (Esc)">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 p-2 sm:p-3">
          <InteractiveCode
            code={code}
            language={selectedLanguage}
            languageOptions={LANGUAGE_OPTIONS}
            onLanguageChange={setSelectedLanguage}
            title={title || "Code snippet"}
            fillViewport
          />
        </div>
      </div>
    </div>
  );
}
