"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/store/hooks";
import { useCreateCommunityPostMutation } from "@/lib/api/communityApi";
import { POST_TYPES } from "./communityConstants";

export default function CommunityComposer({ relatedResource = null, initialType = "discussion", compact = false }) {
  const router = useRouter();
  const authenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [createPost, { isLoading }] = useCreateCommunityPostMutation();
  const [form, setForm] = useState({ type: initialType, title: "", body: "", code: "", language: "", tags: "" });
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    try {
      const response = await createPost({ ...form, tags: form.tags.split(","), relatedResource }).unwrap();
      toast.success("Discussion published");
      router.push(`/community/${response.data.slug}`);
    } catch (error) { toast.error(error?.data?.message || "Unable to publish this post"); }
  };
  if (!authenticated) return <div className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm dark:border-zinc-700">Sign in to learn with the community. <Link className="font-bold text-blue-600" href="/login">Sign in</Link></div>;
  return <form onSubmit={submit} className={`${compact ? "p-4" : "p-5 sm:p-7"} space-y-4 rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900`}>
    {relatedResource && <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Discussing {relatedResource.title}</p>}
    <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
      <select value={form.type} onChange={set("type")} className="rounded-xl border border-zinc-200 bg-transparent px-3 py-3 text-sm dark:border-zinc-700">{POST_TYPES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      <input required minLength={8} maxLength={180} value={form.title} onChange={set("title")} placeholder="A clear, specific title" className="rounded-xl border border-zinc-200 bg-transparent px-4 py-3 text-sm dark:border-zinc-700" />
    </div>
    <textarea required minLength={20} maxLength={20000} value={form.body} onChange={set("body")} rows={compact ? 4 : 7} placeholder="Share context, what you tried, or the idea you want to discuss…" className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-3 text-sm leading-6 dark:border-zinc-700" />
    {!compact && <><div className="grid gap-3 sm:grid-cols-[1fr_180px]"><textarea maxLength={30000} value={form.code} onChange={set("code")} rows={5} placeholder="Optional code" className="rounded-xl border border-zinc-200 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-100" /><input maxLength={40} value={form.language} onChange={set("language")} placeholder="Language" className="h-fit rounded-xl border border-zinc-200 bg-transparent px-4 py-3 text-sm dark:border-zinc-700" /></div><input value={form.tags} onChange={set("tags")} placeholder="Tags, comma separated (up to 8)" className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-3 text-sm dark:border-zinc-700" /></>}
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-zinc-500">By posting, you agree to the <Link href="/community/guidelines" className="font-bold text-blue-600">community guidelines</Link>.</p><button disabled={isLoading} className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-black text-white disabled:opacity-50">{isLoading ? "Publishing…" : "Publish"}</button></div>
  </form>;
}
