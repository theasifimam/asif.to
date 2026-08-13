import { permanentRedirect } from "next/navigation";

export default async function LegacyInterviewQuestionsPage({ params, searchParams }) {
  const { courseId } = await params;
  const { page } = await searchParams;
  const query = Number(page) > 1 ? `?page=${Number(page)}` : "";
  permanentRedirect(`/${encodeURIComponent(courseId)}/interview-questions${query}`);
}
