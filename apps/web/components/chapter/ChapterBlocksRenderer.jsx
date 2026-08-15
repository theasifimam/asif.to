"use client";

import React from "react";
import { Sparkles, Lightbulb } from "lucide-react";
import CodeSnippetViewer from "@/components/articles/CodeSnippetViewer";
import InteractiveCode from "@/components/interactive-code";
import { renderInlineFormatting } from "./chapterUtils";

export default function ChapterBlocksRenderer({
  chapter,
  isSimplePoints,
  parsedBlocks,
  fontBodyClass,
}) {
  let sectionHeadingCount = 0;

  if (isSimplePoints) {
    return (
      <div className="mt-2 space-y-3 text-justify">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Key Chapter Explanations
        </h3>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 font-medium">
          {chapter.content.map((point, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-100 dark:border-zinc-800/80"
            >
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">{renderInlineFormatting(point)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 ${fontBodyClass} text-justify font-medium text-zinc-700 dark:text-zinc-300`}
    >
      {parsedBlocks.map((block, idx) => {
        if (block.type === "h1") {
          sectionHeadingCount++;
          const headingId = `heading-${sectionHeadingCount}`;
          return (
            <h2
              key={idx}
              id={headingId}
              className="text-xl sm:text-3xl font-black text-foreground tracking-tight mt-10 mb-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 scroll-mt-20"
            >
              {renderInlineFormatting(block.text)}
            </h2>
          );
        }
        if (block.type === "h2") {
          sectionHeadingCount++;
          const headingId = `heading-${sectionHeadingCount}`;
          return (
            <h3
              key={idx}
              id={headingId}
              className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight mt-8 mb-3 scroll-mt-20"
            >
              {renderInlineFormatting(block.text)}
            </h3>
          );
        }
        if (block.type === "h3") {
          sectionHeadingCount++;
          const headingId = `heading-${sectionHeadingCount}`;
          return (
            <h4
              key={idx}
              id={headingId}
              className="text-base sm:text-xl font-bold text-foreground mt-6 mb-2 scroll-mt-20"
            >
              {renderInlineFormatting(block.text)}
            </h4>
          );
        }
        if (block.type === "divider") {
          return (
            <div key={idx} className="my-8 flex items-center justify-center">
              <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80" />
            </div>
          );
        }
        if (block.type === "code") {
          if (block.interactive) {
            return (
              <div key={idx} className="my-5 sm:my-8">
                <InteractiveCode language={block.lang} code={block.code} title={block.title} />
              </div>
            );
          }
          return (
            <div key={idx} className="my-3 sm:my-6">
              <CodeSnippetViewer code={block.code} language={block.lang} title={block.title} showPlay={block.showPlay} />
            </div>
          );
        }
        if (block.type === "image") {
          return (
            <div
              key={idx}
              className="my-4 sm:my-6 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <img
                src={block.url}
                alt={block.alt || "Illustration"}
                className="w-full h-auto max-h-112.5 object-cover"
              />
              {block.alt && (
                <p className="p-3 text-center text-xs text-zinc-500 font-medium italic">
                  {block.alt}
                </p>
              )}
            </div>
          );
        }
        if (block.type === "text") {
          return (
            <p
              key={idx}
              className="mb-4 text-zinc-700 dark:text-zinc-300 leading-relaxed"
            >
              {renderInlineFormatting(block.text)}
            </p>
          );
        }
        if (block.type === "blockquote") {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-blue-500 pl-4 py-3 my-4 sm:my-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-r-2xl text-zinc-800 dark:text-zinc-200 font-medium shadow-xs flex items-start gap-3"
            >
              <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1 italic leading-relaxed">
                {renderInlineFormatting(block.text)}
              </div>
            </blockquote>
          );
        }
        if (block.type === "list") {
          const listItems = block.text.split("\n").filter((l) => l.trim());
          return (
            <ul key={idx} className="space-y-3 my-5 pl-1">
              {listItems.map((li, i) => {
                const isOrdered = /^\d+\.\s/.test(li.trim());
                const content = li.trim().replace(/^([-*]|\d+\.)\s+/, "");
                return (
                  <li key={i} className="flex gap-3 text-zinc-700 dark:text-zinc-300">
                    <span className="text-blue-500 mt-1 shrink-0">
                      {isOrdered ? (
                        <span className="font-bold text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">
                          {li.trim().match(/^\d+/)?.[0]}
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block align-middle mb-0.5" />
                      )}
                    </span>
                    <span className="leading-relaxed">
                      {renderInlineFormatting(content)}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }
        if (block.type === "table") {
          const rows = block.text
            .split("\n")
            .map((r) => r.trim())
            .filter((r) => r && r.startsWith("|"));
          if (rows.length < 3) return null;
          const headers = rows[0]
            .split("|")
            .slice(1, -1)
            .map((h) => h.trim());
          const bodyRows = rows.slice(2).map((r) =>
            r
              .split("|")
              .slice(1, -1)
              .map((c) => c.trim()),
          );

          return (
            <div
              key={idx}
              className="overflow-x-auto my-4 sm:my-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs"
            >
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="px-5 py-4 text-sm font-bold text-foreground"
                      >
                        {renderInlineFormatting(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950/50">
                  {bodyRows.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-300"
                        >
                          {renderInlineFormatting(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineFormatting(block.text)}
          </p>
        );
      })}
    </div>
  );
}
