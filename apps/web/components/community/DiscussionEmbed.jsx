"use client";
import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { useGetCommunityPostsQuery } from "@/lib/api/communityApi";
import CommunityPostCard from "./CommunityPostCard";

export default function DiscussionEmbed({ kind, targetId, title, prompt = "Discuss this content" }) {
  const { data, isLoading } = useGetCommunityPostsQuery({ relatedKind: kind, relatedId: targetId, limit: 3 });
  const posts = data?.data?.posts || [];
  const href = `/community/new?${new URLSearchParams({ kind, targetId: String(targetId), title }).toString()}`;
  return <section className="mt-12 rounded-3xl border border-blue-200/70 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/20 sm:p-7" aria-labelledby={`discussion-${targetId}`}>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Learn together</p><h2 id={`discussion-${targetId}`} className="mt-2 text-2xl font-black">Discussion</h2><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Ask a question, add an example, or suggest another approach.</p></div><Link href={href} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-black text-white"><MessageSquarePlus className="h-4 w-4"/>{prompt}</Link></div>
    {isLoading?<p className="mt-5 text-sm text-zinc-500">Loading discussions…</p>:posts.length?<div className="mt-5 grid gap-3">{posts.map((post)=><CommunityPostCard key={post._id} post={post} compact/>)}</div>:<p className="mt-5 rounded-2xl border border-dashed border-blue-200 p-5 text-sm text-zinc-500 dark:border-blue-900">No linked discussions yet. Start the first one and it will also appear in the community feed.</p>}
  </section>;
}
