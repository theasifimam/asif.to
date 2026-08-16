import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asif.to";
async function getEntry(username, slug) {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return null;
  const response = await fetch(`${api}/library/public/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
  if (!response.ok) return null;
  return (await response.json())?.data;
}
export async function generateMetadata({ params }) {
  const { username, slug } = await params; const data = await getEntry(username, slug); if (!data) return { robots: { index: false, follow: false } };
  const { entry } = data; const canonical = entry.canonicalUrl || `${siteUrl}/library/${username}/${entry.slug}`;
  return { title: entry.seoTitle || entry.title, description: entry.seoDescription || entry.content.replace(/[#*_`]/g, "").slice(0, 160), alternates: { canonical }, robots: { index: true, follow: true }, openGraph: { type: "article", title: entry.ogTitle || entry.seoTitle || entry.title, description: entry.ogDescription || entry.seoDescription || entry.content.replace(/[#*_`]/g, "").slice(0, 160), url: canonical, authors: [data.author.fullName] } };
}
export default async function PublicKnowledgePage({ params }) {
  const { username, slug } = await params; const data = await getEntry(username, slug); if (!data) notFound(); const { entry, author } = data;
  const jsonLd = { "@context": "https://schema.org", "@type": "TechArticle", headline: entry.title, datePublished: entry.createdAt, dateModified: entry.updatedAt, author: { "@type": "Person", name: author.fullName, url: `${siteUrl}/library/${author.username}` }, keywords: entry.tags?.join(", ") };
  return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><Header/><main className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6"><article className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-zinc-900 sm:p-10"><p className="text-xs font-black uppercase tracking-widest text-blue-600">{entry.type.replaceAll("_", " ")}</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{entry.title}</h1><div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-zinc-500"><Link href={`/library/${author.username}`} className="font-bold text-blue-600">{author.fullName}</Link><span>·</span><span>Updated {new Date(entry.updatedAt).toLocaleDateString()}</span></div><div className="mt-6 flex flex-wrap gap-2">{entry.tags?.map((tag)=><span key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800">#{tag}</span>)}</div><div className="mt-8 whitespace-pre-wrap break-words font-mono text-sm leading-7 text-zinc-700 dark:text-zinc-200">{entry.content}</div></article></main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><Footer/></div>;
}
