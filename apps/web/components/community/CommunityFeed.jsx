"use client";
import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { useGetCommunityPostsQuery } from "@/lib/api/communityApi";
import CommunityPostCard from "./CommunityPostCard";
import CommunityComposer from "./CommunityComposer";

const filters = [["", "Latest"], ["question", "Questions"], ["discussion", "Discussions"], ["help", "Help"], ["code", "Code"], ["learning", "Learning"], ["project", "Projects"]];
export default function CommunityFeed() {
  const [type, setType] = useState(""); const [page, setPage] = useState(1); const [compose, setCompose] = useState(false);
  const { data, isLoading, isError, refetch } = useGetCommunityPostsQuery({ type: type || undefined, page, limit: 12 });
  const result = data?.data || {};
  return <>
    <div className="flex flex-wrap items-center gap-2">{filters.map(([value,label]) => <button key={label} onClick={() => { setType(value); setPage(1); }} className={`rounded-full px-4 py-2 text-xs font-bold ${type === value ? "bg-blue-600 text-white" : "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>{label}</button>)}<button onClick={() => setCompose(!compose)} className="ml-auto inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-zinc-950"><Plus className="h-4 w-4" />Start a post</button></div>
    {compose && <div className="mt-5"><CommunityComposer /></div>}
    <div className="mt-6 space-y-4">{isLoading ? <p className="py-16 text-center text-sm text-zinc-500">Loading community posts…</p> : isError ? <div className="py-16 text-center"><p className="text-sm text-rose-600">The community feed could not be loaded.</p><button onClick={refetch} className="mt-3 text-sm font-bold text-blue-600">Try again</button></div> : result.posts?.length ? result.posts.map((post) => <CommunityPostCard key={post._id} post={post} />) : <div className="rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700"><MessageSquare className="mx-auto h-8 w-8 text-zinc-400"/><p className="mt-3 font-bold">No posts here yet.</p><p className="mt-1 text-sm text-zinc-500">Start a useful developer discussion.</p></div>}</div>
    {(result.pagination?.totalPages || 1) > 1 && <div className="mt-6 flex justify-center gap-3"><button disabled={page === 1} onClick={() => setPage((v) => v - 1)} className="rounded-full border px-4 py-2 text-sm disabled:opacity-40">Previous</button><span className="px-2 py-2 text-sm">{page} / {result.pagination.totalPages}</span><button disabled={page >= result.pagination.totalPages} onClick={() => setPage((v) => v + 1)} className="rounded-full border px-4 py-2 text-sm disabled:opacity-40">Next</button></div>}
  </>;
}
