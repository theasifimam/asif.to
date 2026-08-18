import ArticleClient from "@/components/articles/ArticleClient";
import { authorIdentity, buildPersonSchema } from "@/lib/authorIdentity";
import { absoluteUrl, assetUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function getArticle(slugWithId) {
  const id = slugWithId.substring(slugWithId.lastIndexOf("-") + 1);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/articles/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data;
}

export async function generateMetadata({ params }) {
  const { slug: slugWithId } = await params;
  const article = await getArticle(slugWithId);

  if (!article) {
    return {
      title: "Article Not Found | asif.to",
      robots: { index: false, follow: false },
    };
  }

  const description = article.content
    ? article.content.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
    : "Read the latest investigations on asif.to.";
  const canonical = absoluteUrl(
    article.canonicalUrl,
    `/articles/${slugWithId}`,
  );

  return {
    title: `${article.title} | asif.to`,
    description: description,
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
      title: article.title,
      description: description,
      images: [
        article.image
          ? article.image.startsWith("http")
            ? article.image
            : `${process.env.NEXT_PUBLIC_STORAGE_URL}${article.image}`
          : "/logo.jpeg",
      ],
      type: "article",
      authors: [article.author?.fullName],
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: description,
      images: [
        article.image
          ? article.image.startsWith("http")
            ? article.image
            : `${process.env.NEXT_PUBLIC_STORAGE_URL}${article.image}`
          : "/logo.jpeg",
      ],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug: slugWithId } = await params;
  const article = await getArticle(slugWithId);
  const canonical = absoluteUrl(
    article?.canonicalUrl,
    `/articles/${slugWithId}`,
  );
  const schema = article
    ? {
        "@context": "https://schema.org",
        "@graph": [
          buildPersonSchema({
            image: article.author?.avatar
              ? assetUrl(article.author.avatar)
              : undefined,
          }),
          {
            "@type": "TechArticle",
            "@id": `${canonical}#article`,
            headline: article.title,
            description: article.seoDescription || undefined,
            url: canonical,
            image: article.image ? assetUrl(article.image) : undefined,
            datePublished: article.createdAt,
            dateModified: article.updatedAt || article.createdAt,
            author: { "@id": `${authorIdentity.url}#person` },
            publisher: {
              "@type": "Organization",
              name: "asif.to",
              url: absoluteUrl("", "/"),
            },
            mainEntityOfPage: canonical,
          },
        ],
      }
    : null;
  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      )}
      <ArticleClient slug={slugWithId} initialData={article} />
    </>
  );
}
