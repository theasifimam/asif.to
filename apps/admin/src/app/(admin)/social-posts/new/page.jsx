"use client";

import { useRouter } from "next/navigation";
import SocialPostStudio from "@/components/social-posts/SocialPostStudio";

export default function NewSocialPostPage() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-6">
      <SocialPostStudio
        onCreated={(id) => router.replace(`/social-posts/${id}`)}
      />
    </div>
  );
}
