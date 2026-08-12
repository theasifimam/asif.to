"use client";

import { use } from "react";
import InterviewQuestionForm from "../../components/InterviewQuestionForm";

export default function EditInterviewQuestionPage({ params }) {
  const { id } = use(params);
  return <InterviewQuestionForm questionId={id} />;
}
