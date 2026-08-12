import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyCourseChapterPage({ params }) {
  const { courseId, chapterId } = await params;
  permanentRedirect(
    `/${encodeURIComponent(courseId)}/${encodeURIComponent(chapterId)}`,
  );
}
