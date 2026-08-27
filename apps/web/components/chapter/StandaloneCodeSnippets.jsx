"use client";

import React from "react";
import { Code } from "lucide-react";
import InteractiveCode from "@/components/interactive-code";
import { runnableLanguage } from "@/components/interactive-code/CodePlaygroundModal";

export default function StandaloneCodeSnippets({
  standaloneSnippets = [],
  techName,
  chapterSlug,
}) {
  if (!standaloneSnippets || standaloneSnippets.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-1.5">
        <Code className="w-4 h-4 text-blue-500" />
        Interactive Code Examples ({standaloneSnippets.length})
      </h3>
      <div className="space-y-4 w-full">
        {standaloneSnippets.map((snippet, index) => {
          const title =
            snippet.title || `${techName || "Code"} Example ${index + 1}`;
          const language = runnableLanguage(
            snippet.language || snippet.lang,
            snippet.code,
          );

          return (
            <div
              key={`${title}-${index}`}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                  Edit &amp; run
                </p>
                <h4 className="mt-1 text-sm font-black text-foreground">
                  {title}
                </h4>
              </div>
              <InteractiveCode
                language={language}
                code={snippet.code}
                title={title}
                playgroundId={`${chapterSlug || "chapter"}-example-${index + 1}`}
                compact
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
