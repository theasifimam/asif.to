import CourseForm from "../../components/CourseForm";

export default async function EditCoursePage({ params }) {
  const { courseId } = await params;
  return <CourseForm courseId={courseId} />;
}
