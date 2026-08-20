import InterviewQuestionsManager from "@/app/(admin)/interview-questions/components/InterviewQuestionsManager";

export default async function CourseCategoryInterviewQuestionsPage({ params }) {
  const { courseId, categoryId } = await params;

  return (
    <InterviewQuestionsManager
      lockedCourseId={courseId}
      lockedCategoryId={categoryId}
    />
  );
}
