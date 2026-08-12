import { renderOgImage } from "@/lib/ogImage";
import { getChapterData, getPublicTopic } from "@/lib/publicContent";

export const alt = "asif.to learning guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;

export default async function TopicOpenGraphImage({ params }) {
  const { username: courseSlug, topicSlug } = await params;
  const topic = await getPublicTopic(courseSlug, [topicSlug]);

  if (topic) {
    return renderOgImage({
      type: topic.type,
      title: topic.seoTitle || topic.title,
      course: topic.course?.title || topic.category?.name || courseSlug,
      category: topic.category?.name,
      description: topic.seoDescription || topic.excerpt,
    });
  }

  const chapterData = await getChapterData(courseSlug, topicSlug);
  if (chapterData?.course && chapterData?.chapter) {
    const { course, chapter } = chapterData;
    return renderOgImage({
      type: "topic",
      title: chapter.seoTitle || chapter.title,
      course: course.title || courseSlug,
      description:
        chapter.seoDescription ||
        chapter.summary ||
        `Read ${chapter.title} in the ${course.title} course.`,
    });
  }

  return renderOgImage({
    title: topicSlug || "asif.to",
    course: courseSlug,
    description: "Practical web development, step by step.",
  });
}
