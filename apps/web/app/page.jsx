import { cache } from "react";
import HomePageClient from "@/components/home/HomePageClient";
import JsonLd from "@/components/seo/JsonLd";
import {
  buildCourseItemListSchema,
  getUniqueListableCourses,
} from "@/lib/courseSchema";
import { getPublicAllTopics, getPublicArticles } from "@/lib/publicContent";

export const metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

const getCourses = cache(async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return [];

  try {
    const response = await fetch(`${baseUrl}/courses`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];

    const body = await response.json();
    return getUniqueListableCourses(body.data || []);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
});

export default async function HomePage() {
  const [courses, topicsData, articlesData] = await Promise.all([
    getCourses(),
    getPublicAllTopics(10),
    getPublicArticles(6),
  ]);

  const initialTopics = topicsData?.topics || [];
  const initialArticles = Array.isArray(articlesData)
    ? articlesData
    : articlesData?.data || [];

  return (
    <>
      <JsonLd data={buildCourseItemListSchema(courses)} />
      <HomePageClient
        courses={courses}
        initialTopics={initialTopics}
        initialArticles={initialArticles}
      />
    </>
  );
}
