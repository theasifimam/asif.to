"use client";

import React from "react";
import { parseCodeFenceMeta } from "@/lib/chapter/codeFence.mjs";

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
        const imageMatch = text.match(/^!\[(.*?)\]\((.*?)\)$/);
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
      else if (t.match(/^!\[(.*?)\]\((.*?)\)$/)) lineType = "image";
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

  const formattedText = text
    // 1. Escape literal HTML tags to prevent arbitrary HTML execution
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // 2. Restore allowed inline HTML tags (links, bold, italic, code, mark, br)
    .replace(/&lt;a\s+href=&quot;(.*?)&quot;(.*?)&gt;(.*?)&lt;\/a&gt;/gi, '<a href="$1"$2 class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">$3</a>')
    .replace(/&lt;a\s+href='(.*?)'(.*?)&gt;(.*?)&lt;\/a&gt;/gi, '<a href="$1"$2 class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">$3</a>')
    .replace(/&lt;a\s+href=([^\s&]+)(.*?)&gt;(.*?)&lt;\/a&gt;/gi, '<a href="$1"$2 class="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-700">$3</a>')
    .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, '<strong>$1</strong>')
    .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, '<strong>$1</strong>')
    .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, '<em>$1</em>')
    .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, '<em>$1</em>')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
    .replace(/&lt;code(?:\s+class=&quot;[^&quot;]*&quot;)?&gt;(.*?)&lt;\/code&gt;/gi, '<code class="bg-zinc-200/80 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs px-1.5 py-0.5 rounded-md wrap-break-word max-w-full">$1</code>')
    // Replace Markdown highlight ==text==
    .replace(
      /==(.*?)==/g,
      '<mark class="bg-amber-300 dark:bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded-md shadow-xs">$1</mark>',
    )
    // Replace <mark> or <mark class="..."> tags (now escaped as &lt;mark&gt;)
    .replace(
      /&lt;mark(?:\s+class=&quot;[^&quot;]*&quot;)?&gt;(.*?)&lt;\/mark&gt;/gi,
      '<mark class="bg-amber-300 dark:bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded-md shadow-xs">$1</mark>',
    )
    // Replace **bold**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Replace *italic*
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // Replace _italic_
    .replace(/_(.*?)_/g, "<em>$1</em>")
    // Replace `inline code`
    .replace(
      /`(.*?)`/g,
      '<code class="bg-zinc-200/80 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs px-1.5 py-0.5 rounded-md wrap-break-word max-w-full">$1</code>',
    );

  return (
    <span
      dangerouslySetInnerHTML={{ __html: formattedText }}
      className="leading-relaxed whitespace-pre-wrap"
    />
  );
}
