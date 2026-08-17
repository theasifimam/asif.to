import React from "react";
import AuthorClient from "@/components/authors/AuthorClient";
import AsifAuthorProfile from "@/components/authors/AsifAuthorProfile";
import { authorIdentity, buildPersonSchema } from "@/lib/authorIdentity";
import { absoluteUrl, assetUrl, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function getAuthor(username) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/users/public/${username}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data.user;
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  if (username.toLowerCase() === "asif") return {
    title: "Asif — Full-Stack JavaScript Developer and Author",
    description: authorIdentity.shortBio,
    alternates: { canonical: authorIdentity.url },
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
    openGraph: { title: "Asif — Author and Developer behind asif.to", description: authorIdentity.shortBio, url: authorIdentity.url, type: "profile" },
  };
  const user = await getAuthor(username);

  if (!user) {
    return {
      title: "Author Not Found | asif.to",
      robots: { index: false, follow: false },
    };
  }

  const description =
    user.bio || `View articles and profile of ${user.fullName} on asif.to.`;

  return {
    title: `${user.fullName} | Author at asif.to`,
    description: description,
    alternates: { canonical: absoluteUrl("", `/author/${user.username}`) },
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
      title: `${user.fullName} | asif.to`,
      description: description,
      images: [
        user.avatar
          ? user.avatar.startsWith("http")
            ? user.avatar
            : `${process.env.NEXT_PUBLIC_STORAGE_URL}${user.avatar}`
          : "/logo.jpeg",
      ],
      type: "profile",
      username: user.username,
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.fullName} (@${user.username}) | asif.to`,
      description: user.bio || `Read articles by ${user.fullName} on asif.to.`,
      images: [
        user.avatar
          ? user.avatar.startsWith("http")
            ? user.avatar
            : `${process.env.NEXT_PUBLIC_STORAGE_URL}${user.avatar}`
          : "/logo.jpeg",
      ],
    },
  };
}

export default async function AuthorProfilePage({ params }) {
  const { username } = await params;
  if (username.toLowerCase() === "asif") {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const safeFetch = async (path) => { try { const response = await fetch(`${baseUrl}${path}`, { next: { revalidate: 60 } }); return response.ok ? await response.json() : null; } catch { return null; } };
    const [profileBody, coursesBody, articlesBody] = await Promise.all([safeFetch("/users/public/asif"), safeFetch("/courses"), safeFetch("/articles?status=published&limit=12")]);
    const profile = profileBody?.data?.user || null;
    const courses = coursesBody?.data || [];
    const articles = articlesBody?.data || [];
    const schema = { "@context": "https://schema.org", "@graph": [buildPersonSchema({ image: profile?.avatar ? assetUrl(profile.avatar) : undefined }), { "@type": "ProfilePage", "@id": `${authorIdentity.url}#profile`, url: authorIdentity.url, name: "Asif — Full-Stack JavaScript Developer", mainEntity: { "@id": `${authorIdentity.url}#person` }, isPartOf: { "@type": "WebSite", name: "asif.to", url: absoluteUrl("", "/") } }] };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}/><AsifAuthorProfile profile={profile} courses={Array.isArray(courses) ? courses : courses?.data || []} articles={Array.isArray(articles) ? articles : []}/></>;
  }
  return <AuthorClient username={username} />;
}
