"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function JobSort({
  currentSort = "newest",
  searchParams = {},
  path = "/jobs",
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSortChange = (newSort) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "sort" && key !== "page") {
        query.set(key, value);
      }
    }
    if (newSort && newSort !== "newest") {
      query.set("sort", newSort);
    }
    const url = `${path}${query.size ? `?${query.toString()}` : ""}`;
    startTransition(() => {
      router.push(url);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="text-[11px] font-bold text-zinc-400">Sort</Label>
      <div className="w-36">
        <Select
          value={currentSort || "newest"}
          onValueChange={handleSortChange}
          disabled={isPending}
        >
          <SelectTrigger
            size="sm"
            className="h-8 rounded-full border border-zinc-200/90 bg-white px-3 text-xs font-semibold text-zinc-800 shadow-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-36 rounded-2xl">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="relevant">Most relevant</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
