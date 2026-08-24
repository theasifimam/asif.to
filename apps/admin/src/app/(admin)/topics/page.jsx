"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  ExternalLink,
  FilePlus2,
  Filter,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import {
  AdminContent,
  AdminFilters,
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import { coursesApi, topicsApi, topicCategoriesApi } from "@/lib/api";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { listingReturnTo, useUrlFilters } from "@/hooks/useUrlFilters";
import { Skeleton } from "@/components/ui";

function TopicCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 min-h-45">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Skeleton className="h-6 w-8 rounded-lg" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
        </div>
        <Skeleton className="h-4 w-36 rounded-md" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function TopicRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="mt-1.5 h-3 w-32 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-14 rounded-full" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-4 w-16 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4.5">
        <Skeleton className="h-5 w-12 rounded-md" />
      </td>
      <td className="px-6 py-4.5">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </td>
    </tr>
  );
}

const statusStyles = {
  published:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

export default function TopicsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = listingReturnTo(pathname, searchParams);
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useUrlFilters({
    search: "",
    course: "all",
    category: "all",
    type: "all",
    status: "all",
    page: 1,
    view: "table",
  });
  const editHref = (id) =>
    `/topics/${id}/edit?returnTo=${encodeURIComponent(returnTo)}`;
  const viewMode = filters.view || "table";
  const setViewMode = (v) => setFilters((current) => ({ ...current, view: v }));
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const canReorder =
    filters.course !== "all" &&
    filters.category === "all" &&
    !filters.search &&
    filters.type === "all" &&
    filters.status === "all";

  const load = async () => {
    setLoading(true);
    const topicParams = {
      page: filters.page,
      limit: canReorder ? 100 : limit,
    };
    if (filters.search.trim()) topicParams.search = filters.search.trim();
    if (filters.course !== "all") topicParams.course = filters.course;
    if (filters.category !== "all") topicParams.category = filters.category;
    if (filters.type !== "all") topicParams.type = filters.type;
    if (filters.status !== "all") topicParams.status = filters.status;
    const [topicResponse, courseResponse, categoryResponse] = await Promise.all([
      topicsApi.list(topicParams),
      courses.length ? Promise.resolve(null) : coursesApi.listAll(),
      categories.length ? Promise.resolve(null) : topicCategoriesApi.list("all"),
    ]);
    if (topicResponse.success) {
      const payload = topicResponse.data?.data;
      setTopics(Array.isArray(payload) ? payload : []);
      setPagination(
        topicResponse.data?.pagination || { page: 1, pages: 1, total: 0 },
      );
    } else toast.error(topicResponse.error || "Unable to load topics");
    if (courseResponse?.success)
      setCourses(
        courseResponse.data?.data?.data || courseResponse.data?.data || [],
      );
    if (categoryResponse?.success)
      setCategories(
        categoryResponse.data?.data?.data || categoryResponse.data?.data || [],
      );
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(load, filters.search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [
    filters.search,
    filters.course,
    filters.category,
    filters.type,
    filters.status,
    filters.page,
  ]);

  const toggleStatus = async (topic) => {
    const nextStatus = topic.status === "published" ? "draft" : "published";
    const response = await topicsApi.setStatus(topic._id, nextStatus);
    if (response.success) {
      toast.success(
        nextStatus === "published" ? "Topic published" : "Topic unpublished",
      );
      setTopics((current) =>
        current.map((item) =>
          item._id === topic._id ? { ...item, status: nextStatus } : item,
        ),
      );
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
    if (!deleteTarget) return;
    setDeleting(true);
    const response = await topicsApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Topic deleted");
      setTopics((current) =>
        current.filter((item) => item._id !== deleteTarget._id),
      );
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      setDeleteTarget(null);
    } else toast.error(response.error || "Unable to delete topic");
    setDeleting(false);
  };

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Content / Topics"
        title="Course topics"
        description="Build search-ready topic pages beneath each course."
        actions={
          <>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button variant="outline" asChild>
              <Link href="/categories">
                <Filter className="mr-2 h-4 w-4" /> Categories
              </Link>
            </Button>
            <Button asChild>
              <Link
                href={`/topics/new?returnTo=${encodeURIComponent(returnTo)}`}
              >
                <Plus className="mr-2 h-4 w-4" /> New topic
              </Link>
            </Button>
          </>
        }
      />

      <AdminFilters>
        <AdminSearch
          value={filters.search}
          onChange={(search) =>
            setFilters((current) => ({
              ...current,
              search,
              page: 1,
            }))
          }
          placeholder="Search title or slug"
        />
        <Select
          value={filters.course}
          onValueChange={(course) =>
            setFilters((current) => {
              const currentCat = categories.find((c) => c._id === current.category);
              const catCourseId = currentCat?.course?._id || currentCat?.course;
              const keepCat =
                course === "all" ||
                !catCourseId ||
                String(catCourseId) === String(course);
              return {
                ...current,
                course,
                category: keepCat ? current.category : "all",
                page: 1,
              };
            })
          }
        >
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-56">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.category}
          onValueChange={(category) =>
            setFilters((current) => {
              if (category === "all") {
                return { ...current, category, page: 1 };
              }
              const selectedCat = categories.find((c) => c._id === category);
              const catCourseId = selectedCat?.course?._id || selectedCat?.course;
              return {
                ...current,
                category,
                course: catCourseId ? String(catCourseId) : current.course,
                page: 1,
              };
            })
          }
        >
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b] max-h-80">
            <SelectItem value="all">All categories</SelectItem>
            {(filters.course !== "all"
              ? categories.filter((c) => {
                  const catCourseId = c.course?._id || c.course;
                  return (
                    !catCourseId ||
                    String(catCourseId) === String(filters.course)
                  );
                })
              : categories
            ).map((cat) => {
              const courseTitle =
                cat.course?.title ||
                courses.find((c) => String(c._id) === String(cat.course))
                  ?.title;
              return (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}{" "}
                  {filters.course === "all" && courseTitle && (
                    <span className="text-zinc-400 font-normal">
                      ({courseTitle})
                    </span>
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={filters.type}
          onValueChange={(type) =>
            setFilters((current) => ({ ...current, type, page: 1 }))
          }
        >
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-44">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="concept">Concept</SelectItem>
            <SelectItem value="guide">Guide</SelectItem>
            <SelectItem value="faq">FAQ</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(status) =>
            setFilters((current) => ({ ...current, status, page: 1 }))
          }
        >
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilters>

      {filters.course !== "all" && !canReorder && (
        <p className="text-xs text-zinc-500">
          Clear search, category, type, and status filters to reorder this course&apos;s
          topics.
        </p>
      )}

      <AdminContent plain={viewMode === "card"}>
        {viewMode === "card" ? (
          <div className="space-y-6">
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TopicCardSkeleton key={i} />
                ))
              ) : topics.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
                  <FilePlus2 className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                  <p className="text-sm font-medium">
                    No topics match these filters.
                  </p>
                </div>
              ) : (
                topics.map((topic, index) => (
                  <div
                    key={topic._id}
                    className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400">
                            #{topic.order}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            {topic.type || "article"}
                          </span>
                          {topic.category?.name && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              {topic.category.name}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleStatus(topic)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[topic.status]}`}
                        >
                          {topic.status}
                        </button>
                      </div>

                      <div>
                        <Link
                          href={editHref(topic._id)}
                          className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-2"
                        >
                          {topic.title}
                        </Link>
                        <p className="mt-1 text-xs text-zinc-400 truncate">
                          /{topic.slug}
                        </p>
                      </div>

                      {topic.course?.title && (
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          Course: {topic.course.title}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1">
                        {canReorder && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              title="Move up"
                              disabled={reordering || index === 0}
                              onClick={() => moveTopic(index, -1)}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              title="Move down"
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

                      <div className="flex items-center gap-1 shrink-0">
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
                              className="h-8 w-8 rounded-lg"
                              title="Open public topic"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={editHref(topic._id)}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            title="Edit topic"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete topic"
                          onClick={() => setDeleteTarget(topic)}
                          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {!loading && topics.length > 0 && (
              <AdminPagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total || 0}
                limit={limit}
                itemLabel="topics"
                onPageChange={(page) =>
                  setFilters((current) => ({ ...current, page }))
                }
                onLimitChange={(l) => {
                  setLimit(l);
                  setFilters((c) => ({ ...c, page: 1 }));
                }}
              />
            )}
          </div>
        ) : (
          <div className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table w-full min-w-190 text-left text-sm">
                <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                  <tr>
                    <th className="px-6 py-4.5">Topic</th>
                    <th className="px-6 py-4.5">Type</th>
                    <th className="px-6 py-4.5">Course</th>
                    <th className="px-6 py-4.5">Category</th>
                    <th className="px-6 py-4.5">Status</th>
                    <th className="px-6 py-4.5">Order</th>
                    <th className="px-6 py-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {loading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <TopicRowSkeleton key={i} />
                    ))
                  ) : topics.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                          <FilePlus2 className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                          <p className="text-sm font-medium">
                            No topics match these filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    topics.map((topic, index) => (
                      <tr
                        key={topic._id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-6 py-4.5">
                          <Link
                            href={editHref(topic._id)}
                            className="font-bold font-outfit text-zinc-950 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                          >
                            {topic.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-zinc-400 truncate">
                            /{topic.slug}
                          </p>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-300">
                            {topic.type || "article"}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20">
                            {topic.course?.title || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          {topic.category?.name || "-"}
                        </td>
                        <td className="px-6 py-4.5">
                          <button
                            onClick={() => toggleStatus(topic)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all ${statusStyles[topic.status]}`}
                          >
                            {topic.status}
                          </button>
                        </td>
                        <td className="px-6 py-4.5 text-zinc-600 dark:text-zinc-300">
                          <div className="flex items-center gap-1">
                            <span className="w-7 text-center font-black text-xs text-zinc-400">
                              #{topic.order}
                            </span>
                            {canReorder && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  title="Move topic up"
                                  disabled={reordering || index === 0}
                                  onClick={() => moveTopic(index, -1)}
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  title="Move topic down"
                                  disabled={
                                    reordering || index === topics.length - 1
                                  }
                                  onClick={() => moveTopic(index, 1)}
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex justify-end gap-1">
                            <Link href={editHref(topic._id)}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                title="Edit topic"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </Link>
                            {topic.status === "published" &&
                              topic.course?.slug && (
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
                                    className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="h-4 w-4 text-rose-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && topics.length > 0 && (
              <AdminPagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total || 0}
                limit={limit}
                itemLabel="topics"
                onPageChange={(page) =>
                  setFilters((current) => ({ ...current, page }))
                }
                onLimitChange={(l) => {
                  setLimit(l);
                  setFilters((c) => ({ ...c, page: 1 }));
                }}
              />
            )}
          </div>
        )}
      </AdminContent>

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
    </AdminPage>
  );
}
