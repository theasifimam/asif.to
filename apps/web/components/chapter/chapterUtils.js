"use client";

import React from "react";
import { parseCodeFenceMeta } from "@/lib/chapter/codeFence.mjs";
import { formatInlineMarkdown } from "@/lib/chapter/markdownInline.mjs";

export { formatInlineMarkdown };

/** Parse markdown text into structured content blocks (Headings, Paragraphs, Images, Code Blocks, Dividers) */
export function parseContentBlocks(contentArray, techName) {
  if (!contentArray || contentArray.length === 0) return [];

  // Join array into a full text body
  const fullText = Array.isArray(contentArray)
    ? contentArray.join("\n\n")
    : String(contentArray);

  // Split text by code blocks ```...``` and paragraphs
  const rawBlocks = fullText.split(/(```[\s\S]*?```)/g);

  const blocks = [];

  rawBlocks.forEach((chunk) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    // Check if block is a Code Block (```javascript ... ```)
    if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
      const firstLineEnd = trimmed.indexOf("\n");
      let lang = "javascript";
      let code = "";
      let showPlay = false;

      if (firstLineEnd !== -1) {
        const fenceMeta = trimmed.slice(3, firstLineEnd).trim() || "javascript";
        const parsedMeta = parseCodeFenceMeta(fenceMeta);
        lang = parsedMeta.language;
        code = trimmed.slice(firstLineEnd + 1, -3).trim();
        showPlay = parsedMeta.showPlay;
      } else {
        code = trimmed.slice(3, -3).trim();
      }

      // Check if first line of code has a comment title like // Title
      let snippetTitle = `${techName || "Code"} Snippet`;
      const codeLines = code.split("\n");
      if (codeLines[0] && codeLines[0].trim().startsWith("//")) {
        snippetTitle = codeLines[0].trim().replace(/^\/\/\s*/, "");
      }

      blocks.push({
        type: "code",
        code,
        lang,
        title: snippetTitle,
        showPlay,
      });
      return;
    }

    // Process normal text: line by line state machine
    const lines = trimmed.split("\n");
    let currentType = null;
    let currentBuffer = [];

    const flush = () => {
      if (currentBuffer.length === 0) return;
      const text = currentBuffer.join("\n").trim();

      if (currentType === "divider") {
        blocks.push({ type: "divider" });
      } else if (currentType === "image") {
        const imageMatch = text.match(/^!\[(.*?)\]\(\s*(\S+?)(?:\s+["'](.*?)["'])?\s*\)$/);
        if (imageMatch) {
          blocks.push({
            type: "image",
            alt: imageMatch[1],
            url: imageMatch[2],
          });
        }
      } else if (currentType === "h1") {
        blocks.push({ type: "h1", text: text.replace(/^#\s+/, "") });
      } else if (currentType === "h2") {
        blocks.push({ type: "h2", text: text.replace(/^##\s+/, "") });
      } else if (currentType === "h3") {
        blocks.push({ type: "h3", text: text.replace(/^###\s+/, "") });
      } else if (currentType === "table") {
        blocks.push({ type: "table", text });
      } else if (currentType === "blockquote") {
        blocks.push({ type: "blockquote", text });
      } else if (currentType === "list") {
        blocks.push({ type: "list", text });
      } else {
        blocks.push({ type: "text", text });
      }
      currentBuffer = [];
      currentType = null;
    };

    lines.forEach((line) => {
      const t = line.trim();

      if (!t) {
        flush(); // empty line flushes current block
        return;
      }

      // Determine the line type
      let lineType = "text";
      if (t === "---" || t === "***" || t === "___") lineType = "divider";
      else if (t.match(/^!\[(.*?)\]\(\s*(\S+?)(?:\s+["'](.*?)["'])?\s*\)$/)) lineType = "image";
      else if (t.startsWith("# ")) lineType = "h1";
      else if (t.startsWith("## ")) lineType = "h2";
      else if (t.startsWith("### ")) lineType = "h3";
      else if (t.startsWith("|") && t.includes("|")) lineType = "table";
      else if (t.startsWith(">")) lineType = "blockquote";
      else if (t.match(/^[-*]\s/) || t.match(/^\d+\.\s/)) lineType = "list";

      // Headings, images, and dividers are single-line entities, flush immediately
      if (["h1", "h2", "h3", "image", "divider"].includes(lineType)) {
        flush();
        currentType = lineType;
        currentBuffer.push(line);
        flush();
      } else {
        // If type changed from something else to a list, table, or blockquote
        if (currentType && currentType !== lineType && lineType !== "text") {
          flush();
          currentType = lineType;
        } else if (!currentType) {
          currentType = lineType;
        }

        // Handle appending to the current block
        if (currentType === "blockquote" && lineType === "blockquote") {
          currentBuffer.push(t.replace(/^>\s*/, "")); // Strip the '> '
        } else if (currentType === "blockquote" && lineType === "text") {
          currentBuffer.push(t); // Text continuing inside a blockquote
        } else {
          currentBuffer.push(line);
        }
      }
    });
    flush();
  });

  return blocks;
}



/** Render a single text string with bold, inline code, & highlight formatting */
export function renderInlineFormatting(text) {
  if (!text) return null;

  const formattedText = formatInlineMarkdown(text);

  return (
    <span
      dangerouslySetInnerHTML={{ __html: formattedText }}
      className="leading-relaxed whitespace-pre-wrap"
    />
  );
}
