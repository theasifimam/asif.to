"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileChapterIndex from "@/components/MobileChapterIndex";
import FocusHeader from "@/components/chapter/FocusHeader";
import ChapterHeader from "@/components/chapter/ChapterHeader";
import ChapterSidebar from "@/components/chapter/ChapterSidebar";
import ChapterDrawer from "@/components/chapter/ChapterDrawer";
import ChapterQuickNav from "@/components/chapter/ChapterQuickNav";
import ChapterShareSection from "@/components/chapter/ChapterShareSection";
import ChapterDocumentCard from "@/components/chapter/ChapterDocumentCard";
import StandaloneCodeSnippets from "@/components/chapter/StandaloneCodeSnippets";
import TryItChallenge from "@/components/chapter/TryItChallenge";
import { parseContentBlocks } from "@/components/chapter/chapterUtils";
import { useGetChapterBySlugQuery } from "@/lib/api/courseApi";
import { TECH_STACKS } from "@/lib/tutorialData";
import { Loader2, AlertCircle } from "lucide-react";
import AuthorIdentityCard from "@/components/AuthorIdentityCard";

export default function ChapterClient({ courseSlug, chapterSlug }) {
  const params = useParams();
  const courseId = courseSlug || params?.courseId || params?.username;
  const chapterId = chapterSlug || params?.chapterId || params?.topicSlug;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState("md"); // 'sm', 'md', 'lg'
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Local state for completed chapters
  const [completedChapters, setCompletedChapters] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (courseId) {
          const savedComp = localStorage.getItem(
            `course_completed_${courseId}`,
          );
          if (savedComp) setCompletedChapters(JSON.parse(savedComp)); // eslint-disable-line react-hooks/set-state-in-effect
        }
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
  const activeCourseSlug = course?.slug || courseId;
  const chapter = data?.data?.chapter;
  const allChapters = useMemo(() => data?.data?.allChapters || [], [data?.data?.allChapters]);
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
  }, [chapter]);

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
              href={`/courses/${activeCourseSlug}`}
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
      ? "text-[13px] sm:text-sm leading-relaxed"
      : fontSize === "lg"
        ? "text-sm sm:text-xl leading-loose"
        : "text-sm sm:text-lg leading-relaxed";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300">
      {/* Hide Global Header in Focus Mode */}
      {!isFocusMode && <Header />}

      {/* Chapter list index bar under main navbar with auto-hide on scroll */}
      {!isFocusMode && allChapters.length > 0 && (
        <MobileChapterIndex
          chapters={allChapters}
          activeCourseSlug={activeCourseSlug}
        />
      )}

      {/* Focus Mode Sticky Top Bar */}
      {isFocusMode && (
        <FocusHeader
          course={course}
          chapter={chapter}
          currentChapterIndex={currentChapterIndex}
          allChapters={allChapters}
          progressPercentage={progressPercentage}
          tableOfContents={tableOfContents}
          isTocOpen={isTocOpen}
          setIsTocOpen={setIsTocOpen}
          fontSize={fontSize}
          setFontSize={setFontSize}
          setIsFocusMode={setIsFocusMode}
        />
      )}

      <main
        className={`flex-1 w-full mx-auto px-2 sm:px-6 transition-all duration-300 ${
          isFocusMode
            ? "max-w-4xl py-6 sm:py-10"
            : "max-w-7xl pt-16 sm:pt-24 flex flex-col gap-3 sm:gap-6 pb-32 sm:pb-16"
        }`}
      >
        {/* Standard Mode Top Header Bar */}
        {!isFocusMode && (
          <ChapterHeader
            courseId={activeCourseSlug}
            course={course}
            tech={tech}
            progressPercentage={progressPercentage}
            currentChapterIndex={currentChapterIndex}
            allChapters={allChapters}
            setIsFocusMode={setIsFocusMode}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            setIsDrawerOpen={setIsDrawerOpen}
          />
        )}

        {/* Layout Container */}
        <div
          className={
            isFocusMode
              ? "w-full"
              : "grid grid-cols-1 lg:grid-cols-12 gap-6 relative"
          }
        >
          {/* Desktop Sticky & Collapsible Chapter Sidebar */}
          {!isFocusMode && isSidebarOpen && (
            <ChapterSidebar
              courseId={activeCourseSlug}
              chapter={chapter}
              allChapters={allChapters}
              currentChapterIndex={currentChapterIndex}
              completedChapters={completedChapters}
              sidebarSearch={sidebarSearch}
              setSidebarSearch={setSidebarSearch}
              activeItemRef={activeItemRef}
            />
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
              <ChapterQuickNav
                courseId={activeCourseSlug}
                prevChapter={prevChapter}
                nextChapter={nextChapter}
                examEnabled={course?.examEnabled}
                variant="top"
              />
            )}{" "}
            {/* Main Lesson Reader Document Card */}
            <ChapterDocumentCard
              chapter={chapter}
              currentChapterIndex={currentChapterIndex}
              allChaptersCount={allChapters.length}
              estimatedReadingTime={estimatedReadingTime}
              isCurrentCompleted={isCurrentCompleted}
              toggleChapterComplete={toggleChapterComplete}
              isFocusMode={isFocusMode}
              isSimplePoints={isSimplePoints}
              parsedBlocks={parsedBlocks}
              fontBodyClass={fontBodyClass}
            />
            {/* Standalone Code Examples */}
            <StandaloneCodeSnippets
              standaloneSnippets={standaloneSnippets}
              techName={tech?.name}
            />
            {/* Try It Challenge */}
            <TryItChallenge challenge={chapter?.tryItChallenge} />
            <AuthorIdentityCard publishedAt={chapter?.createdAt} updatedAt={chapter?.updatedAt} compact />
            {/* Share Section */}
            <ChapterShareSection chapter={chapter} />
            {/* Bottom Prev / Next Navigation */}
            <ChapterQuickNav
              courseId={activeCourseSlug}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
              examEnabled={course?.examEnabled}
              variant="bottom"
            />
          </section>
        </div>
      </main>

      {/* Mobile Chapter Drawer */}
      <ChapterDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        courseId={activeCourseSlug}
        chapter={chapter}
        allChapters={allChapters}
        completedChapters={completedChapters}
      />

      {/* Hide Footer in Focus Mode */}
      {!isFocusMode && <Footer containerWidth="max-w-7xl" />}
    </div>
  );
}
