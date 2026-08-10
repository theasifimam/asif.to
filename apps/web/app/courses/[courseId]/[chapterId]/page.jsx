import React from "react";
import ChapterClient from "@/components/ChapterClient";

export const dynamic = "force-dynamic";

async function getChapterData(courseId, chapterId) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(
      `${baseUrl}/courses/slug/${courseId}/chapters/${chapterId}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return body.data;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { courseId, chapterId } = await params;
  const data = await getChapterData(courseId, chapterId);

  if (!data || !data.chapter) {
    return {
      title: "Lesson Not Found | asif.to",
    };
  }

  const { course, chapter } = data;
  const description =
    chapter.summary ||
    `Read ${chapter.title} in the ${course.title} course on asif.to.`;
  const defaultImage = "/logo.jpeg";

  return {
    title: `${chapter.title} - ${course.title} | asif.to`,
    description: description,
    openGraph: {
      title: `${chapter.title} - ${course.title}`,
      description: description,
      images: [defaultImage],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${chapter.title} - ${course.title}`,
      description: description,
      images: [defaultImage],
    },
  };
}

export default function CourseChapterPage() {
  return <ChapterClient />;
}
