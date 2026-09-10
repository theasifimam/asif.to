"use client";

import { use } from "react";
import SourceForm from "../../components/SourceForm";

export default function EditSourcePage({ params }) {
  const { id } = use(params);
  return <SourceForm sourceId={id} />;
}
