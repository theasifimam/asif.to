import { cache } from "react";
import ChapterClient from "@/components/ChapterClient";
import CourseTopicPage, {
  buildTopicMetadata,
  getPublicTopic,
} from "@/components/CourseTopicPage";
import { absoluteUrl, assetUrl, getSiteUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const getChapterData = cache(async (courseSlug, chapterSlug) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;

  try {
    const response = await fetch(
      `${baseUrl}/courses/slug/${encodeURIComponent(courseSlug)}/chapters/${encodeURIComponent(chapterSlug)}`,
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return null;

    const body = await response.json();
    return body.data || null;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return null;
  }
});

function chapterPath(data, courseSlug, chapterSlug) {
  return `/${encodeURIComponent(data.course.slug || courseSlug)}/${encodeURIComponent(data.chapter.slug || chapterSlug)}`;
}

function buildChapterMetadata(data, courseSlug, chapterSlug) {
  const { course, chapter } = data;
  const title = chapter.seoTitle || `${chapter.title} - ${course.title}`;
  const description =
    chapter.seoDescription ||
    chapter.summary ||
    `Read ${chapter.title} in the ${course.title} course on asif.to.`;
  const canonical = absoluteUrl(
    chapter.canonicalUrl,
    chapterPath(data, courseSlug, chapterSlug),
  );
  const image = assetUrl(course.thumbnail);

  return {
    title,
    description,
    keywords: chapter.keywords || [],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "asif.to",
      type: "article",
      publishedTime: chapter.createdAt || undefined,
      modifiedTime: chapter.updatedAt || undefined,
      images: [{ url: image, alt: `${chapter.title} - ${course.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function chapterStructuredData(data, courseSlug, chapterSlug) {
  const { course, chapter } = data;
  const siteUrl = getSiteUrl();
  const canonical = absoluteUrl(
    chapter.canonicalUrl,
    chapterPath(data, courseSlug, chapterSlug),
  );
  const courseUrl = absoluteUrl(
    "",
    `/courses/${encodeURIComponent(course.slug || courseSlug)}`,
  );
  const description =
    chapter.seoDescription ||
    chapter.summary ||
    `Read ${chapter.title} in the ${course.title} course on asif.to.`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${canonical}#lesson`,
        name: chapter.title,
        headline: chapter.seoTitle || chapter.title,
        description,
        url: canonical,
        image: assetUrl(course.thumbnail),
        datePublished: chapter.createdAt || undefined,
        dateModified: chapter.updatedAt || undefined,
        educationalLevel: course.level || undefined,
        learningResourceType: "Lesson",
        isPartOf: {
          "@type": "Course",
          name: course.title,
          url: courseUrl,
        },
        provider: {
          "@type": "Organization",
          name: "asif.to",
          sameAs: siteUrl,
        },
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
            name: course.title,
            item: courseUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: chapter.title,
            item: canonical,
          },
        ],
      },
    ],
  };
}

export async function generateMetadata({ params }) {
  const { username: courseSlug, topicSlug } = await params;
  const topic = await getPublicTopic(courseSlug, [topicSlug]);
  if (topic) return buildTopicMetadata(courseSlug, [topicSlug]);

  const chapterData = await getChapterData(courseSlug, topicSlug);
  if (chapterData?.course && chapterData?.chapter) {
    return buildChapterMetadata(chapterData, courseSlug, topicSlug);
  }

  return {
    title: "Page Not Found",
    robots: { index: false, follow: false },
  };
}

export default async function PublicTopicPage({ params }) {
  const { username: courseSlug, topicSlug } = await params;
  const topic = await getPublicTopic(courseSlug, [topicSlug]);

  if (topic) {
    return <CourseTopicPage courseSlug={courseSlug} topicPath={[topicSlug]} />;
  }

  const chapterData = await getChapterData(courseSlug, topicSlug);

  return (
    <>
      {chapterData?.course && chapterData?.chapter && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              chapterStructuredData(chapterData, courseSlug, topicSlug),
            ),
          }}
        />
      )}
      <ChapterClient courseSlug={courseSlug} chapterSlug={topicSlug} />
    </>
  );
}
