"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import { Check, ChevronLeft, FileJson2, PenLine, Sparkles } from "lucide-react";
import SocialPostStudio from "@/components/social-posts/SocialPostStudio";
import JsonImportPanel from "@/components/social-posts/JsonImportPanel";
import SocialMediaTabs from "@/components/social-posts/SocialMediaTabs";
import { EMPTY_POST } from "@/components/social-posts/hooks/useSocialPost";
import { AdminPage, AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";

export default function NewSocialPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getModuleBackUrl(
    "/social-posts",
    searchParams.get("returnTo"),
  );
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

  const isManualActive = mode === "editor" && !importedPost;

  return (
    <AdminPage size="xl">
      <AdminPageHeader
        eyebrow="Social Media / Create"
        title="Create Social Post"
        description="Select a creation method below: import AI-generated JSON or build the post manually in the studio."
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

      {/* Creation Method Segmented Tab Switcher */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            Creation Method
          </span>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Current mode:{" "}
            <strong className="text-zinc-900 dark:text-white capitalize">
              {mode === "import"
                ? "AI JSON Import"
                : importedPost
                  ? "Imported JSON Editor"
                  : "Manual Studio Editor"}
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
                    Create with AI JSON
                  </span>
                  <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    Recommended
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
                Copy a sample format, generate post JSON with ChatGPT/AI, and
                paste to import.
              </p>
            </div>
          </button>

          {/* Tab 2: Manual Editor */}
          <button
            type="button"
            onClick={openManualEditor}
            className={`admin-surface group flex items-start gap-4 p-4.5 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all cursor-pointer ${
              isManualActive
                ? "border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-500 shadow-sm"
                : "border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 opacity-75 hover:opacity-100"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                isManualActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <PenLine className="h-5.5 w-5.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-outfit text-base font-bold text-zinc-950 dark:text-white">
                  Create Manually
                </span>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isManualActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-300 dark:border-zinc-700 bg-transparent"
                  }`}
                >
                  {isManualActive && <Check className="h-3 w-3 stroke-3" />}
                </span>
              </div>

              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                Open the Social Studio directly to manually write post copy and
                design slides.
              </p>
            </div>
          </button>
        </div>
      </div>

      {mode === "import" && <JsonImportPanel onImport={openImportedPost} />}

      {mode === "editor" && (
        <SocialPostStudio
          key={importedPost?.name || "manual-social-post"}
          initialPost={importedPost || EMPTY_POST}
          onCreated={(id) => router.replace(`/social-posts/${id}`)}
        />
      )}
    </AdminPage>
  );
}
