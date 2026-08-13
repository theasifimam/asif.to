"use client";
import { use } from "react";
import QuestionForm from "../../components/QuestionForm";
export default function EditQuestionPage({ params }) { const { id } = use(params); return <QuestionForm questionId={id} />; }
