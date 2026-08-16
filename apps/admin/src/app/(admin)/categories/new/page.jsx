import CategoryForm from "../components/CategoryForm";

export default async function NewCategoryPage({ searchParams }) {
  const { course = "" } = (await searchParams) || {};
  return <CategoryForm initialCourse={course} />;
}
