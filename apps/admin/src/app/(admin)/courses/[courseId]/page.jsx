"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { coursesApi, chaptersApi } from "@/lib/api";
import Editor from "@/components/Editor";
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2,
  CheckCircle, XCircle, BookOpen, Clock, Save, X, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CHAPTER_FORM = {
  title: "",
  summary: "",
  contentBody: "",
  tryItChallenge: "",
  order: 0,
  status: "published",
};

export default function CourseEditorPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCourse, setEditCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({});
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [chapterForm, setChapterForm] = useState(DEFAULT_CHAPTER_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingChapter, setDeletingChapter] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await coursesApi.getById(courseId);
    if (res.success) {
      const data = res.data?.data;
      setCourse(data);
      setCourseForm({
        title: data.title,
        subtitle: data.subtitle,
        techId: data.techId,
        level: data.level,
        duration: data.duration,
        order: data.order,
        status: data.status,
        learningOutcomes: (data.learningOutcomes || []).join("\n"),
      });
      setChapters(data.chapters || []);
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    const updateData = {
      ...courseForm,
      learningOutcomes: courseForm.learningOutcomes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await coursesApi.update(courseId, updateData);
    if (res.success) {
      toast.success("Course updated!");
      setCourse(res.data?.data);
      setEditCourse(false);
    } else {
      toast.error(res.error || "Failed to update course");
    }
    setSaving(false);
  };

  const openAddChapter = () => {
    setEditingChapterId(null);
    setChapterForm(DEFAULT_CHAPTER_FORM);
    setShowChapterModal(true);
  };

  const openEditChapter = (ch) => {
    setEditingChapterId(ch._id);
    
    // Combine array content or codeSnippets into one unified markdown string for the Editor
    let combinedContent = Array.isArray(ch.content) ? ch.content.join("\n\n") : (ch.content || "");
    if (Array.isArray(ch.codeSnippets) && ch.codeSnippets.length > 0) {
      const snippetsMd = ch.codeSnippets.map((s) => `\`\`\`${s.language || "javascript"}\n// ${s.title || "Code Snippet"}\n${s.code}\n\`\`\``).join("\n\n");
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
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Store content body directly as single content string/array
    const data = {
      title: chapterForm.title,
      summary: chapterForm.summary,
      content: [chapterForm.contentBody],
      tryItChallenge: chapterForm.tryItChallenge,
      order: chapterForm.order,
      status: chapterForm.status,
    };

    const res = editingChapterId
      ? await chaptersApi.update(editingChapterId, data)
      : await chaptersApi.create(courseId, data);

    if (res.success) {
      toast.success(editingChapterId ? "Chapter updated!" : "Chapter created!");
      setShowChapterModal(false);
      setEditingChapterId(null);
      setChapterForm(DEFAULT_CHAPTER_FORM);
      load();
    } else {
      toast.error(res.error || "Failed to save chapter");
    }
    setSaving(false);
  };

  const handleDeleteChapter = async (id) => {
    if (!confirm("Delete this chapter? This cannot be undone.")) return;
    setDeletingChapter(id);
    const res = await chaptersApi.delete(id);
    if (res.success) {
      toast.success("Chapter deleted.");
      setChapters((prev) => prev.filter((c) => c._id !== id));
    } else {
      toast.error(res.error || "Failed to delete chapter");
    }
    setDeletingChapter(null);
  };

  const handleToggleChapterStatus = async (ch) => {
    const newStatus = ch.status === "published" ? "draft" : "published";
    const res = await chaptersApi.update(ch._id, { status: newStatus });
    if (res.success) {
      setChapters((prev) =>
        prev.map((c) => (c._id === ch._id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Chapter ${newStatus}`);
    }
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
          href="/courses"
          className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-foreground">{course?.title}</h1>
          <p className="text-xs text-muted-foreground">
            {course?.techId} · {course?.level} · {course?.duration}
          </p>
        </div>
      </div>

      {/* Course Metadata Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
            Course Details
          </h2>
          <button
            onClick={() => setEditCourse(!editCourse)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {editCourse ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </button>
        </div>

        {editCourse ? (
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Title</label>
              <input
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
                value={courseForm.title || ""}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Subtitle</label>
              <textarea
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
                value={courseForm.subtitle || ""}
                onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Duration</label>
                <input
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                  value={courseForm.duration || ""}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Status</label>
                <select
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                  value={courseForm.status}
                  onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">
                Learning Outcomes (one per line)
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
                value={courseForm.learningOutcomes || ""}
                onChange={(e) => setCourseForm({ ...courseForm, learningOutcomes: e.target.value })}
                placeholder="Write JSX and build reusable components&#10;Manage state with useState..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditCourse(false)}
                className="px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-sm font-bold hover:bg-zinc-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1 text-sm text-foreground">
            <p className="text-muted-foreground">{course?.subtitle}</p>
            <div className="flex gap-3 text-xs text-muted-foreground font-medium pt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course?.duration}
              </span>
              <span
                className={`font-bold ${
                  course?.status === "published" ? "text-emerald-600" : "text-amber-500"
                }`}
              >
                {course?.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chapters Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Chapters ({chapters.length})
          </h2>
          <button
            onClick={openAddChapter}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Chapter
          </button>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-sm">No chapters yet. Add your first chapter!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chapters.map((ch, idx) => (
              <div
                key={ch._id}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground line-clamp-1">{ch.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{ch.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleChapterStatus(ch)}
                    className={`text-xs font-bold ${
                      ch.status === "published" ? "text-emerald-600" : "text-amber-500"
                    }`}
                  >
                    {ch.status === "published" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditChapter(ch)}
                    className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteChapter(ch._id)}
                    disabled={deletingChapter === ch._id}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    {deletingChapter === ch._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Chapter Modal with FULL RICH TEXT EDITOR */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">
                {editingChapterId ? "Edit Chapter" : "Add New Chapter"}
              </h2>
              <button
                onClick={() => setShowChapterModal(false)}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
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
                  onChange={(e) => setChapterForm({ ...chapterForm, summary: e.target.value })}
                  placeholder="One-sentence overview of this chapter..."
                />
              </div>

              {/* Unified Full Rich Text & Markdown Editor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Chapter Content & Code Editor *</span>
                  <span className="text-[11px] text-blue-500 font-normal">Live Visual & Markdown Editor with Toolbar Buttons</span>
                </label>
                
                <Editor
                  value={chapterForm.contentBody}
                  onChange={(val) => setChapterForm({ ...chapterForm, contentBody: val })}
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
                    setChapterForm({ ...chapterForm, tryItChallenge: e.target.value })
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
                      setChapterForm({ ...chapterForm, order: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 flex-1 justify-center py-3 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingChapterId ? "Save Chapter Changes" : "Create Chapter"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="flex-1 py-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-sm font-bold hover:bg-zinc-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
