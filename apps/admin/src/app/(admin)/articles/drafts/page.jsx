"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FileText } from "lucide-react";
import Link from "next/link";
import { articlesApi } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton, Card } from "@/components/ui";

import DraftHeader from "./components/DraftHeader";
import DraftCardView from "./components/DraftCardView";
import DraftListView from "./components/DraftListView";
import {
  DraftPublishDialog,
  DraftDeleteDialog,
} from "./components/DraftDialogs";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { getImageUrl } from "@/lib/utils";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [urlFilters, setUrlFilters] = useUrlFilters({ view: "card" });
  const viewMode = urlFilters.view || "card";
  const setViewMode = (v) => setUrlFilters((current) => ({ ...current, view: v }));



  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await articlesApi.list({ status: "draft", limit: "50" });
      if (res.success && res.data) {
        const data = res.data.data || res.data;
        setDrafts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load drafts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleToggleStatus = async (article) => {
    const nextStatus = article.status === "published" ? "draft" : "published";
    setTogglingId(article._id);
    const toastId = toast.loading(
      nextStatus === "published"
        ? "Publishing to website..."
        : "Hiding from website...",
    );
    try {
      const res = await articlesApi.toggleStatus(article._id, nextStatus);
      if (res.success) {
        toast.success(
          nextStatus === "published"
            ? "Article is now Visible on website!"
            : "Article is now Hidden from website",
          { id: toastId },
        );
        fetchDrafts();
      } else {
        toast.error(res.error || "Failed to update status", { id: toastId });
      }
    } catch (error) {
      toast.error("An error occurred", { id: toastId });
    } finally {
      setTogglingId(null);
    }
  };

  const handlePublish = async () => {
    if (!selectedArticle) return;
    setSubmitting(true);
    const toastId = toast.loading("Publishing article...");
    try {
      const res = await articlesApi.publish(selectedArticle._id);
      if (res.success) {
        toast.success("Article published successfully!", { id: toastId });
        setIsPublishOpen(false);
        setSelectedArticle(null);
        fetchDrafts();
      } else {
        toast.error(res.error || "Failed to publish article", { id: toastId });
      }
    } catch (error) {
      toast.error("An error occurred", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedArticle) return;
    setSubmitting(true);
    const toastId = toast.loading("Deleting draft...");
    try {
      const res = await articlesApi.delete(selectedArticle._id);
      if (res.success) {
        toast.success("Draft deleted successfully", { id: toastId });
        setIsDeleteOpen(false);
        setSelectedArticle(null);
        fetchDrafts();
      } else {
        toast.error(res.error || "Failed to delete draft", { id: toastId });
      }
    } catch (error) {
      toast.error("An error occurred", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 flex flex-col gap-8 md:gap-12 max-w-400 mx-auto text-zinc-900 dark:text-zinc-400 transition-colors duration-300">
      <DraftHeader viewMode={viewMode} setViewMode={setViewMode} />

      {/* Main Drafts Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-75">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="p-8 rounded-[2.5rem] border-zinc-200 dark:border-zinc-900 shadow-none space-y-8"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
              <Skeleton className="w-full aspect-video rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-32 opacity-50">
          <div className="w-24 h-24 rounded-full border border-dashed border-zinc-300 dark:border-zinc-800 flex items-center justify-center">
            <FileText size={40} className="text-zinc-300 dark:text-zinc-800" />
          </div>
          <div className="text-center flex flex-col gap-1">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
              No Drafts Found
            </span>
            <p className="text-sm font-light text-zinc-400">
              There are currently no saved drafts. Create a new article to get
              started.
            </p>
          </div>
          <Link
            href="/articles/new"
            className="mt-4 px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Create New Article
          </Link>
        </div>
      ) : viewMode === "card" ? (
        <DraftCardView
          drafts={drafts}
          getImageUrl={getImageUrl}
          togglingId={togglingId}
          handleToggleStatus={handleToggleStatus}
          setSelectedArticle={setSelectedArticle}
          setIsPublishOpen={setIsPublishOpen}
          setIsDeleteOpen={setIsDeleteOpen}
        />
      ) : (
        <DraftListView
          drafts={drafts}
          getImageUrl={getImageUrl}
          setSelectedArticle={setSelectedArticle}
          setIsPublishOpen={setIsPublishOpen}
          setIsDeleteOpen={setIsDeleteOpen}
        />
      )}

      <DraftPublishDialog
        isOpen={isPublishOpen}
        setIsOpen={setIsPublishOpen}
        selectedArticle={selectedArticle}
        handlePublish={handlePublish}
        submitting={submitting}
      />

      <DraftDeleteDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        selectedArticle={selectedArticle}
        handleDelete={handleDelete}
        submitting={submitting}
      />
    </div>
  );
}
