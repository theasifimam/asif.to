"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  FilePlus2,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { coursesApi, topicsApi } from "@/lib/api";

const statusStyles = {
  published:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    course: "all",
    type: "all",
    status: "all",
    page: 1,
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const canReorder =
    filters.course !== "all" &&
    !filters.search &&
    filters.type === "all" &&
    filters.status === "all";

  const load = async () => {
    setLoading(true);
    const [topicResponse, courseResponse] = await Promise.all([
      topicsApi.list({
        ...filters,
        course: filters.course === "all" ? "" : filters.course,
        type: filters.type === "all" ? "" : filters.type,
        status: filters.status === "all" ? "" : filters.status,
        limit: canReorder ? 100 : 20,
      }),
      courses.length ? Promise.resolve(null) : coursesApi.listAll(),
    ]);
    if (topicResponse.success) {
      const payload = topicResponse.data?.data || {};
      setTopics(Array.isArray(payload) ? payload : payload.data || []);
      setPagination(
        topicResponse.data?.pagination || { page: 1, pages: 1, total: 0 },
      );
    } else toast.error(topicResponse.error || "Unable to load topics");
    if (courseResponse?.success)
      setCourses(
        courseResponse.data?.data?.data || courseResponse.data?.data || [],
      );
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(load, filters.search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [
    filters.search,
    filters.course,
    filters.type,
    filters.status,
    filters.page,
  ]);

  const toggleStatus = async (topic) => {
    const response = await topicsApi.setStatus(
      topic._id,
      topic.status === "published" ? "draft" : "published",
    );
    if (response.success) {
      toast.success(
        topic.status === "published" ? "Topic unpublished" : "Topic published",
      );
      load();
    } else toast.error(response.error || "Unable to update status");
  };

  const moveTopic = async (index, direction) => {
    const targetIndex = index + direction;
    if (!canReorder || targetIndex < 0 || targetIndex >= topics.length) return;

    const nextTopics = [...topics];
    const current = nextTopics[index];
    const target = nextTopics[targetIndex];
    const currentOrder = Number(current.order) || index;
    const targetOrder = Number(target.order) || targetIndex;
    nextTopics[index] = { ...target, order: currentOrder };
    nextTopics[targetIndex] = { ...current, order: targetOrder };
    setTopics(nextTopics);
    setReordering(true);

    const response = await topicsApi.reorder(
      filters.course,
      nextTopics.map((topic, order) => ({ id: topic._id, order })),
    );
    if (response.success) toast.success("Topic order updated");
    else {
      toast.error(response.error || "Unable to update topic order");
      await load();
    }
    setReordering(false);
  };

  const deleteTopic = async () => {
    setDeleting(true);
    const response = await topicsApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Topic deleted");
      setDeleteTarget(null);
      load();
    } else toast.error(response.error || "Unable to delete topic");
    setDeleting(false);
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Content / Topics
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Course topics
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Build search-ready topic pages beneath each course.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/categories">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Categories
            </Button>
          </Link>
          <Link href="/topics/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New topic
            </Button>
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
                page: 1,
              }))
            }
            placeholder="Search title or slug"
            className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900"
          />
        </div>
        <Select
          value={filters.course}
          onValueChange={(course) =>
            setFilters((current) => ({ ...current, course, page: 1 }))
          }
        >
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-56">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.type}
          onValueChange={(type) =>
            setFilters((current) => ({ ...current, type, page: 1 }))
          }
        >
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="interview">Interviews</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(status) =>
            setFilters((current) => ({ ...current, status, page: 1 }))
          }
        >
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-40">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {filters.course !== "all" && !canReorder && (
        <p className="text-xs text-zinc-500">
          Clear search, type, and status filters to reorder this course's
          topics.
        </p>
      )}

      <section className="overflow-hidden rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="border-b border-zinc-200/60 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-900/60">
              <tr>
                <th className="px-5 py-3">Topic</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-16 text-center text-zinc-500"
                  >
                    <FilePlus2 className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                    No topics match these filters.
                  </td>
                </tr>
              ) : (
                topics.map((topic, index) => (
                  <tr
                    key={topic._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {topic.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        /{topic.slug}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold capitalize text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                        {topic.type || "article"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                      {topic.course?.title || "-"}
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                      {topic.category?.name || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(topic)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[topic.status]}`}
                      >
                        {topic.status}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center gap-1">
                        <span className="w-7 text-center tabular-nums">
                          {topic.order}
                        </span>
                        {canReorder && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Move topic up"
                              disabled={reordering || index === 0}
                              onClick={() => moveTopic(index, -1)}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Move topic down"
                              disabled={
                                reordering || index === topics.length - 1
                              }
                              onClick={() => moveTopic(index, 1)}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link href={`/topics/${topic._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit topic"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        {topic.status === "published" && topic.course?.slug && (
                          <Link
                            href={`https://asif.to/${[
                              topic.course.slug,
                              topic.type === "interview"
                                ? topic.category?.slug
                                : null,
                              topic.slug,
                            ]
                              .filter(Boolean)
                              .map(encodeURIComponent)
                              .join("/")}`}
                            target="_blank"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Open public topic"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete topic"
                          onClick={() => setDeleteTarget(topic)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-zinc-200/60 px-5 py-4 text-sm text-zinc-500 dark:border-zinc-800/60">
          <span>{pagination.total || 0} topics</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page <= 1}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              {pagination.page || 1} / {pagination.pages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      </section>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteTopic}
        loading={deleting}
        title="Delete topic?"
        description={`This permanently removes ${deleteTarget?.title || "this topic"} from the course.`}
        confirmText="Delete"
        variant="destructive"
      />
    </main>
  );
}
