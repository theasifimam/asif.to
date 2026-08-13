import ChapterClient from "@/components/ChapterClient";
import CourseTopicPage, {
  buildTopicMetadata,
} from "@/components/CourseTopicPage";
import { getChapterData, getPublicTopic } from "@/lib/publicContent";
import { absoluteUrl, assetUrl, getSiteUrl, jsonLd } from "@/lib/seo";
import InterviewQuestionsGuide, { buildInterviewGuideMetadata } from "@/components/interview/InterviewQuestionsGuide";
import { authorIdentity, buildPersonSchema } from "@/lib/authorIdentity";

export const dynamic = "force-dynamic";

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
  const image = absoluteUrl(
    "",
    `${chapterPath(data, courseSlug, chapterSlug)}/opengraph-image`,
  );

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
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${chapter.title} - ${course.title}`,
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
      buildPersonSchema(),
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
        author: { "@id": `${authorIdentity.url}#person` },
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

export async function generateMetadata({ params, searchParams }) {
  const { username: courseSlug, topicSlug } = await params;
  if (topicSlug === "interview-questions") {
    const { page } = await searchParams;
    return buildInterviewGuideMetadata(courseSlug, page);
  }
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

export default async function PublicTopicPage({ params, searchParams }) {
  const { username: courseSlug, topicSlug } = await params;
  if (topicSlug === "interview-questions") {
    const { page } = await searchParams;
    return <InterviewQuestionsGuide courseSlug={courseSlug} requestedPage={page} />;
  }
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
