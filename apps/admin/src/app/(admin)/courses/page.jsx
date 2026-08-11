"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { coursesApi } from "@/lib/api";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TECH_COLORS = {
  reactjs: "bg-cyan-500/10 text-cyan-600",
  nextjs: "bg-zinc-800 text-white",
  nodejs: "bg-emerald-500/10 text-emerald-600",
  expressjs: "bg-zinc-700 text-white",
  mongodb: "bg-teal-500/10 text-teal-600",
  tailwindcss: "bg-sky-500/10 text-sky-600",
  javascript: "bg-yellow-500/10 text-yellow-700",
};

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    techId: "",
    level: "Beginner - Advanced",
    duration: "Self-paced",
    order: 0,
    status: "published",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await coursesApi.listAll();
    if (res.success) setCourses(res.data?.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await coursesApi.create(form);
    if (res.success) {
      toast.success("Course created!");
      setShowCreate(false);
      setForm({
        title: "",
        subtitle: "",
        slug: "",
        techId: "",
        level: "Beginner - Advanced",
        duration: "Self-paced",
        order: 0,
        status: "published",
      });
      load();
    } else {
      toast.error(res.error || "Failed to create course");
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    const res = await coursesApi.delete(id);
    if (res.success) {
      toast.success("Course deleted.");
      setCourses((prev) => prev.filter((c) => c._id !== id));
      setShowDeleteModal(null);
    } else {
      toast.error(res.error || "Failed to delete course");
    }
    setDeleting(null);
  };

  const handleToggleStatus = async (course) => {
    const newStatus = course.status === "published" ? "draft" : "published";
    const res = await coursesApi.update(course._id, { status: newStatus });
    if (res.success) {
      toast.success(
        `Course ${newStatus === "published" ? "published" : "set to draft"}`,
      );
      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, status: newStatus } : c,
        ),
      );
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const filtered = courses.filter(
    (c) =>
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.techId?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Course Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage your coding courses, chapters, and syllabus.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-xs shadow-blue-500/20 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border-0 shadow-xs text-sm font-medium text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Create Course Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-md space-y-5">
            <h2 className="text-xl font-black text-foreground">
              Create New Course
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Course Title *
                </label>
                <input
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. React.js Complete Course: Zero to Mastery"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  URL Slug (SEO)
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.slug || ""}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. javascript-complete-guide (optional)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Subtitle *
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                  placeholder="Short course description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tech ID *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.techId}
                    onChange={(e) =>
                      setForm({ ...form, techId: e.target.value })
                    }
                  >
                    <option value="">Select tech...</option>
                    {[
                      "reactjs",
                      "nextjs",
                      "nodejs",
                      "expressjs",
                      "mongodb",
                      "tailwindcss",
                      "javascript",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Level
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Duration
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Display Order
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  Create Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-sm font-bold hover:bg-zinc-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No courses found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {filtered.map((course, index) => (
            <div
              key={course._id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                index === 0 ? "rounded-t-[2.5rem]" : ""
              } ${index === filtered.length - 1 ? "rounded-b-[2.5rem]" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider shrink-0 ${TECH_COLORS[course.techId] || "bg-zinc-100 text-zinc-600"}`}
                >
                  {course.techId}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-extrabold text-base text-foreground line-clamp-1">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      /{course.slug || course.techId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" /> {course.chapterCount || 0}{" "}
                      Chapters
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(course)}
                      className={`flex items-center gap-1 font-bold transition-colors ${course.status === "published" ? "text-emerald-600" : "text-amber-500"}`}
                    >
                      {course.status === "published" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {course.status}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Link
                  href={`/courses/${course._id}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-xs shadow-blue-500/20"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Manage
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setShowDeleteModal(course)}
                  disabled={deleting === course._id}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  {deleting === course._id ? (
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

      {/* Delete Confirmation Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <Dialog
            open={!!showDeleteModal}
            onOpenChange={(open) =>
              !open && !deleting && setShowDeleteModal(null)
            }
          >
            <DialogContent className="max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-4xl gap-6 z-9999">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
                  Delete Course?
                </DialogTitle>
                <DialogDescription className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm leading-relaxed text-left">
                  Are you sure you want to delete{" "}
                  <strong className="text-zinc-900 dark:text-white">
                    {showDeleteModal?.title}
                  </strong>
                  ? This will permanently delete the course and{" "}
                  <strong className="text-zinc-900 dark:text-white">
                    ALL of its associated chapters
                  </strong>
                  . This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                  disabled={deleting === showDeleteModal?._id}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal?._id)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2 shadow-md shadow-red-500/20"
                  disabled={deleting === showDeleteModal?._id}
                >
                  {deleting === showDeleteModal?._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Course
                    </>
                  )}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>,
          document.body,
        )}
    </div>
  );
}
