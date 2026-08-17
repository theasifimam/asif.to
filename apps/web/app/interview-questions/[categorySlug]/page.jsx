import CategoryInterviewGuide, {
  buildCategoryInterviewGuideMetadata,
} from "@/components/interview/InterviewQuestionsGuide";
import { getPublicInterviewCategory } from "@/lib/publicContent";
import { permanentRedirect } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({ params, searchParams }) {
  const { categorySlug } = await params;
  const { page } = await searchParams;
  const data = await getPublicInterviewCategory(categorySlug, page);
  if (data?.category?.course?.slug) {
    const pageQuery = Number(page) > 1 ? `?page=${Number(page)}` : "";
    permanentRedirect(
      `/${encodeURIComponent(data.category.course.slug)}/interview-questions/${encodeURIComponent(data.category.slug || categorySlug)}${pageQuery}`,
    );
  }
  return buildCategoryInterviewGuideMetadata(categorySlug, page);
}

export default async function InterviewCategoryLandingPage({
  params,
  searchParams,
}) {
  const { categorySlug } = await params;
  const { page } = await searchParams;
  const data = await getPublicInterviewCategory(categorySlug, page);
  if (data?.category?.course?.slug) {
    const pageQuery = Number(page) > 1 ? `?page=${Number(page)}` : "";
    permanentRedirect(
      `/${encodeURIComponent(data.category.course.slug)}/interview-questions/${encodeURIComponent(data.category.slug || categorySlug)}${pageQuery}`,
    );
  }
  return (
    <CategoryInterviewGuide
      categorySlug={categorySlug}
      requestedPage={page}
    />
  );
}
