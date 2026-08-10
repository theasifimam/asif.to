import React from "react";
import ArticleClient from "@/components/ArticleClient";
import { Metadata } from "next";

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
    };
  }

  const description = article.content
    ? article.content.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
    : "Read the latest investigations on asif.to.";

  return {
    title: `${article.title} | asif.to`,
    description: description,
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

export default function ArticlePage({ params }) {
  const { slug: slugWithId } = React.use(params);

  return <ArticleClient slug={slugWithId} />;
}
