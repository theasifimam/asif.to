import InterviewQuestionForm from "../components/InterviewQuestionForm";

export default async function NewInterviewQuestionPage({ searchParams }) {
  const { course = "" } = await searchParams;
  return <InterviewQuestionForm initialCourse={course} />;
}
