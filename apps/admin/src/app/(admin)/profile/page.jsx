"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user?._id) {
        router.replace(`/users/${user._id}`);
      } else {
        router.replace("/users");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-zinc-500" size={32} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
          Redirecting to profile...
        </span>
      </div>
    </div>
  );
}
