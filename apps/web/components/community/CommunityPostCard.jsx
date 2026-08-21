import Link from "next/link";
import { MessageCircle, Link2 } from "lucide-react";
import { TYPE_LABELS } from "./communityConstants";

export default function CommunityPostCard({ post, compact = false }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <Link href={`/${post.author?.username}`} className="font-bold text-zinc-800 hover:text-blue-600 dark:text-zinc-200">{post.author?.fullName || "Developer"}</Link>
        <span>·</span><span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{TYPE_LABELS[post.type] || post.type}</span>
      </div>
      <Link href={`/community/${post.slug}`} className="group block">
        <h2 className={`${compact ? "mt-3 text-lg" : "mt-4 text-xl"} font-black tracking-tight group-hover:text-blue-600`}>{post.title}</h2>
        <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-zinc-600 dark:text-zinc-400">{post.body}</p>
      </Link>
      {post.relatedResource && <Link href={post.relatedResource.url} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-600 hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-300"><Link2 className="h-3.5 w-3.5" />{post.relatedResource.kind.replaceAll("_", " ")} · {post.relatedResource.title}</Link>}
      <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-3 text-xs font-semibold text-zinc-500 dark:border-zinc-800"><span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{post.commentCount || 0} responses</span>{post.editedAt && <span>edited</span>}</div>
    </article>
  );
}
