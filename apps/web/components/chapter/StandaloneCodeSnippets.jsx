"use client";

import React from "react";
import { Code } from "lucide-react";
import CodeSnippetViewer from "@/components/CodeSnippetViewer";

export default function StandaloneCodeSnippets({ standaloneSnippets = [], techName }) {
  if (!standaloneSnippets || standaloneSnippets.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-1.5">
        <Code className="w-4 h-4 text-blue-500" />
        Interactive Code Examples ({standaloneSnippets.length})
      </h3>
      <div className="space-y-4 px-4 md:px-0">
        {standaloneSnippets.map((sn, index) => (
          <CodeSnippetViewer
            key={index}
            code={sn.code}
            title={sn.title || `${techName || "Code"} Example ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
