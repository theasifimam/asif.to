"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CodeSnippetViewer from "@/components/CodeSnippetViewer";
import { useGetChapterBySlugQuery } from "@/lib/api/courseApi";
import { TECH_STACKS } from "@/lib/tutorialData";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Play,
  List,
  X,
  Loader2,
  AlertCircle,
  Code,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  BookOpen,
  Maximize2,
  Minimize2,
  Clock,
  Check,
  Lightbulb,
  FileText,
  Bookmark,
  Share2,
} from "lucide-react";

/** Parse markdown text into structured content blocks (Headings, Paragraphs, Images, Code Blocks, Dividers) */
function parseContentBlocks(contentArray, techName) {
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

      if (firstLineEnd !== -1) {
        lang = trimmed.slice(3, firstLineEnd).trim() || "javascript";
        code = trimmed.slice(firstLineEnd + 1, -3).trim();
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
function renderInlineFormatting(text) {
  if (!text) return null;

  const formattedText = text
    // Replace Markdown highlight ==text==
    .replace(
      /==(.*?)==/g,
      '<mark class="bg-amber-300 dark:bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded-md shadow-xs">$1</mark>',
    )
    // Replace <mark> or <mark class="..."> tags
    .replace(
      /<mark(?:\s+class="[^"]*")?>(.*?)<\/mark>/gi,
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

export default function CourseChapterPage() {
  const params = useParams();
  const courseId = params?.courseId;
  const chapterId = params?.chapterId;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState("md"); // 'sm', 'md', 'lg'
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Local state for completed chapters
  const [completedChapters, setCompletedChapters] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined" && courseId) {
      try {
        const saved = localStorage.getItem(`course_completed_${courseId}`);
        if (saved) setCompletedChapters(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [courseId]);

  const toggleChapterComplete = (slug) => {
    setCompletedChapters((prev) => {
      const updated = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      if (typeof window !== "undefined" && courseId) {
        try {
          localStorage.setItem(
            `course_completed_${courseId}`,
            JSON.stringify(updated),
          );
        } catch {
          /* ignore */
        }
      }
      return updated;
    });
  };

  const { data, isLoading, isError } = useGetChapterBySlugQuery(
    { courseSlug: courseId, chapterSlug: chapterId },
    { skip: !courseId || !chapterId },
  );

  const course = data?.data?.course;
  const chapter = data?.data?.chapter;
  const allChapters = data?.data?.allChapters || [];
  const prevChapter = data?.data?.prevChapter;
  const nextChapter = data?.data?.nextChapter;

  const tech = TECH_STACKS.find((t) => t.id === course?.techId);
  const currentChapterIndex = allChapters.findIndex(
    (c) => c.slug === chapter?.slug,
  );
  const progressPercentage = allChapters.length
    ? Math.round(((currentChapterIndex + 1) / allChapters.length) * 100)
    : 0;

  const activeItemRef = useRef(null);

  // Parse structured blocks from chapter content
  const parsedBlocks = useMemo(
    () => parseContentBlocks(chapter?.content, tech?.name),
    [chapter?.content, tech?.name],
  );

  // Extract Table of Contents from headings
  const tableOfContents = useMemo(() => {
    let headingCount = 0;
    return parsedBlocks
      .filter((b) => b.type === "h1" || b.type === "h2" || b.type === "h3")
      .map((b) => {
        headingCount++;
        return {
          id: `heading-${headingCount}`,
          text: b.text,
          type: b.type,
        };
      });
  }, [parsedBlocks]);

  // Calculate estimated reading time
  const estimatedReadingTime = useMemo(() => {
    let text = "";
    if (Array.isArray(chapter?.content)) {
      text = chapter.content.join(" ");
    } else if (chapter?.content) {
      text = String(chapter.content);
    }
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [chapter?.content]);

  // Keyboard shortcut listener for Focus Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))
        return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      } else if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [chapterId, allChapters]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-bold">Loading lesson...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !chapter) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <h1 className="text-lg font-black text-foreground">
              Lesson not found
            </h1>
            <Link
              href={`/courses/${courseId}`}
              className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold"
            >
              Back to Course Index
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Combined standalone code snippets array
  const standaloneSnippets = [];
  if (Array.isArray(chapter?.codeSnippets) && chapter.codeSnippets.length > 0) {
    standaloneSnippets.push(...chapter.codeSnippets);
  } else if (chapter?.codeSnippet) {
    standaloneSnippets.push({
      title: `${tech?.name || "Code"} Example — ${chapter.title}`,
      code: chapter.codeSnippet,
      language: chapter.language || "javascript",
    });
  }

  // Check if content consists of short bullet-style points
  const isSimplePoints =
    Array.isArray(chapter?.content) &&
    chapter.content.length > 1 &&
    chapter.content.every(
      (item) =>
        item.length < 300 && !item.includes("#") && !item.includes("```"),
    );

  const isCurrentCompleted = completedChapters.includes(chapter?.slug);

  // Font size multiplier classes
  const fontBodyClass =
    fontSize === "sm"
      ? "text-sm leading-relaxed"
      : fontSize === "lg"
        ? "text-lg sm:text-xl leading-loose"
        : "text-base sm:text-lg leading-relaxed";

  let sectionHeadingCount = 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300">
      {/* Hide Global Header in Focus Mode */}
      {!isFocusMode && <Header />}

      {/* Focus Mode Sticky Top Bar */}
      {isFocusMode && (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsFocusMode(false)}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
                title="Exit Focus Mode (Esc)"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">
                    {tech?.name || course?.techId} Course
                  </span>
                  <span className="text-zinc-400 text-xs hidden sm:inline">
                    •
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate hidden sm:inline">
                    {course?.title}
                  </span>
                </div>
                <h2 className="text-xs sm:text-sm font-black text-foreground truncate">
                  {chapter?.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Progress Chip */}
              <div className="hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <span>
                  {currentChapterIndex + 1}/{allChapters.length}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {progressPercentage}%
                </span>
              </div>

              {/* In-Page Contents Trigger */}
              {tableOfContents.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsTocOpen(!isTocOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all"
                  >
                    <List className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">Contents</span>
                  </button>

                  {/* TOC Dropdown Menu */}
                  {isTocOpen && (
                    <div className="absolute right-0 top-11 w-72 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 space-y-1">
                      <div className="text-[10px] font-black uppercase text-zinc-400 px-2 py-1 tracking-wider border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        Table of Contents
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {tableOfContents.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={() => setIsTocOpen(false)}
                            className={`block px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors ${
                              item.type === "h2"
                                ? "pl-4"
                                : item.type === "h3"
                                  ? "pl-6"
                                  : ""
                            }`}
                          >
                            {item.text}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Font Size Adjuster */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 text-[11px] font-bold">
                {["sm", "md", "lg"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-2 py-1 rounded-full uppercase transition-all ${
                      fontSize === size
                        ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-black"
                        : "text-zinc-500 hover:text-foreground"
                    }`}
                    title={`Text size: ${size}`}
                  >
                    {size === "sm" ? "A-" : size === "md" ? "A" : "A+"}
                  </button>
                ))}
              </div>

              {/* Exit Focus Mode Button */}
              <button
                onClick={() => setIsFocusMode(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Focus</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 transition-all duration-300 ${
          isFocusMode
            ? "max-w-4xl py-6 sm:py-10"
            : "max-w-7xl pt-20 sm:pt-24 flex flex-col gap-6 pb-24 sm:pb-12"
        }`}
      >
        {/* Standard Mode Top Header Bar */}
        {!isFocusMode && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-3">
                <Link
                  href={`/courses/${courseId}`}
                  className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Back to course overview"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full ${
                        tech?.badgeBg || "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {tech?.name || course?.techId} Course
                    </span>
                    <span className="text-zinc-400 font-medium">
                      {progressPercentage}% Completed
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black text-foreground tracking-tight mt-0.5">
                    {course?.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
                {/* Dedicated Focus Mode Button */}
                <button
                  onClick={() => setIsFocusMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  title="Enter distraction-free Focus Mode (Press F)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Focus Mode</span>
                  <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                    F
                  </span>
                </button>

                {/* Desktop Sidebar Toggle */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-all"
                  title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                  {isSidebarOpen ? (
                    <>
                      <PanelLeftClose className="w-4 h-4" />
                      <span>Collapse Sidebar</span>
                    </>
                  ) : (
                    <>
                      <PanelLeftOpen className="w-4 h-4 text-blue-500" />
                      <span>Show Sidebar</span>
                    </>
                  )}
                </button>

                {/* Mobile Chapter Drawer Toggle */}
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-xs font-bold active:scale-95 transition-all"
                >
                  <List className="w-4 h-4" />
                  <span>
                    Chapters ({currentChapterIndex + 1}/{allChapters.length})
                  </span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </>
        )}

        {/* Layout Container */}
        <div
          className={
            isFocusMode
              ? "w-full"
              : "grid grid-cols-1 lg:grid-cols-12 gap-6 relative"
          }
        >
          {/* Desktop Sticky & Collapsible Chapter Sidebar (Hidden in Focus Mode) */}
          {!isFocusMode && isSidebarOpen && (
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 z-30">
              <div style={{ position: "sticky", top: "90px" }}>
                <div className="h-[calc(100vh-7.5rem)] flex flex-col gap-3 p-4 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between px-2 pt-1 shrink-0">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      Chapters ({allChapters.length})
                    </h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                      {currentChapterIndex + 1}/{allChapters.length}
                    </span>
                  </div>

                  {/* Sidebar Search Filter */}
                  <div className="relative shrink-0">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Filter chapters..."
                      value={sidebarSearch}
                      onChange={(e) => setSidebarSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-foreground placeholder:text-zinc-400 border-0 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Chapter Navigation List */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                    {allChapters
                      .filter((ch) =>
                        ch.title
                          .toLowerCase()
                          .includes(sidebarSearch.toLowerCase()),
                      )
                      .map((ch, idx) => {
                        const isActive = ch.slug === chapter?.slug;
                        const isDone = completedChapters.includes(ch.slug);
                        return (
                          <Link
                            key={ch.slug}
                            ref={isActive ? activeItemRef : null}
                            href={`/courses/${courseId}/${ch.slug}`}
                            className={`group flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                              isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <span
                                className={`shrink-0 w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : isDone
                                      ? "bg-emerald-500/20 text-emerald-600"
                                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="line-clamp-2 leading-snug">
                                {ch.title}
                              </span>
                            </div>
                            {isActive ? (
                              <CheckCircle className="w-4 h-4 text-white shrink-0 ml-1" />
                            ) : isDone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                            ) : null}
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Lesson Content Area */}
          <section
            className={`flex flex-col gap-6 transition-all duration-300 ${
              isFocusMode
                ? "w-full max-w-3xl mx-auto"
                : isSidebarOpen
                  ? "lg:col-span-8 xl:col-span-9"
                  : "lg:col-span-12 max-w-4xl mx-auto w-full"
            }`}
          >
            {/* Top Quick Navigation (Standard Mode) */}
            {!isFocusMode && (
              <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-bold">
                {prevChapter ? (
                  <Link
                    href={`/courses/${courseId}/${prevChapter.slug}`}
                    className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="line-clamp-1">
                      Prev:{" "}
                      {prevChapter.title?.split(". ")[1] || prevChapter.title}
                    </span>
                  </Link>
                ) : (
                  <span className="text-zinc-400 font-medium">
                    Start of Course
                  </span>
                )}

                {nextChapter ? (
                  <Link
                    href={`/courses/${courseId}/${nextChapter.slug}`}
                    className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span className="line-clamp-1">
                      Next:{" "}
                      {nextChapter.title?.split(". ")[1] || nextChapter.title}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="text-emerald-500 font-bold">
                    Course Completed! 🎉
                  </span>
                )}
              </div>
            )}

            {/* Main Lesson Reader Document Card */}
            <div
              className={`rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-6 ${
                isFocusMode ? "p-6 sm:p-12 shadow-xl" : "p-6 sm:p-10"
              }`}
            >
              {/* Document Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      Lesson {currentChapterIndex + 1} of {allChapters.length}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {estimatedReadingTime} min read
                    </span>
                  </div>

                  {/* Mark as Done Toggle Button */}
                  <button
                    onClick={() => toggleChapterComplete(chapter?.slug)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isCurrentCompleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {isCurrentCompleted ? "Completed" : "Mark as Completed"}
                    </span>
                  </button>
                </div>

                <h1
                  className={`font-black text-foreground tracking-tight ${
                    isFocusMode
                      ? "text-3xl sm:text-5xl"
                      : "text-2xl sm:text-4xl"
                  }`}
                >
                  {chapter?.title}
                </h1>

                {chapter?.summary && (
                  <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    {chapter.summary}
                  </p>
                )}
              </div>

              {/* Render Structured Content Blocks */}
              {isSimplePoints ? (
                /* Legacy format: numbered badges for bullet points */
                <div className="space-y-3 mt-2">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Key Chapter Explanations
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium">
                    {chapter.content.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-100 dark:border-zinc-800/80"
                      >
                        <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          {renderInlineFormatting(point)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Modern Full Tutorial Document Format */
                <div
                  className={`space-y-6 ${fontBodyClass} font-medium text-zinc-700 dark:text-zinc-300`}
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
                        <div
                          key={idx}
                          className="my-8 flex items-center justify-center"
                        >
                          <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80" />
                        </div>
                      );
                    }
                    if (block.type === "code") {
                      return (
                        <div key={idx} className="my-6">
                          <CodeSnippetViewer
                            code={block.code}
                            title={block.title}
                          />
                        </div>
                      );
                    }
                    if (block.type === "image") {
                      return (
                        <div
                          key={idx}
                          className="my-6 rounded-3xl overflow-hidden shadow-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
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
                          className="border-l-4 border-blue-500 pl-5 py-4 my-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-r-2xl text-zinc-800 dark:text-zinc-200 font-medium shadow-xs flex items-start gap-3"
                        >
                          <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <div className="flex-1 italic leading-relaxed">
                            {renderInlineFormatting(block.text)}
                          </div>
                        </blockquote>
                      );
                    }
                    if (block.type === "list") {
                      const listItems = block.text
                        .split("\n")
                        .filter((l) => l.trim());
                      return (
                        <ul key={idx} className="space-y-3 my-5 pl-1">
                          {listItems.map((li, i) => {
                            const isOrdered = /^\d+\.\s/.test(li.trim());
                            const content = li
                              .trim()
                              .replace(/^([-*]|\d+\.)\s+/, "");
                            return (
                              <li
                                key={i}
                                className="flex gap-3 text-zinc-700 dark:text-zinc-300"
                              >
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
                          className="overflow-x-auto my-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs"
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
              )}
            </div>

            {/* Standalone Code Examples */}
            {standaloneSnippets.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-blue-500" />
                  Interactive Code Examples ({standaloneSnippets.length})
                </h3>
                <div className="space-y-4">
                  {standaloneSnippets.map((sn, index) => (
                    <CodeSnippetViewer
                      key={index}
                      code={sn.code}
                      title={
                        sn.title ||
                        `${tech?.name || "Code"} Example ${index + 1}`
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Try It Challenge */}
            {chapter?.tryItChallenge && (
              <div className="p-6 sm:p-8 rounded-[2.5rem] bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 shadow-xs border border-indigo-500/20 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm sm:text-base">
                  <Play className="w-4 h-4 fill-current" />
                  <span>Try It Yourself Challenge</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                  {chapter.tryItChallenge}
                </p>
              </div>
            )}

            {/* Bottom Prev / Next Navigation */}
            <div className="flex items-center justify-between p-5 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-bold">
              {prevChapter ? (
                <Link
                  href={`/courses/${courseId}/${prevChapter.slug}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Lesson</span>
                </Link>
              ) : (
                <div />
              )}

              {nextChapter ? (
                <Link
                  href={`/courses/${courseId}/${nextChapter.slug}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/25 active:scale-95"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/courses/${courseId}`}
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-500/25 active:scale-95"
                >
                  Course Complete 🎉
                </Link>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Chapter Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-foreground">
                All Course Chapters
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2">
              {allChapters.map((ch, idx) => {
                const isActive = ch.slug === chapter?.slug;
                const isDone = completedChapters.includes(ch.slug);
                return (
                  <Link
                    key={ch.slug}
                    href={`/courses/${courseId}/${ch.slug}`}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-zinc-50 dark:bg-zinc-950 text-foreground hover:bg-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{ch.title}</span>
                    </div>
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : isDone ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hide Footer in Focus Mode */}
      {!isFocusMode && <Footer containerWidth="max-w-7xl" />}
    </div>
  );
}
