"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
import { socialPostsApi } from "@/lib/api";
import SocialPostStudio from "@/components/social-posts/SocialPostStudio";
import SocialMediaTabs from "@/components/social-posts/SocialMediaTabs";
import { AdminEmptyState, AdminPage, AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";

export default function EditSocialPostPage({ params }) {
  const { id } = use(params);
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    socialPostsApi.get(id).then((result) => {
      const postData = result?.data?.data;
      if (result?.success && postData) setPost(postData);
      else
        setError(
          result?.error ||
            result?.data?.message ||
            "Unable to load social post."
        );
    });
  }, [id]);

  if (error) {
    return (
      <AdminPage size="xl">
        <AdminEmptyState
          icon={AlertCircle}
          title="Social Post Unavailable"
          description={error}
          action={
            <Button asChild variant="outline">
              <Link href="/social-posts">Return to Social Posts</Link>
            </Button>
          }
        />
      </AdminPage>
    );
  }

  if (!post) {
    return (
      <AdminPage size="xl">
        <div className="flex h-64 items-center justify-center rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage size="xl">
      <AdminPageHeader
        eyebrow="Social Media / Edit post"
        title={post.name}
        description="Customize post content, manage slide sequences, and control publishing settings."
        back={
          <Link
            href="/social-posts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to social posts
          </Link>
        }
        actions={<SocialMediaTabs />}
      />

      <SocialPostStudio key={post._id} postId={post._id} initialPost={post} />
    </AdminPage>
  );
}

