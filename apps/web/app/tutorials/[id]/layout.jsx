import { TUTORIALS } from "@/lib/tutorialData";
import { authorIdentity, buildPersonSchema } from "@/lib/authorIdentity";
import { absoluteUrl, jsonLd } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const tutorial = TUTORIALS.find((item) => item.id === id);
  if (!tutorial) return { title: "Tutorial Not Found", robots: { index: false } };
  const canonical = absoluteUrl("", `/tutorials/${encodeURIComponent(id)}`);
  return {
    title: tutorial.title,
    description: tutorial.summary,
    authors: [{ name: authorIdentity.name, url: authorIdentity.url }],
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: tutorial.title,
      description: tutorial.summary,
      type: "article",
      url: canonical,
      modifiedTime: tutorial.updatedAt || undefined,
    },
  };
}

export default async function TutorialLayout({ children, params }) {
  const { id } = await params;
  const tutorial = TUTORIALS.find((item) => item.id === id);
  if (!tutorial) return children;
  const canonical = absoluteUrl("", `/tutorials/${encodeURIComponent(id)}`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      buildPersonSchema(),
      {
        "@type": "TechArticle",
        "@id": `${canonical}#tutorial`,
        headline: tutorial.title,
        description: tutorial.summary,
        url: canonical,
        dateModified: tutorial.updatedAt || undefined,
        author: { "@id": `${authorIdentity.url}#person` },
        publisher: {
          "@type": "Organization",
          name: "asif.to",
          url: absoluteUrl("", "/"),
        },
      },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />{children}</>;
}
