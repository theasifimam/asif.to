import CheatsheetReader from "@/components/courses/CheatsheetReader";
import { getCheatsheet, getRelatedContent } from "@/lib/publicContent";
import { absoluteUrl } from "@/lib/seo";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 60;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cheatsheet = await getCheatsheet(slug);

  if (!cheatsheet) {
    return {
      title: "Cheatsheet Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title =
    cheatsheet.seoTitle || `${cheatsheet.title} | Coding Cheatsheet`;
  const description =
    cheatsheet.seoDescription ||
    `Quick syntax reference, code examples and guides for ${cheatsheet.title} on asif.to.`;
  const canonical = absoluteUrl(
    cheatsheet.canonicalUrl,
    `/cheatsheets/${slug}`,
  );

  return {
    title,
    description,
    keywords: cheatsheet.keywords || [],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "asif.to",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CheatsheetPage({ params }) {
  const { slug } = await params;
  const cheatsheet = await getCheatsheet(slug);
  if (!cheatsheet) notFound();
  const canonical = absoluteUrl(
    cheatsheet.canonicalUrl,
    `/cheatsheets/${slug}`,
  );

  const relatedData = await getRelatedContent({
    type: "cheatsheet",
    slug,
    techId: cheatsheet.techId,
  });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: cheatsheet.title,
          description: cheatsheet.seoDescription || undefined,
          url: canonical,
          mainEntityOfPage: canonical,
          datePublished: cheatsheet.createdAt,
          dateModified: cheatsheet.updatedAt || cheatsheet.createdAt,
        }}
      />
      <CheatsheetReader
        slug={slug}
        initialData={cheatsheet}
        relatedData={relatedData}
      />
    </>
  );
}
