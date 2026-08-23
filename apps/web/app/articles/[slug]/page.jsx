import ArticleClient from "@/components/articles/ArticleClient";
import { authorIdentity, buildPersonSchema } from "@/lib/authorIdentity";
import { absoluteUrl, assetUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function getArticle(slugWithId) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl || !slugWithId) return null;

  const lastDash = slugWithId.lastIndexOf("-");
  const possibleId = lastDash >= 0 ? slugWithId.slice(lastDash + 1) : "";
  const looksLikeMongoId = /^[a-f0-9]{24}$/i.test(possibleId);

  if (looksLikeMongoId) {
    try {
      const byId = await fetch(`${baseUrl}/articles/${possibleId}`, {
        next: { revalidate: 60 },
      });
      if (byId.ok) {
        const body = await byId.json();
        if (body?.data) return body.data;
      }
    } catch {}
  }

  const slug = looksLikeMongoId
    ? slugWithId.slice(0, lastDash)
    : slugWithId;

  try {
    const bySlug = await fetch(
      `${baseUrl}/articles/slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (!bySlug.ok) return null;
    const body = await bySlug.json();
    return body?.data || null;
  } catch {
    return null;
  }
}

import { getImageUrl } from "@/lib/config";

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
      images: [getImageUrl(article.image || "/logo.jpeg")],
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
      images: [getImageUrl(article.image || "/logo.jpeg")],
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
