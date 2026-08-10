"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { coursesApi, chaptersApi } from "@/lib/api";
import Editor from "@/components/Editor";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  BookOpen,
  Clock,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";



export default function CourseEditorPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCourse, setEditCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({});

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
        prev.map((c) => (c._id === ch._id ? { ...c, status: newStatus } : c)),
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
          <h1 className="text-xl font-black text-foreground">
            {course?.title}
          </h1>
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
            {editCourse ? (
              <X className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </button>
        </div>

        {editCourse ? (
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">
                Title
              </label>
              <input
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
                value={courseForm.title || ""}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">
                Subtitle
              </label>
              <textarea
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
                value={courseForm.subtitle || ""}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, subtitle: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">
                  Duration
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                  value={courseForm.duration || ""}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, duration: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                  value={courseForm.status}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, status: e.target.value })
                  }
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
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    learningOutcomes: e.target.value,
                  })
                }
                placeholder="Write JSX and build reusable components&#10;Manage state with useState..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
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
                  course?.status === "published"
                    ? "text-emerald-600"
                    : "text-amber-500"
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
          <Link
            href={`/courses/${courseId}/chapters/new`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </Link>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80">
            <p className="text-sm">No chapters yet. Add your first chapter!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {chapters.map((ch, idx) => (
              <div
                key={ch._id}
                className={`flex items-center justify-between gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                  idx === 0 ? "rounded-t-[2.5rem]" : ""
                } ${idx === chapters.length - 1 ? "rounded-b-[2.5rem]" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground line-clamp-1">
                      {ch.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {ch.summary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleChapterStatus(ch)}
                    className={`text-xs font-bold ${
                      ch.status === "published"
                        ? "text-emerald-600"
                        : "text-amber-500"
                    }`}
                  >
                    {ch.status === "published" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </button>
                  <Link
                    href={`/courses/${courseId}/chapters/${ch._id}`}
                    className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500 transition-colors inline-flex items-center justify-center"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
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


    </div>
  );
}
