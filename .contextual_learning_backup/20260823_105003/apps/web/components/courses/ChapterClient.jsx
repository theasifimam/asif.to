"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileChapterIndex from "@/components/courses/MobileChapterIndex";
import ChapterHeader from "@/components/chapter/ChapterHeader";
import ChapterSidebar from "@/components/chapter/ChapterSidebar";
import ChapterQuickNav from "@/components/chapter/ChapterQuickNav";
import ChapterShareSection from "@/components/chapter/ChapterShareSection";
import ChapterDocumentCard from "@/components/chapter/ChapterDocumentCard";
import StandaloneCodeSnippets from "@/components/chapter/StandaloneCodeSnippets";
import TryItChallenge from "@/components/chapter/TryItChallenge";
import { parseContentBlocks } from "@/components/chapter/chapterUtils";
import { useGetChapterBySlugQuery } from "@/lib/api/courseApi";
import { TECH_STACKS } from "@/lib/tutorialData";
import { AlertCircle } from "lucide-react";
import AuthorIdentityCard from "@/components/authors/AuthorIdentityCard";
import { ChapterReaderSkeleton } from "@/components/courses/ReaderSkeletons";
// ASIF_COURSE_LEARNING_FLOW_V1:chapter-progress-imports
import ChapterLearningLoop from "@/components/courses/ChapterLearningLoop";
import { useCourseProgress } from "@/lib/courseProgress";

export default function ChapterClient({
  courseSlug,
  chapterSlug,
  initialData,
}) {
  const params = useParams();
  const courseId = courseSlug || params?.courseId || params?.username;
  const chapterId = chapterSlug || params?.chapterId || params?.topicSlug;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [fontSize, setFontSize] = useState("md"); // 'sm', 'md', 'lg'

  // ASIF_COURSE_LEARNING_FLOW_V1:remove-old-local-progress

  const { data, isLoading, isError } = useGetChapterBySlugQuery(
    { courseSlug: courseId, chapterSlug: chapterId },
    { skip: !courseId || !chapterId },
  );

  const course = data?.data?.course || initialData?.course;
  const activeCourseSlug = course?.slug || courseId;
  const chapter = data?.data?.chapter || initialData?.chapter;
  const allChapters = useMemo(
    () => data?.data?.allChapters || initialData?.allChapters || [],
    [data?.data?.allChapters, initialData?.allChapters],
  );
  const prevChapter = data?.data?.prevChapter;
  const nextChapter = data?.data?.nextChapter;

  const tech = TECH_STACKS.find((t) => t.id === course?.techId);
  const currentChapterIndex = allChapters.findIndex(
    (c) => c.slug === chapter?.slug,
  );

// ASIF_COURSE_LEARNING_FLOW_V1:chapter-position-progress
const positionPercentage = allChapters.length
  ? Math.round(((currentChapterIndex + 1) / allChapters.length) * 100)
  : 0;
const progressChapters = useMemo(() => {
  if (!chapter) return allChapters;
  return allChapters.map((item) => String(item._id) === String(chapter._id) ? { ...item, ...chapter } : item);
}, [allChapters, chapter]);
const courseProgress = useCourseProgress(activeCourseSlug, progressChapters);
const currentProgress = chapter?._id ? courseProgress.chapterMap?.[String(chapter._id)] : null;
const completedChapters = courseProgress.completedChapters || [];
const progressPercentage = courseProgress.loading ? positionPercentage : courseProgress.overallProgress;

  const activeItemRef = useRef(null);

  // Parse structured blocks from chapter content
  const parsedBlocks = useMemo(
    () => parseContentBlocks(chapter?.content, tech?.name),
    [chapter?.content, tech?.name],
  );

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

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [chapterId, allChapters]);

  const isInitialLoading = !chapter && isLoading;

  if (isInitialLoading) {
    return <ChapterReaderSkeleton />;
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


// ASIF_COURSE_LEARNING_FLOW_V1:chapter-completion-handler
const isCurrentCompleted = Boolean(currentProgress?.stages?.learn?.completed) || completedChapters.includes(chapter?.slug);
const toggleChapterComplete = async () => {
  await courseProgress.markStage(chapter, "learn", { completed: !isCurrentCompleted });
};

  // Font size multiplier classes
  const fontBodyClass =
    fontSize === "sm"
      ? "text-[13px] sm:text-sm leading-relaxed"
      : fontSize === "lg"
        ? "text-sm sm:text-xl leading-loose"
        : "text-sm sm:text-lg leading-relaxed";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300">
      <Header />

      {/* Chapter list index bar under main navbar with auto-hide on scroll */}
      {allChapters.length > 0 && (
        <MobileChapterIndex
          chapters={allChapters}
          activeCourseSlug={activeCourseSlug}
        />
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-36 sm:pt-40 lg:pt-28 flex flex-col gap-3 sm:gap-6 pb-32 sm:pb-16">
        {/* Standard Mode Top Header Bar */}
        <ChapterHeader
          courseId={activeCourseSlug}
          course={course}
          tech={tech}
          progressPercentage={progressPercentage}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 relative">
          {/* Lesson Content Area */}
          <section
            className={`flex flex-col gap-3 transition-all duration-300 ${
              isSidebarOpen
                ? "lg:col-span-8 xl:col-span-9"
                : "lg:col-span-12 max-w-4xl mx-auto w-full"
            }`}
          >
            {/* Top Quick Navigation */}
            <ChapterQuickNav
              courseId={activeCourseSlug}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
              examEnabled={course?.examEnabled}
              variant="top"
            />

            {/* Main Lesson Reader Document Card */}
            <ChapterDocumentCard
              chapter={chapter}
              currentChapterIndex={currentChapterIndex}
              allChaptersCount={allChapters.length}
              estimatedReadingTime={estimatedReadingTime}
              isCurrentCompleted={isCurrentCompleted}
              toggleChapterComplete={toggleChapterComplete}
              isFocusMode={false}
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
            {/* ASIF_COURSE_LEARNING_FLOW_V1:practice-anchor */}
            <div id="chapter-practice" className="scroll-mt-28"><TryItChallenge challenge={chapter?.tryItChallenge} /></div>
            <ChapterLearningLoop courseSlug={activeCourseSlug} chapter={chapter} progress={currentProgress} onStageChange={(stage, options) => courseProgress.markStage(chapter, stage, options)} />
            <AuthorIdentityCard
              author={chapter?.author || course?.author}
              publishedAt={chapter?.createdAt}
              updatedAt={chapter?.updatedAt}
              compact
            />
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
          {/* Desktop Sticky & Collapsible Chapter Sidebar */}
          {isSidebarOpen && (
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
        </div>
      </main>
      <Footer containerWidth="max-w-7xl" />
    </div>
  );
}
