"use client";

import React, { useState } from "react";
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
} from "lucide-react";

/** Parse markdown text into structured content blocks (Headings, Paragraphs, Images, Code Blocks) */
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

    // Process normal text: split further by double newlines or headings
    const subParagraphs = trimmed.split(/\n\s*\n/);

    subParagraphs.forEach((para) => {
      const pTrimmed = para.trim();
      if (!pTrimmed) return;

      // Image tag: ![alt](url)
      const imageMatch = pTrimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        blocks.push({
          type: "image",
          alt: imageMatch[1],
          url: imageMatch[2],
        });
        return;
      }

      // Heading H1: # Title
      if (pTrimmed.startsWith("# ")) {
        blocks.push({ type: "h1", text: pTrimmed.slice(2) });
        return;
      }

      // Heading H2: ## Subtitle
      if (pTrimmed.startsWith("## ")) {
        blocks.push({ type: "h2", text: pTrimmed.slice(3) });
        return;
      }

      // Heading H3: ### Section
      if (pTrimmed.startsWith("### ")) {
        blocks.push({ type: "h3", text: pTrimmed.slice(4) });
        return;
      }

      // Markdown Table
      if (pTrimmed.startsWith("|") && pTrimmed.includes("\n|")) {
        blocks.push({ type: "table", text: pTrimmed });
        return;
      }

      // Regular paragraph text
      blocks.push({ type: "text", text: pTrimmed });
    });
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

  const activeItemRef = React.useRef(null);

  React.useEffect(() => {
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

  // Combined standalone code snippets array (multiple + legacy single)
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

  // Parse structured blocks from chapter content
  const parsedBlocks = parseContentBlocks(chapter?.content, tech?.name);

  // Check if content consists of short bullet-style points (legacy data format)
  const isSimplePoints =
    Array.isArray(chapter?.content) &&
    chapter.content.length > 1 &&
    chapter.content.every(
      (item) =>
        item.length < 300 && !item.includes("#") && !item.includes("```"),
    );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-24 sm:pb-12">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Top Course Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60">
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
                  className={`font-bold px-2.5 py-0.5 rounded-full ${tech?.badgeBg || "bg-blue-500/10 text-blue-600"}`}
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

          <div className="flex items-center gap-3 self-start sm:self-auto">
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
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
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

        {/* Layout: Sticky Collapsible Sidebar + Lesson Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {/* Desktop Sticky & Collapsible Chapter Sidebar */}
          {isSidebarOpen && (
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 z-30">
              <div style={{ position: "sticky", top: "90px" }}>
                <div className="h-[calc(100vh-7.5rem)] flex flex-col gap-3 p-4 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60">
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
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                    {allChapters
                      .filter((ch) =>
                        ch.title.toLowerCase().includes(sidebarSearch.toLowerCase()),
                      )
                      .map((ch) => {
                        const isActive = ch.slug === chapter?.slug;
                        return (
                          <Link
                            key={ch.slug}
                            ref={isActive ? activeItemRef : null}
                            href={`/courses/${courseId}/${ch.slug}`}
                            className={`group flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-colors ${
                              isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                            }`}
                          >
                            <span className="line-clamp-2 leading-snug">
                              {ch.title}
                            </span>
                            {isActive && (
                              <CheckCircle className="w-4 h-4 text-white shrink-0 ml-2" />
                            )}
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Lesson Content Area - Expands when sidebar is collapsed */}
          <section
            className={`flex flex-col gap-6 transition-all duration-300 ${
              isSidebarOpen
                ? "lg:col-span-8 xl:col-span-9"
                : "lg:col-span-12 max-w-4xl mx-auto w-full"
            }`}
          >
            {/* Top Prev / Next Quick Navigation */}
            <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-bold">
              {prevChapter ? (
                <Link
                  href={`/courses/${courseId}/${prevChapter.slug}`}
                  className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="line-clamp-1">
                    Prev: {prevChapter.title?.split(". ")[1] || prevChapter.title}
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
                    Next: {nextChapter.title?.split(". ")[1] || nextChapter.title}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-emerald-500 font-bold">
                  Course Completed! 🎉
                </span>
              )}
            </div>

            {/* Chapter Details & Main Tutorial Reader Document */}
            <div className="p-6 sm:p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-6">
              <div>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  Lesson {currentChapterIndex + 1} of {allChapters.length}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight mt-1 mb-3">
                  {chapter?.title}
                </h1>
                <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  {chapter?.summary}
                </p>
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
                <div className="space-y-5 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                  {parsedBlocks.map((block, idx) => {
                    if (block.type === "h1") {
                      return (
                        <h2
                          key={idx}
                          className="text-xl sm:text-3xl font-black text-foreground tracking-tight mt-8 mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2"
                        >
                          {block.text}
                        </h2>
                      );
                    }
                    if (block.type === "h2") {
                      return (
                        <h3
                          key={idx}
                          className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight mt-6 mb-3"
                        >
                          {block.text}
                        </h3>
                      );
                    }
                    if (block.type === "h3") {
                      return (
                        <h4
                          key={idx}
                          className="text-base sm:text-xl font-bold text-foreground mt-5 mb-2"
                        >
                          {block.text}
                        </h4>
                      );
                    }
                    if (block.type === "code") {
                      return (
                        <div key={idx} className="my-5">
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
                        <p key={idx} className="mb-4 text-zinc-600 dark:text-zinc-400">
                          {renderInlineFormatting(block.text)}
                        </p>
                      );
                    }
                    if (block.type === "table") {
                      const rows = block.text.split("\n").map(r => r.trim()).filter(r => r && r.startsWith("|"));
                      if (rows.length < 3) return null; // Needs header, separator, and at least one body row
                      const headers = rows[0].split("|").slice(1, -1).map(h => h.trim());
                      // Ignore the separator row (rows[1])
                      const bodyRows = rows.slice(2).map(r => r.split("|").slice(1, -1).map(c => c.trim()));
                      
                      return (
                        <div key={idx} className="overflow-x-auto my-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                          <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                {headers.map((h, i) => (
                                  <th key={i} className="px-5 py-4 text-sm font-bold text-foreground">{renderInlineFormatting(h)}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950/50">
                              {bodyRows.map((row, i) => (
                                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                  {row.map((cell, j) => (
                                    <td key={j} className="px-5 py-3.5 text-sm text-zinc-600 dark:text-zinc-300">{renderInlineFormatting(cell)}</td>
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

            {/* Standalone Code Examples (if defined separately in codeSnippets array) */}
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
              <div className="p-6 sm:p-8 rounded-[2.5rem] bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 shadow-sm border border-indigo-500/20 space-y-3">
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
            <div className="flex items-center justify-between p-5 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-bold">
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
              {allChapters.map((ch) => {
                const isActive = ch.slug === chapter?.slug;
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
                    <span>{ch.title}</span>
                    {isActive && <CheckCircle className="w-4 h-4 text-white" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Footer containerWidth="max-w-7xl" />
    </div>
  );
}
