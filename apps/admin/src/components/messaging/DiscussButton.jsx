"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { messagingApi } from "@/lib/api";

export default function DiscussButton({
  entityType,
  entityId,
  variant = "outline",
  className = "",
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const open = async () => {
    setLoading(true);
    setError("");
    const result = await messagingApi.discussion(entityType, entityId);
    if (result.success)
      router.push(
        `/messages?conversation=${result.data.data.conversation._id}`,
      );
    else {
      setError(result.error || "Unable to open discussion");
      setLoading(false);
    }
  };
  return (
    <div className="inline-flex flex-col items-end">
      <Button
        type="button"
        variant={variant}
        onClick={open}
        disabled={loading || !entityId}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
      </Button>
      {error && <span className="mt-1 text-[10px] text-rose-600">{error}</span>}
    </div>
  );
}
