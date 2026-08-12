import CourseClient from "@/components/CourseClient";
import JsonLd from "@/components/JsonLd";
import { buildCourseSchema } from "@/lib/courseSchema";
import { getCourse } from "@/lib/publicContent";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function coursePath(course, fallbackSlug) {
  return `/courses/${encodeURIComponent(course.slug || fallbackSlug)}`;
}

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) {
    return {
      title: "Course Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = course.seoTitle || course.title;
  const description =
    course.seoDescription ||
    course.subtitle ||
    `Learn ${course.title} with step-by-step lessons on asif.to.`;
  const canonical = absoluteUrl(
    course.canonicalUrl,
    coursePath(course, courseId),
  );
  const image = absoluteUrl(
    "",
    `/courses/${encodeURIComponent(course.slug || courseId)}/opengraph-image`,
  );

  return {
    title,
    description,
    keywords: course.keywords || [],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "asif.to",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${course.title} Course | asif.to`,
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

  return (
    <>
      <JsonLd data={buildCourseSchema(course, courseId)} />
      <CourseClient />
    </>
  );
}
