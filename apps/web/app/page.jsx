import { cache } from "react";
import HomePageClient from "@/components/home/HomePageClient";
import JsonLd from "@/components/seo/JsonLd";
import {
  buildCourseItemListSchema,
  getUniqueListableCourses,
} from "@/lib/courseSchema";

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
  const courses = await getCourses();

  return (
    <>
      <JsonLd data={buildCourseItemListSchema(courses)} />
      <HomePageClient courses={courses} />
    </>
  );
}
