import { renderOgImage } from "@/lib/ogImage";
import { getCourse } from "@/lib/publicContent";

export const alt = "asif.to course";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;

export default async function CourseOpenGraphImage({ params }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  const courseName = course?.title || courseId;
  const title = course
    ? course.seoTitle || `${course.title} Course`
    : courseId
      ? `${courseId} Course`
      : "asif.to";

  return renderOgImage({
    type: "course",
    title,
    course: courseName,
    description:
      course?.seoDescription ||
      course?.subtitle ||
      (courseName
        ? `Learn ${courseName} from fundamentals to advanced concepts.`
        : "Practical web development, step by step."),
  });
}
