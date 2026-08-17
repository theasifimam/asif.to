"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code2,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Eye,
  EyeOff,
  MessageSquareText,
  Tag,
} from "lucide-react";
import SaveButton from "@/components/articles/SaveButton";
import InterviewAnswer from "./InterviewAnswer";

const difficultyStyles = {
  easy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  hard: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  expert: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
};

export default function InterviewQuestionList({
  questions,
  firstNumber,
  basePath,
  indexedQuestionsMap = {},
}) {
  // Store collapsed state per question ID (default: all expanded)
  const [collapsedMap, setCollapsedMap] = useState({});

  const isCollapsed = (id) => Boolean(collapsedMap[id]);

  const toggleQuestion = (id) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allCollapsed =
    questions.length > 0 && questions.every((q) => collapsedMap[q._id]);

  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsedMap({});
    } else {
      const next = {};
      questions.forEach((q) => {
        next[q._id] = true;
      });
      setCollapsedMap(next);
    }
  };

  const followUpHref = (followUp) => {
    const target = indexedQuestionsMap[followUp.trim().toLowerCase()];
    if (!target) return null;
    const pageQuery = target.page > 1 ? `?page=${target.page}` : "";
    return `${basePath}${pageQuery}#question-${target.number}`;
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Global Collapse/Expand Controller */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 pb-3 text-xs text-zinc-500 dark:border-zinc-800/80">
        <span className="font-semibold">
          {questions.length} questions on this page
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-zinc-100/80 px-3 py-1 font-bold text-zinc-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
        >
          {allCollapsed ? (
            <>
              <ChevronsUpDown className="h-3.5 w-3.5 text-orange-500" />
              <span>Expand all answers</span>
            </>
          ) : (
            <>
              <ChevronsDownUp className="h-3.5 w-3.5 text-orange-500" />
              <span>Collapse all answers</span>
            </>
          )}
        </button>
      </div>

      <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
        {questions.map((item, index) => {
          const number = firstNumber + index;
          const collapsed = isCollapsed(item._id);

          return (
            <article
              id={`question-${number}`}
              key={item._id}
              className="w-full min-w-0 max-w-full scroll-mt-36 py-7 sm:scroll-mt-24 sm:py-9"
            >
              {/* Question Header */}
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-xs font-black text-white shadow-xs shadow-orange-500/20 sm:h-9 sm:w-9 sm:text-sm">
                  {number}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${difficultyStyles[item.difficulty] || difficultyStyles.medium}`}
                    >
                      {item.difficulty}
                    </span>
                    <span className="text-xs font-semibold capitalize text-zinc-400">
                      {item.questionType}
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-black leading-snug tracking-tight text-foreground sm:text-xl md:text-2xl">
                    {item.question}
                  </h2>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <SaveButton
                      itemId={item._id}
                      itemType="interview_question"
                      label="Save"
                      size="sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleQuestion(item._id)}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-700 transition hover:bg-orange-500/20 dark:text-orange-300 sm:hidden"
                      aria-expanded={!collapsed}
                    >
                      {collapsed ? (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Show answer</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Hide answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Answer Section on Plain Background with Left Accent Border */}
              <div className="mt-5 min-w-0 max-w-full border-l-4 border-orange-500 pl-3 sm:ml-12 sm:pl-5">
                {/* Accordion Toggle Header */}
                <button
                  type="button"
                  onClick={() => toggleQuestion(item._id)}
                  aria-expanded={!collapsed}
                  className="flex w-full items-center justify-between gap-3 text-left transition-opacity hover:opacity-80 focus:outline-none"
                >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-orange-700 dark:text-orange-300 sm:text-sm">
                    <MessageSquareText className="h-4 w-4 shrink-0 text-orange-500" />
                    <span>Interview-ready answer</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                    <span className="hidden sm:inline">
                      {collapsed ? "Show answer" : "Hide answer"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        collapsed ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                  </span>
                </button>

                {/* Collapsible Content */}
                {!collapsed ? (
                  <div className="mt-3.5 space-y-4 pt-1">
                    <div className="min-w-0 max-w-full text-justify text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-[15px] sm:leading-7">
                      <InterviewAnswer content={item.answer} />
                    </div>

                    {item.codeExample && (
                      <div className="mt-4 min-w-0 max-w-full">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          <Code2 className="h-3.5 w-3.5 text-orange-500" /> Code
                          example
                        </p>
                        <div className="overflow-x-auto rounded-2xl bg-zinc-950 p-3.5 text-xs leading-5 text-zinc-100 shadow-inner sm:p-4 sm:text-sm sm:leading-6">
                          <pre className="font-mono">
                            <code>{item.codeExample}</code>
                          </pre>
                        </div>
                        {item.expectedOutput && (
                          <div className="mt-2 overflow-x-auto rounded-2xl bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:p-3.5 sm:text-sm">
                            <pre className="font-mono">
                              <code>{item.expectedOutput}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {(item.followUps || []).length > 0 && (
                      <div className="mt-4 rounded-2xl bg-blue-50/80 p-3.5 dark:bg-blue-500/10 sm:p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-300">
                          Likely follow-up questions
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm leading-6">
                          {item.followUps.map((followUp) => {
                            const href = followUpHref(followUp);
                            return (
                              <li key={followUp}>
                                {href ? (
                                  <Link
                                    href={href}
                                    className="group flex items-start gap-2 font-semibold text-blue-700 hover:underline dark:text-blue-300"
                                  >
                                    <span aria-hidden="true">→</span>
                                    <span>{followUp}</span>
                                  </Link>
                                ) : (
                                  <span className="text-zinc-700 dark:text-zinc-300">
                                    {followUp}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {(item.tags || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            <Tag className="h-3 w-3" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleQuestion(item._id)}
                    className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-500/20 dark:text-orange-300"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Tap to reveal answer & code</span>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
