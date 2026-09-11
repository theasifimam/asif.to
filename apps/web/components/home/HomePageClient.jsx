"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useHomePageData } from "./useHomePageData";
import { useCoursesScroll } from "./useCoursesScroll";
import HomeHeroBanner from "./sections/HomeHeroBanner";
import HomeCoursesSection from "./sections/HomeCoursesSection";
import HomeInteractiveBento from "./sections/HomeInteractiveBento";
import HomeTopicGuides from "./sections/HomeTopicGuides";
import HomeInterviewPrep from "./sections/HomeInterviewPrep";
import HomeArticlesSection from "./sections/HomeArticlesSection";
import HomeLearningLoop from "./sections/HomeLearningLoop";
import HomeFinalCta from "./sections/HomeFinalCta";

export default function HomePageClient({
  courses = [],
  initialTopics = [],
  initialArticles = [],
}) {
  const {
    selectedTech,
    setSelectedTech,
    displayTopics,
    displayArticles,
    activeTechs,
    filteredCourses,
    examHref,
  } = useHomePageData({
    courses,
    initialTopics,
    initialArticles,
  });

  const {
    coursesScrollRef,
    canScrollLeft,
    canScrollRight,
    scrollCourses,
  } = useCoursesScroll();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300 pb-28 sm:pb-16 overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3.5 sm:px-6 pt-20 sm:pt-24 flex flex-col gap-8 sm:gap-14 min-w-0">
        {/* 1. HERO BANNER */}
        <HomeHeroBanner />

        {/* 2. STRUCTURED COURSES SECTION */}
        <HomeCoursesSection
          courses={courses}
          filteredCourses={filteredCourses}
          activeTechs={activeTechs}
          selectedTech={selectedTech}
          onSelectTech={setSelectedTech}
          coursesScrollRef={coursesScrollRef}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onScrollCourses={scrollCourses}
        />

        {/* 3. INTERACTIVE BENTO SHOWCASE */}
        <HomeInteractiveBento />

        {/* 4. TOPIC DEEP DIVES & GUIDES */}
        <HomeTopicGuides displayTopics={displayTopics} />

        {/* 5. INTERVIEW PREP & REVISION STICKINESS */}
        <HomeInterviewPrep
          courses={courses}
          selectedTech={selectedTech}
          examHref={examHref}
        />

        {/* 6. TECHNICAL ARTICLES & DISPATCHES */}
        <HomeArticlesSection displayArticles={displayArticles} />

        {/* 7. ONE LEARNING LOOP STEPPER */}
        <HomeLearningLoop />

        {/* 8. FINAL HIGH IMPACT CTA */}
        <HomeFinalCta />
      </main>

      <Footer />
    </div>
  );
}
