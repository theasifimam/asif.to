import ChapterActivityClient from "@/components/courses/ChapterActivityClient";
import CourseTopicPage, {
  buildTopicMetadata,
} from "@/components/courses/CourseTopicPage";
import InterviewQuestionArticle, {
  buildInterviewQuestionMetadata,
} from "@/components/interview/InterviewQuestionArticle";
import CategoryInterviewGuide, {
  buildCategoryInterviewGuideMetadata,
} from "@/components/interview/InterviewQuestionsGuide";
import { getChapterData, getPublicInterviewCategory } from "@/lib/publicContent";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// ASIF_CONTEXTUAL_CHAPTER_LEARNING_V1
const CHAPTER_ACTIVITIES = new Set(["revise", "practice", "build"]);

function activityAvailable(data, activity) {
  const chapter = data?.chapter;
  const available = chapter?.learningAvailability || {};
  if (!chapter) return false;
  if (activity === "revise") return Number(available.reviseCount || 0) > 0;
  if (activity === "practice")
    return Number(available.practiceCount || 0) > 0 ||
      Boolean(String(chapter.tryItChallenge || "").trim());
  if (activity === "build") return Boolean(available.build);
  return false;
}


export async function generateMetadata({ params, searchParams }) {
  const { username: courseSlug, topicSlug, nestedSlug } = await params;
  const { page } = (await searchParams) || {};

  if (nestedSlug.length === 1 && CHAPTER_ACTIVITIES.has(nestedSlug[0])) {
    const chapterData = await getChapterData(courseSlug, topicSlug);
    if (
      chapterData?.course &&
      chapterData?.chapter &&
      activityAvailable(chapterData, nestedSlug[0])
    ) {
      const label = nestedSlug[0][0].toUpperCase() + nestedSlug[0].slice(1);
      return {
        title: `${label}: ${chapterData.chapter.title} - ${chapterData.course.title}`,
        description: `${label} ${chapterData.chapter.title} inside the ${chapterData.course.title} course.`,
        robots: { index: false, follow: true },
      };
    }
  }

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

  if (nestedSlug.length === 1 && CHAPTER_ACTIVITIES.has(nestedSlug[0])) {
    const chapterData = await getChapterData(courseSlug, topicSlug);
    if (chapterData?.course && chapterData?.chapter) {
      if (!activityAvailable(chapterData, nestedSlug[0])) notFound();
      return (
        <ChapterActivityClient
          courseSlug={courseSlug}
          chapterSlug={topicSlug}
          activity={nestedSlug[0]}
          initialData={chapterData}
        />
      );
    }
  }

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
