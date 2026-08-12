"use client";

import { use } from "react";
import TopicForm from "../../components/TopicForm";

export default function EditTopicPage({ params }) {
  const { id } = use(params);
  return <TopicForm topicId={id} />;
}
