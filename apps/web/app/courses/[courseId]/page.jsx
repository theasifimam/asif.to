import React from "react";
import CourseClient from "@/components/CourseClient";

export const dynamic = "force-dynamic";

async function getCourse(courseId) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${baseUrl}/courses/slug/${courseId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    return {
      title: "Course Not Found | Mazlis News",
    };
  }

  const description = course.subtitle || `Learn ${course.title} on Mazlis News.`;
  const defaultImage = "/logo.jpeg";

  return {
    title: `${course.title} | Mazlis News`,
    description: description,
    openGraph: {
      title: course.title,
      description: description,
      images: [defaultImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: description,
      images: [defaultImage],
    },
  };
}

export default function CourseOverviewPage() {
  return <CourseClient />;
}
