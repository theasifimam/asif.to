import CourseClient from "@/components/courses/CourseClient";
import JsonLd from "@/components/seo/JsonLd";
import { buildCourseSchema } from "@/lib/courseSchema";
import { getCourse } from "@/lib/publicContent";
import { notFound } from "next/navigation";
import { absoluteUrl, assetUrl } from "@/lib/seo";

export const revalidate = 60;
export function generateStaticParams() { return []; }

function coursePath(course, fallbackSlug) {
  return `/courses/${encodeURIComponent(course?.slug || fallbackSlug)}`;
}

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course) notFound();

  const technology = course.techId || course.title;
  const title =
    course.seoTitle ||
    `${course.title} Course – Learn ${technology} | asif.to`;
  const description =
    course.seoDescription ||
    course.subtitle ||
    `Learn ${technology} with a practical, step-by-step course on asif.to. Read the syllabus, follow the lessons, and practise with real code examples.`;
  const keywords = Array.from(
    new Set([
      ...(Array.isArray(course.keywords) ? course.keywords : []),
      course.title,
      `${course.title} course`,
      `${technology} tutorial`,
      `${technology} course`,
      "asif.to courses",
      "coding courses",
    ].filter(Boolean)),
  );
  const slug = course.slug || courseId;
  const canonical = absoluteUrl(null, coursePath(course, courseId));
  const image = course.thumbnail
    ? assetUrl(course.thumbnail)
    : absoluteUrl("", `/courses/${encodeURIComponent(slug)}/opengraph-image`);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "asif.to",
      type: "article",
      publishedTime: course.createdAt || undefined,
      modifiedTime: course.updatedAt || undefined,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${course.title} course on asif.to`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CourseOverviewPage({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course) notFound();

  return (
    <>
      <JsonLd data={buildCourseSchema(course, courseId)} />
      <CourseClient initialData={course} />
    </>
  );
}
