"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  ChevronLeft,
  Clock,
  History,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import Editor from "@/components/Editor";
import { pagesApi, Page } from "@/lib/api";
import { toast } from "sonner";

export default function LegalPageEditor() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();

  const [pageData, setPageData] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const response = await pagesApi.get(slug);
        if (response.success && response.data) {
          const data = response.data;
          setPageData(data);
          setTitle(data.title);
          setContent(data.content);
        } else {
          // Initialize with defaults if not found
          setTitle(slug.replace(/-/g, " ").toUpperCase());
          setContent("<p>Initial content...</p>");
        }
      } catch (error) {
        console.error("Failed to load page:", error);
        toast.error("Failed to sync with local node");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Heading required for protocol");

    setIsSaving(true);
    const toastId = toast.loading("Syncing with database...");

    try {
      const response = await pagesApi.update(slug, {
        title,
        content,
      });

      if (response.success) {
        toast.success("Protocol updated successfully", { id: toastId });
        setPageData(response.data);
      } else {
        toast.error(response.error || "Failed to update protocol", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Critical error during transmission", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-zinc-900 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">
            Syncing Protocol Data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col transition-colors duration-300">
      {/* Header Toolbar */}
      <header className="h-20 border-b border-zinc-200 dark:border-zinc-900 px-12 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-120 transition-colors duration-300">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-transparent shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-600">
              Legal Protocol Editor
            </span>
            <span className="text-sm font-black text-zinc-900 dark:text-white italic tracking-tight uppercase">
              {slug.replace(/-/g, " ")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={isPreview ? "default" : "outline"}
            onClick={() => setIsPreview(!isPreview)}
            className="rounded-full px-6 h-12 text-[10px] font-black uppercase tracking-widest"
          >
            <Eye size={16} className="mr-2" />
            {isPreview ? "Close Logic View" : "Logic Preview"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 border-none"
          >
            <Save size={16} className="mr-2" />
            {isSaving ? "Syncing..." : "Commit Protocol"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Content */}
        <main
          className={`flex-1 overflow-y-auto p-12 md:p-24 transition-all duration-700 ${isPreview ? "opacity-0 scale-95 pointer-events-none absolute inset-0" : "opacity-100 scale-100 relative"}`}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-2">
                Primary Heading
              </span>
              <input
                placeholder="ENTER PROTOCOL TITLE..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-4xl md:text-5xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-6 border-y border-zinc-100 dark:border-zinc-900/50 py-6">
              <div className="flex items-center gap-2">
                <History size={14} className="text-zinc-400" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  Last Modified:{" "}
                  {pageData?.lastUpdated
                    ? new Date(pageData.lastUpdated).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                  Authorized node
                </span>
              </div>
            </div>

            <div className="w-full">
              <Editor
                value={content}
                onChange={setContent}
                placeholder="DECREE CONTENT / BEGIN WRITING..."
              />
            </div>
          </div>
        </main>

        {/* Preview Overlay */}
        <AnimatePresence>
          {isPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg z-115 overflow-y-auto p-12 md:p-24 shadow-2xl"
            >
              <div className="max-w-4xl mx-auto bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-white rounded-[2.5rem] p-12 md:p-20 shadow-2xl border border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-4 mb-16">
                  <span className="w-10 h-px bg-emerald-500"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                    Protocol Preview
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-black font-outfit uppercase tracking-tighter leading-tight text-zinc-900 dark:text-white mb-10">
                  {title || "Untitled Protocol"}
                </h1>

                <div
                  className="prose dark:prose-invert max-w-none text-xl leading-relaxed text-zinc-700 dark:text-zinc-400 ql-editor"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Sidebar */}
        <aside className="w-80 border-l border-zinc-200 dark:border-zinc-900 flex-col p-8 gap-8 bg-white/50 dark:bg-zinc-950/50 hidden xl:flex backdrop-blur-md">
          <div className="flex flex-col gap-6 pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-zinc-400" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">
                Compliance Info
              </h3>
            </div>

            <Card className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none">
              <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                Modifications to this protocol are immediate and will be
                reflected across all editorial nodes upon commit.
              </p>
            </Card>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  Publicity
                </span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Global
                </span>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  Encryption
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  v2.4 RSA
                </span>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  Audit State
                </span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">
                  Stable
                </span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900">
              <span className="text-[8px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-[0.4em]">
                Protocol Node ID
              </span>
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-700 mt-2 truncate">
                {slug}_prod_stable_main
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
