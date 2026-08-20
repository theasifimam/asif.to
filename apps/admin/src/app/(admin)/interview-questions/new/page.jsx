import InterviewQuestionForm from "../components/InterviewQuestionForm";

export default async function NewInterviewQuestionPage({ searchParams }) {
  const { course = "", category = "" } = await searchParams;
  return (
    <InterviewQuestionForm
      initialCourse={course}
      initialCategory={category}
      lockTaxonomy={Boolean(course && category)}
    />
  );
}
