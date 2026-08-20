"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Image, Plus, Search, Trash2 } from "lucide-react";
import { socialPostsApi } from "@/lib/api";
import { AdminPagination } from "@/components/admin";
import SocialMediaTabs from "@/components/social-posts/SocialMediaTabs";

export default function SocialPostsPage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const load = async () => {
    setLoading(true);

    try {
      const result = await socialPostsApi.list(search ? { search } : {});

      if (result?.success) {
        const data = result?.data?.data;

        setPosts(Array.isArray(data) ? data : []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Failed to load social posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [search]);

  const pages = Math.max(Math.ceil(posts.length / limit), 1);
  const visible = useMemo(
    () => posts.slice((page - 1) * limit, page * limit),
    [posts, page, limit],
  );

  const duplicate = async (id) => {
    const result = await socialPostsApi.duplicate(id);
    if (result?.success) load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this social post?")) return;
    const result = await socialPostsApi.delete(id);
    if (result?.success) load();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Social Media</h1>
          <p className="text-sm text-muted-foreground">
            Create, manage and publish branded social content.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2"><SocialMediaTabs /><Link
          href="/social-posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus size={16} />
          New post
        </Link></div>
      </div>

      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm"
          placeholder="Search social posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <Image className="mx-auto mb-3 text-muted-foreground" />
          <div className="font-semibold">No social posts yet</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first branded post or carousel.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((post) => (
              <div key={post._id} className="rounded-2xl border bg-card p-4">
                <Link href={`/social-posts/${post._id}`} className="block">
                  <div className="mb-4 aspect-square rounded-xl bg-zinc-950 p-5 text-white">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      {post.category || "asif.to"}
                    </div>
                    <div className="mt-8 text-2xl font-black">{post.name}</div>
                    <div className="mt-2 text-sm text-zinc-400">
                      {post.slideCount || 0} slide
                      {(post.slideCount || 0) === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="font-semibold">{post.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {post.platform} · {post.format} · {post.status}
                  </div>
                </Link>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => duplicate(post._id)}
                    className="rounded-lg border p-2"
                    title="Duplicate"
                  >
                    <Copy size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(post._id)}
                    className="rounded-lg border p-2 text-destructive"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <AdminPagination
            page={page}
            pages={pages}
            total={posts.length}
            limit={limit}
            itemLabel="posts"
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        </div>
      )}
    </div>
  );
}

