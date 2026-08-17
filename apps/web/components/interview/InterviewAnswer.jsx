"use client";

import TopicMarkdown from "@/components/articles/TopicMarkdown";

export default function InterviewAnswer({ content, className = "" }) {
  if (!content) return null;

  return (
    <div className={`w-full min-w-0 max-w-full text-justify text-sm leading-7 text-zinc-700 [overflow-wrap:anywhere] dark:text-zinc-300 sm:text-[15px] ${className}`}>
      <TopicMarkdown content={content} />
    </div>
  );
}
