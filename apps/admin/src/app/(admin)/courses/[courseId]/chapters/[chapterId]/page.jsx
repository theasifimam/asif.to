"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { coursesApi, chaptersApi } from "@/lib/api";
import Editor from "@/components/Editor";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CHAPTER_FORM = {
  title: "",
  summary: "",
  contentBody: "",
  tryItChallenge: "",
  order: 0,
  status: "published",
};

export default function EditChapterPage() {
  const { courseId, chapterId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chapterForm, setChapterForm] = useState(DEFAULT_CHAPTER_FORM);
  const [course, setCourse] = useState(null);

  const isNew = chapterId === "new";

  const load = useCallback(async () => {
    setLoading(true);
    const res = await coursesApi.getById(courseId);
    if (res.success) {
      const data = res.data?.data;
      setCourse(data);

      if (!isNew) {
        const ch = (data.chapters || []).find((c) => c._id === chapterId);
        if (ch) {
          // Combine array content or codeSnippets into one unified markdown string for the Editor
          let combinedContent = Array.isArray(ch.content)
            ? ch.content.join("\n\n")
            : ch.content || "";
          if (Array.isArray(ch.codeSnippets) && ch.codeSnippets.length > 0) {
            const snippetsMd = ch.codeSnippets
              .map(
                (s) =>
                  `\`\`\`${s.language || "javascript"}\n// ${s.title || "Code Snippet"}\n${s.code}\n\`\`\``,
              )
              .join("\n\n");
            if (snippetsMd && !combinedContent.includes(ch.codeSnippets[0]?.code)) {
              combinedContent += "\n\n" + snippetsMd;
            }
          } else if (ch.codeSnippet && !combinedContent.includes(ch.codeSnippet)) {
            combinedContent += `\n\n\`\`\`${ch.language || "javascript"}\n${ch.codeSnippet}\n\`\`\``;
          }

          setChapterForm({
            title: ch.title || "",
            summary: ch.summary || "",
            contentBody: combinedContent,
            tryItChallenge: ch.tryItChallenge || "",
            order: ch.order ?? 0,
            status: ch.status || "published",
          });
        } else {
          toast.error("Chapter not found");
          router.push(`/courses/${courseId}`);
        }
      } else {
        // Default order for new chapter
        setChapterForm((prev) => ({
          ...prev,
          order: data.chapters?.length || 0,
        }));
      }
    } else {
      toast.error("Course not found");
      router.push("/courses");
    }
    setLoading(false);
  }, [courseId, chapterId, isNew, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      title: chapterForm.title,
      summary: chapterForm.summary,
      content: [chapterForm.contentBody],
      tryItChallenge: chapterForm.tryItChallenge,
      order: chapterForm.order,
      status: chapterForm.status,
    };

    const res = !isNew
      ? await chaptersApi.update(chapterId, data)
      : await chaptersApi.create(courseId, data);

    if (res.success) {
      toast.success(!isNew ? "Chapter updated!" : "Chapter created!");
      router.push(`/courses/${courseId}`);
    } else {
      toast.error(res.error || "Failed to save chapter");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/courses/${courseId}`}
          className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-foreground">
            {isNew ? "Add New Chapter" : "Edit Chapter"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {course?.title}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSaveChapter} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Chapter Title *
            </label>
            <input
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
              value={chapterForm.title}
              onChange={(e) =>
                setChapterForm({ ...chapterForm, title: e.target.value })
              }
              placeholder="e.g. 1. Introduction to React Hooks"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Summary *
            </label>
            <textarea
              required
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
              value={chapterForm.summary}
              onChange={(e) =>
                setChapterForm({ ...chapterForm, summary: e.target.value })
              }
              placeholder="One-sentence overview of this chapter..."
            />
          </div>

          {/* Unified Full Rich Text & Markdown Editor */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Chapter Content & Code Editor *</span>
              <span className="text-[11px] text-blue-500 font-normal">
                Live Visual & Markdown Editor with Toolbar Buttons
              </span>
            </label>

            <Editor
              value={chapterForm.contentBody}
              onChange={(val) =>
                setChapterForm({ ...chapterForm, contentBody: val })
              }
              placeholder="Write your full chapter tutorial here. Use toolbar for H1, H2, Bold, Images, Code blocks..."
            />
          </div>

          {/* Try It Challenge */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Try It Yourself Challenge
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
              value={chapterForm.tryItChallenge}
              onChange={(e) =>
                setChapterForm({
                  ...chapterForm,
                  tryItChallenge: e.target.value,
                })
              }
              placeholder="e.g. Build a component that toggles between light and dark mode..."
            />
          </div>

          {/* Status & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Status
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                value={chapterForm.status}
                onChange={(e) =>
                  setChapterForm({ ...chapterForm, status: e.target.value })
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Display Order
              </label>
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                value={chapterForm.order}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    order: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 flex-1 sm:flex-none sm:w-48 justify-center py-3 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isNew ? "Create Chapter" : "Save Changes"}
            </button>
            <Link
              href={`/courses/${courseId}`}
              className="flex-1 sm:flex-none sm:w-48 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-sm font-bold hover:bg-zinc-200 transition-all text-center flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
