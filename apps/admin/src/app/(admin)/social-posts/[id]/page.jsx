"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { socialPostsApi } from "@/lib/api";
import SocialPostStudio from "@/components/social-posts/SocialPostStudio";
import SocialMediaTabs from "@/components/social-posts/SocialMediaTabs";

export default function EditSocialPostPage({ params }) {
  const { id } = use(params);
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    socialPostsApi.get(id).then((result) => {
      const postData = result?.data?.data;
      if (result?.success && postData) setPost(postData);
      else setError(result?.error || result?.data?.message || "Unable to load social post.");
    });
  }, [id]);

  if (error) return <div className="p-6 text-sm text-destructive">{error}</div>;
  if (!post) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/social-posts" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-white" title="Back to Social Media">
            <ArrowLeft size={17} />
          </Link>
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">Social Media / Edit post</div>
            <h1 className="truncate text-lg font-bold">{post.name}</h1>
          </div>
        </div>
        <SocialMediaTabs />
      </div>
      <SocialPostStudio key={post._id} postId={post._id} initialPost={post} />
    </div>
  );
}
