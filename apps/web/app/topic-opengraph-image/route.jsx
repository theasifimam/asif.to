import { renderOgImage } from "@/lib/ogImage";
import { getPublicTopic } from "@/lib/publicContent";

export const revalidate = 60;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const courseSlug = searchParams.get("course") || "";
  const topicPath = searchParams.getAll("path").filter(Boolean);
  const topic =
    courseSlug && topicPath.length
      ? await getPublicTopic(courseSlug, topicPath)
      : null;
  const fallbackTitle = topicPath.at(-1) || "asif.to";

  return renderOgImage({
    type: topic?.type,
    title: topic?.seoTitle || topic?.title || fallbackTitle,
    course: topic?.course?.title || topic?.category?.name || courseSlug,
    category: topic?.category?.name,
    description:
      topic?.seoDescription ||
      topic?.excerpt ||
      "Practical web development, step by step.",
  });
}
