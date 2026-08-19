"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileJson2, PenLine, Sparkles } from "lucide-react";
import SocialPostStudio from "@/components/social-posts/SocialPostStudio";
import JsonImportPanel from "@/components/social-posts/JsonImportPanel";
import { EMPTY_POST } from "@/components/social-posts/hooks/useSocialPost";

export default function NewSocialPostPage() {
  const router = useRouter();
  const [mode, setMode] = useState("import");
  const [importedPost, setImportedPost] = useState(null);

  const openImportedPost = (post) => {
    setImportedPost(post);
    setMode("editor");
  };

  const openManualEditor = () => {
    setImportedPost(null);
    setMode("editor");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/social-posts"
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground dark:border-zinc-800"
            aria-label="Back to social posts"
            title="Back to Social Posts"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">Create Social Post</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Import AI-generated JSON or build the post manually.
            </p>
          </div>
        </div>

        {mode === "editor" && (
          <button
            type="button"
            onClick={() => setMode("import")}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted dark:border-zinc-800"
          >
            <FileJson2 size={15} />
            Import another JSON
          </button>
        )}
      </div>

      {mode !== "editor" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("import")}
            className={`admin-surface p-5 text-left transition ${
              mode === "import"
                ? "border-primary ring-2 ring-primary/10"
                : "hover:bg-muted/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles size={18} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 font-bold">
                  Create with AI JSON
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Recommended
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Choose a sample, ask AI to fill it, paste once, then preview.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={openManualEditor}
            className="admin-surface p-5 text-left transition hover:bg-muted/30"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <PenLine size={18} />
              </div>

              <div>
                <div className="font-bold">Create manually</div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Open the full Studio and enter post and slide content yourself.
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {mode === "import" && (
        <JsonImportPanel onImport={openImportedPost} />
      )}

      {mode === "editor" && (
        <SocialPostStudio
          key={importedPost?.name || "manual-social-post"}
          initialPost={importedPost || EMPTY_POST}
          onCreated={(id) => router.replace(`/social-posts/${id}`)}
        />
      )}
    </div>
  );
}
