"use client";

import TopicMarkdown from "@/components/articles/TopicMarkdown";

export default function InterviewAnswer({ content, className = "" }) {
  if (!content) return null;

  return (
    <div
      className={`mobile-reading-copy w-full min-w-0 max-w-full text-left text-base leading-7 text-zinc-700 [overflow-wrap:anywhere] dark:text-zinc-300 sm:text-justify ${className}`}
    >
      <TopicMarkdown content={content} />
    </div>
  );
}
