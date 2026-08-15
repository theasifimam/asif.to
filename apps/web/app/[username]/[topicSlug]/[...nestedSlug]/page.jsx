import CourseTopicPage, {
  buildTopicMetadata,
} from "@/components/courses/CourseTopicPage";
import InterviewQuestionArticle, {
  buildInterviewQuestionMetadata,
} from "@/components/interview/InterviewQuestionArticle";

export const revalidate = 60;
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const { username: courseSlug, topicSlug, nestedSlug } = await params;
  if (topicSlug === "interview-questions" && nestedSlug.length === 1)
    return buildInterviewQuestionMetadata(courseSlug, nestedSlug[0]);
  return buildTopicMetadata(courseSlug, [topicSlug, ...nestedSlug]);
}

export default async function NestedPublicTopicPage({ params }) {
  const { username: courseSlug, topicSlug, nestedSlug } = await params;
  if (topicSlug === "interview-questions" && nestedSlug.length === 1)
    return (
      <InterviewQuestionArticle
        courseSlug={courseSlug}
        questionSlug={nestedSlug[0]}
      />
    );
  return (
    <CourseTopicPage
      courseSlug={courseSlug}
      topicPath={[topicSlug, ...nestedSlug]}
    />
  );
}
