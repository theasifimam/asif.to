import CourseTopicPage, {
  buildTopicMetadata,
} from "@/components/courses/CourseTopicPage";
import InterviewQuestionArticle, {
  buildInterviewQuestionMetadata,
} from "@/components/interview/InterviewQuestionArticle";
import CategoryInterviewGuide, {
  buildCategoryInterviewGuideMetadata,
} from "@/components/interview/InterviewQuestionsGuide";
import { getPublicInterviewCategory } from "@/lib/publicContent";

export const dynamic = "force-dynamic";


export async function generateMetadata({ params, searchParams }) {
  const { username: courseSlug, topicSlug, nestedSlug } = await params;
  const { page } = (await searchParams) || {};

  if (topicSlug === "interview-questions") {
    if (nestedSlug.length === 1) {
      const categoryData = await getPublicInterviewCategory(
        courseSlug,
        nestedSlug[0],
        page,
      );
      if (categoryData?.category) {
        return buildCategoryInterviewGuideMetadata(
          courseSlug,
          nestedSlug[0],
          page,
        );
      }
      return buildInterviewQuestionMetadata(courseSlug, nestedSlug[0]);
    }
    if (nestedSlug.length === 2) {
      return buildInterviewQuestionMetadata(courseSlug, nestedSlug[1]);
    }
  }

  return buildTopicMetadata(courseSlug, [topicSlug, ...nestedSlug]);
}

export default async function NestedPublicTopicPage({ params, searchParams }) {
  const { username: courseSlug, topicSlug, nestedSlug } = await params;
  const { page } = (await searchParams) || {};

  if (topicSlug === "interview-questions") {
    if (nestedSlug.length === 1) {
      const categoryData = await getPublicInterviewCategory(
        courseSlug,
        nestedSlug[0],
        page,
      );
      if (categoryData?.category) {
        return (
          <CategoryInterviewGuide
            courseSlug={courseSlug}
            categorySlug={nestedSlug[0]}
            requestedPage={page}
          />
        );
      }
      return (
        <InterviewQuestionArticle
          courseSlug={courseSlug}
          questionSlug={nestedSlug[0]}
        />
      );
    }
    if (nestedSlug.length === 2) {
      return (
        <InterviewQuestionArticle
          courseSlug={courseSlug}
          categorySlug={nestedSlug[0]}
          questionSlug={nestedSlug[1]}
        />
      );
    }
  }

  return (
    <CourseTopicPage
      courseSlug={courseSlug}
      topicPath={[topicSlug, ...nestedSlug]}
    />
  );
}
