import { permanentRedirect } from "next/navigation";

export default async function LegacyInterviewQuestionPage({ params }) {
  const { courseId, questionSlug } = await params;
  permanentRedirect(`/${encodeURIComponent(courseId)}/interview-questions/${encodeURIComponent(questionSlug)}`);
}
