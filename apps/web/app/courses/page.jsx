import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CoursesClient from "@/components/courses/CoursesClient";
import { getCourses } from "@/lib/publicContent";
import { absoluteUrl } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { getSeoSetting } from "@/lib/publicContent";
import { mergePageMetadata } from "@/lib/pageMetadata";

export const revalidate = 60;

export async function generateMetadata() {
  const title = "All Developer Courses & Learning Tracks | asif.to";
  const description =
    "Explore all interactive developer courses, curriculum roadmaps, and hands-on coding tutorials published on asif.to. Master Next.js 15, Python, React, JavaScript, Node.js, and TypeScript.";
  const canonical = absoluteUrl("/courses");

  return mergePageMetadata(
    { title, description },
    await getSeoSetting("/courses"),
    canonical,
  );
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "All Developer Courses & Learning Tracks",
          url: absoluteUrl("", "/courses"),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: (courses || []).map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.title,
              url: absoluteUrl("", `/courses/${item.slug || item.id}`),
            })),
          },
        }}
      />
      <Header />
      <CoursesClient initialCourses={courses || []} />
      <Footer />
    </div>
  );
}
