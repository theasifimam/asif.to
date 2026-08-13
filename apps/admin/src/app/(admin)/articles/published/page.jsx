"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { articlesApi } from "@/lib/api";
import { toast } from "sonner";

import ArticleHeader from "./components/ArticleHeader";
import ArticleControls from "./components/ArticleControls";
import ArticleListView from "./components/ArticleListView";
import ArticleCardView from "./components/ArticleCardView";
import ArticleDeleteDialog from "./components/ArticleDeleteDialog";
import { AdminPage } from "@/components/admin";
import ArticleMetrics from "./components/ArticleMetrics";

export default function PublishedPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    invisible: 0,
    views: 0,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'card'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'published' | 'draft'
  const [searchQuery, setSearchQuery] = useState("");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5000${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await articlesApi.list({
        status: statusFilter,
        limit: "100",
      });
      if (res.success && res.data) {
        const data = res.data.data || res.data;
        const listData = Array.isArray(data) ? data : [];
        setArticles(listData);

        const totalViews = listData.reduce(
          (acc, curr) => acc + (curr.readCount || 0),
          0,
        );
        const visibleCount = listData.filter(
          (a) => a.status === "published",
        ).length;
        const invisibleCount = listData.filter(
          (a) => a.status === "draft",
        ).length;
        setStats({
          total: listData.length,
          visible: visibleCount,
          invisible: invisibleCount,
          views: totalViews,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleToggleStatus = async (article) => {
    const nextStatus = article.status === "published" ? "draft" : "published";
    setTogglingId(article._id);
    const toastId = toast.loading(
      nextStatus === "published"
        ? "Publishing signal to web..."
        : "Hiding signal from web...",
    );
    try {
      const res = await articlesApi.toggleStatus(article._id, nextStatus);
      if (res.success) {
        setArticles((prev) =>
          prev.map((item) =>
            item._id === article._id ? { ...item, status: nextStatus } : item,
          ),
        );
        if (nextStatus === "published") {
          toast.success("Article is now VISIBLE on apps/web", { id: toastId });
        } else {
          toast.success("Article is now INVISIBLE on apps/web (Hidden)", {
            id: toastId,
          });
        }
        setStats((prev) => ({
          ...prev,
          visible:
            nextStatus === "published"
              ? prev.visible + 1
              : Math.max(0, prev.visible - 1),
          invisible:
            nextStatus === "draft"
              ? prev.invisible + 1
              : Math.max(0, prev.invisible - 1),
        }));
      } else {
        toast.error(res.error || "Failed to update article status", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("An error occurred while updating status", { id: toastId });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedArticle) return;

    setSubmitting(true);
    const toastId = toast.loading("Decommissioning signal...");
    try {
      const res = await articlesApi.delete(selectedArticle._id);
      if (res.success) {
        toast.success("Signal decommissioned from archive", { id: toastId });
        setIsDeleteOpen(false);
        setSelectedArticle(null);
        fetchArticles();
      } else {
        toast.error(res.error || "Failed to decommission signal", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("An error occurred", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredArticles = articles.filter(
    (art) =>
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AdminPage>
      <ArticleHeader />

      <ArticleControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        stats={stats}
      />

      {loading ? (
        <div className="flex-1 space-y-8 py-20 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-87.5" />
                  <Skeleton className="h-4 w-50" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="w-24 h-10 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-28 border-y border-zinc-200 dark:border-zinc-900 opacity-60">
          <div className="w-24 h-24 rounded-full border border-dashed border-zinc-300 dark:border-zinc-800 flex items-center justify-center">
            <FileText size={40} className="text-zinc-400 dark:text-zinc-700" />
          </div>
          <div className="text-center flex flex-col gap-1">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
              No Articles Match Request
            </span>
            <p className="text-sm font-light text-zinc-400">
              No articles were found matching your active filter criteria.
            </p>
          </div>
          <Link
            href="/articles/new"
            className="mt-4 px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Write an Article
          </Link>
        </div>
      ) : viewMode === "list" ? (
        <ArticleListView
          articles={filteredArticles}
          getImageUrl={getImageUrl}
          togglingId={togglingId}
          handleToggleStatus={handleToggleStatus}
          setSelectedArticle={setSelectedArticle}
          setIsDeleteOpen={setIsDeleteOpen}
        />
      ) : (
        <ArticleCardView
          articles={filteredArticles}
          getImageUrl={getImageUrl}
          togglingId={togglingId}
          handleToggleStatus={handleToggleStatus}
          setSelectedArticle={setSelectedArticle}
          setIsDeleteOpen={setIsDeleteOpen}
        />
      )}

      <ArticleMetrics stats={stats} />

      <ArticleDeleteDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        selectedArticle={selectedArticle}
        submitting={submitting}
        handleDelete={handleDelete}
      />
    </AdminPage>
  );
}
