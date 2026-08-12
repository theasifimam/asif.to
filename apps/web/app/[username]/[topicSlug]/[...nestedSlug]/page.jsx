import CourseTopicPage, {
  buildTopicMetadata,
} from "@/components/CourseTopicPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { username: courseSlug, topicSlug, nestedSlug } = await params;
  return buildTopicMetadata(courseSlug, [topicSlug, ...nestedSlug]);
}

export default async function NestedPublicTopicPage({ params }) {
  const { username: courseSlug, topicSlug, nestedSlug } = await params;
  return (
    <CourseTopicPage
      courseSlug={courseSlug}
      topicPath={[topicSlug, ...nestedSlug]}
    />
  );
}
