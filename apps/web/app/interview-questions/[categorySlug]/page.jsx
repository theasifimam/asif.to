import CategoryInterviewGuide, {
  buildCategoryInterviewGuideMetadata,
} from "@/components/interview/InterviewQuestionsGuide";

export const revalidate = 60;

export async function generateMetadata({ params, searchParams }) {
  const { categorySlug } = await params;
  const { page } = await searchParams;
  return buildCategoryInterviewGuideMetadata(categorySlug, page);
}

export default async function InterviewCategoryLandingPage({
  params,
  searchParams,
}) {
  const { categorySlug } = await params;
  const { page } = await searchParams;
  return (
    <CategoryInterviewGuide
      categorySlug={categorySlug}
      requestedPage={page}
    />
  );
}
