import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

async function getLibrary(username) {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return null;
  const response = await fetch(`${api}/library/public/${encodeURIComponent(username)}`, { next: { revalidate: 3600 } });
  if (!response.ok) return null;
  return (await response.json())?.data;
}
export async function generateMetadata({ params }) { const { username } = await params; const data = await getLibrary(username); return data ? { title: `${data.author.fullName}'s Knowledge Library`, description: `Public notes, snippets, guides and developer knowledge by ${data.author.fullName}.` } : { robots: { index: false } }; }
export default async function PublicLibraryProfile({ params }) { const { username } = await params; const data = await getLibrary(username); if (!data) notFound(); return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><Header/><main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6"><p className="text-xs font-black uppercase tracking-widest text-blue-600">Knowledge</p><h1 className="mt-2 text-4xl font-black">{data.author.fullName}&apos;s library</h1><p className="mt-2 text-zinc-500">Public notes, snippets, fixes and useful developer knowledge.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.entries.map((entry)=><Link key={entry._id} href={`/library/${username}/${entry.slug}`} className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 dark:bg-zinc-900"><p className="text-[10px] font-black uppercase tracking-wider text-blue-600">{entry.type.replaceAll("_", " ")}</p><h2 className="mt-3 font-black">{entry.title}</h2><p className="mt-3 text-xs text-zinc-500">{entry.tags?.map((tag)=>`#${tag}`).join(" ")}</p></Link>)}</div>{!data.entries.length&&<p className="mt-8 text-zinc-500">No public knowledge has been shared yet.</p>}</main><Footer/></div>; }
