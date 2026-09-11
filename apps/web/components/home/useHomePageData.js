"use client";

import { useMemo, useState } from "react";
import { TECH_STACKS } from "@/lib/tutorialData";
import { useGetArticlesQuery } from "@/lib/api/articlesApi";
import { useGetPublicTopicsQuery } from "@/lib/api/topicsApi";

export function useHomePageData({
  courses = [],
  initialTopics = [],
  initialArticles = [],
}) {
  const [selectedTech, setSelectedTech] = useState(null);

  const { data: topicsResponse } = useGetPublicTopicsQuery(
    { limit: 12 },
    { skip: Boolean(initialTopics?.length > 0) },
  );
  const { data: articlesResponse } = useGetArticlesQuery(
    { limit: 6 },
    { skip: Boolean(initialArticles?.length > 0) },
  );

  const allTopics = useMemo(() => {
    if (initialTopics?.length) return initialTopics;
    return topicsResponse?.data?.topics || [];
  }, [initialTopics, topicsResponse]);

  const allArticles = useMemo(() => {
    if (initialArticles?.length) return initialArticles;
    return articlesResponse?.data || [];
  }, [initialArticles, articlesResponse]);

  const filteredTopics = useMemo(() => {
    if (!selectedTech) return allTopics;
    return allTopics.filter(
      (topic) =>
        topic.course?.techId === selectedTech ||
        topic.course?.slug === selectedTech,
    );
  }, [allTopics, selectedTech]);

  const displayTopics = (
    filteredTopics.length > 0 ? filteredTopics : allTopics
  ).slice(0, 6);
  const displayArticles = allArticles.slice(0, 6);

  const activeTechs = useMemo(() => {
    const ids = new Set(courses.map((course) => course.techId));
    return TECH_STACKS.filter((tech) => ids.has(tech.id));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!selectedTech) return courses;
    return courses.filter((course) => course.techId === selectedTech);
  }, [courses, selectedTech]);

  const firstCourse = courses[0];
  const examHref = firstCourse ? `/courses/${firstCourse.slug}` : "#courses";

  return {
    selectedTech,
    setSelectedTech,
    displayTopics,
    displayArticles,
    activeTechs,
    filteredCourses,
    examHref,
  };
}
