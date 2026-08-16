"use client";

import React from "react";
import { Code } from "lucide-react";
import CodeSnippetViewer from "@/components/articles/CodeSnippetViewer";

export default function StandaloneCodeSnippets({
  standaloneSnippets = [],
  techName,
}) {
  if (!standaloneSnippets || standaloneSnippets.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-1.5">
        <Code className="w-4 h-4 text-blue-500" />
        Interactive Code Examples ({standaloneSnippets.length})
      </h3>
      <div className="space-y-4 w-full">
        {standaloneSnippets.map((sn, index) => (
          <CodeSnippetViewer
            key={index}
            code={sn.code}
            language={sn.language || sn.lang}
            title={sn.title || `${techName || "Code"} Example ${index + 1}`}
            showPlay={sn.showPlay === true || sn.playgroundEnabled === true}
          />
        ))}
      </div>
    </section>
  );
}
