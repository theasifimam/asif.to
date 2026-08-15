"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import MarkdownCodePlayground from "@/components/interactive-code/MarkdownCodePlayground";

const Markdown = dynamic(
  () =>
    import("@uiw/react-md-editor").then((module) => module.default.Markdown),
  { ssr: false },
);

export default function TopicMarkdown({ content }) {
  const { resolvedTheme } = useTheme();

  return (
    <MarkdownCodePlayground
      data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}
      className="topic-markdown"
    >
      <Markdown
        source={content || ""}
        className="wmde-markdown"
        style={{ backgroundColor: "transparent", color: "inherit" }}
      />
    </MarkdownCodePlayground>
  );
}
