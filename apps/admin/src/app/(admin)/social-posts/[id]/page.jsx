"use client";

import { use, useEffect, useState } from "react";
import { socialPostsApi } from "@/lib/api";
import SocialPostStudio from "@/components/social-posts/SocialPostStudio";

export default function EditSocialPostPage({ params }) {
  const { id } = use(params);

  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      const result = await socialPostsApi.get(id);

      const postData = result?.data?.data;

      if (result?.success && postData) {
        setPost(postData);
      } else {
        setError(
          result?.error ||
            result?.data?.message ||
            "Unable to load social post.",
        );
      }
    };

    loadPost();
  }, [id]);

  if (error) {
    return <div className="p-6 text-sm text-destructive">{error}</div>;
  }

  if (!post) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <SocialPostStudio key={post._id} postId={post._id} initialPost={post} />
    </div>
  );
}
