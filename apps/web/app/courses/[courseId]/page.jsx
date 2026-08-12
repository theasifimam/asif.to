import { cache } from "react";
import CourseClient from "@/components/CourseClient";
import { absoluteUrl, assetUrl, getSiteUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const getCourse = cache(async (courseId) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;

  try {
    const response = await fetch(
      `${baseUrl}/courses/slug/${encodeURIComponent(courseId)}`,
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return null;

    const body = await response.json();
    return body.data || null;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
});

function coursePath(course, fallbackSlug) {
  return `/courses/${encodeURIComponent(course.slug || fallbackSlug)}`;
}

function courseStructuredData(course, fallbackSlug) {
  const siteUrl = getSiteUrl();
  const canonical = absoluteUrl(
    course.canonicalUrl,
    coursePath(course, fallbackSlug),
  );
  const description =
    course.seoDescription ||
    course.subtitle ||
    `Learn ${course.title} with step-by-step lessons on asif.to.`;
  const image = assetUrl(course.thumbnail);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${canonical}#course`,
        name: course.title,
        description,
        url: canonical,
        image,
        provider: {
          "@type": "Organization",
          name: "asif.to",
          sameAs: siteUrl,
        },
        educationalLevel: course.level || undefined,
        timeRequired: course.duration || undefined,
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: course.duration || undefined,
        },
        syllabusSections: (course.chapters || []).map((chapter) => ({
          "@type": "Syllabus",
          name: chapter.title,
          description: chapter.summary || undefined,
          url: absoluteUrl(
            "",
            `/${encodeURIComponent(course.slug || fallbackSlug)}/${encodeURIComponent(chapter.slug)}`,
          ),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Courses",
            item: `${siteUrl}/courses`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: course.title,
            item: canonical,
          },
        ],
      },
    ],
  };
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
  const image = assetUrl(course.thumbnail);

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
      images: [{ url: image, alt: course.title }],
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
      {course && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(courseStructuredData(course, courseId)),
          }}
        />
      )}
      <CourseClient />
    </>
  );
}
