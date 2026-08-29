"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import { socialPostsApi } from "@/lib/api";
import SocialPostStudio from "@/components/social-posts/SocialPostStudio";
import JsonImportPanel from "@/components/social-posts/JsonImportPanel";
import SocialMediaTabs from "@/components/social-posts/SocialMediaTabs";
import { AdminEmptyState, AdminPage, AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, FileJson2, PenLine, Sparkles, AlertCircle } from "lucide-react";

export default function EditSocialPostPage({ params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const returnTo = getModuleBackUrl("/social-posts", searchParams.get("returnTo"));
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("editor");
  const [editorKey, setEditorKey] = useState(0);

  const openImportedPost = (importedData) => {
    setPost(current => ({
      ...current,
      ...importedData,
      _id: current._id,
      course: current.course,
      category: current.category,
    }));
    setMode("editor");
    setEditorKey(k => k + 1);
  };

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
              <Link href={returnTo}>Return to Social Posts</Link>
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
          <LogoLoader className="h-6 w-6  text-blue-600"  />
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
            href={returnTo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to social posts
          </Link>
        }
        actions={
          <>
            {mode === "editor" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("import")}
                className="rounded-xl font-semibold"
              >
                <FileJson2 className="mr-1.5 h-4 w-4" />
                Import JSON
              </Button>
            )}
            <SocialMediaTabs />
          </>
        }
      />

      {/* Update Method Segmented Tab Switcher */}
      <div className="space-y-2.5 mb-6">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            Update Method
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Current mode:{" "}
            <strong className="text-zinc-900 dark:text-white capitalize">
              {mode === "import" ? "AI JSON Import" : "Manual Studio Editor"}
            </strong>
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Tab 1: AI JSON Import */}
          <button
            type="button"
            onClick={() => setMode("import")}
            className={`admin-surface group flex items-start gap-4 p-4.5 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all cursor-pointer ${
              mode === "import"
                ? "border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-500 shadow-sm"
                : "border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 opacity-75 hover:opacity-100"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                mode === "import"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <Sparkles className="h-5.5 w-5.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-outfit text-base font-bold text-zinc-950 dark:text-white">
                    Update with AI JSON
                  </span>
                </div>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    mode === "import"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-300 dark:border-zinc-700 bg-transparent"
                  }`}
                >
                  {mode === "import" && <Check className="h-3 w-3 stroke-3" />}
                </span>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                Paste JSON to overwrite slides and content. Unsaved changes will be replaced.
              </p>
            </div>
          </button>

          {/* Tab 2: Manual Editor */}
          <button
            type="button"
            onClick={() => setMode("editor")}
            className={`admin-surface group flex items-start gap-4 p-4.5 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all cursor-pointer ${
              mode === "editor"
                ? "border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-500 shadow-sm"
                : "border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 opacity-75 hover:opacity-100"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                mode === "editor"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <PenLine className="h-5.5 w-5.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-outfit text-base font-bold text-zinc-950 dark:text-white">
                  Manual Editor
                </span>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    mode === "editor"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-300 dark:border-zinc-700 bg-transparent"
                  }`}
                >
                  {mode === "editor" && <Check className="h-3 w-3 stroke-3" />}
                </span>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                Use the Social Studio to manually edit the post's slides, layout, and settings.
              </p>
            </div>
          </button>
        </div>
      </div>

      {mode === "import" && <JsonImportPanel onImport={openImportedPost} existingPost={post} />}

      {mode === "editor" && (
        <SocialPostStudio key={`${post._id}-${editorKey}`} postId={post._id} initialPost={post} />
      )}
    </AdminPage>
  );
}

