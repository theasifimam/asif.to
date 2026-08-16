"use client";

import { use } from "react";
import CategoryForm from "../../components/CategoryForm";

export default function EditCategoryPage({ params }) {
  const { id } = use(params);
  return <CategoryForm categoryId={id} />;
}
