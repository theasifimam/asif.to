"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Eye,
  ChevronLeft,
  Image as ImageIcon,
  Hash,
  Save,
  Clock,
  Settings2,
  X,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Badge,
  Card,
  Switch,
} from "@/components/ui";
import { articlesApi, articleTopicsApi, Topic } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Editor component
import Editor from "@/components/Editor";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  {
    ssr: false,
    loading: () => (
      <p className="text-zinc-300 dark:text-zinc-800 italic font-light animate-pulse">
        [ Dispatch Prose Rendering in Real-time ]
      </p>
    ),
  },
);

const clearanceLevels = [
  "Public Release",
  "Tier 1 Subscribers",
  "Restricted Research",
];

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const [content, setContent] = useState("");
  const [heroImage, setHeroImage] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [clearanceLevel, setClearanceLevel] = useState(clearanceLevels[0]);
  const [allowFeedback, setAllowFeedback] = useState(true);
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  // Stats State
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);

  const router = useRouter();
  const { theme } = useTheme();

  const fileInputRef = useRef(null);

  const handleContentChange = (newContent) => {
    setContent(newContent);

    // Simple word count for Quill HTML
    const text = newContent.replace(/<[^>]*>/g, " ");
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setReadTime(Math.ceil(words / 200));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setHeroImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e) => {
    if (!title.trim()) return toast.error("Title is required");
    if (!content.replace(/<[^>]*>/g, "").trim())
      return toast.error("Content is required");
    if (selectedTopics.length === 0)
      return toast.error("At least one topic is required");
    if (!heroFile) return toast.error("Hero image is required");

    setIsPublishing(true);
    const toastId = toast.loading("Publishing article...");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("image", heroFile);

      // Append each topic
      selectedTopics.forEach((topicId) => {
        formData.append("topic", topicId);
      });

      const response = await articlesApi.create(formData);

      if (response.success) {
        toast.success("Article published successfully!", { id: toastId });
        router.push("/articles/published");
      } else {
        toast.error(response.error || "Failed to publish article", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during publishing", { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) return toast.error("Title is required to save draft");
    if (!content.replace(/<[^>]*>/g, "").trim())
      return toast.error("Content is required to save draft");
    if (selectedTopics.length === 0)
      return toast.error("At least one topic is required");
    if (!heroFile) return toast.error("Hero image is required");

    setIsSavingDraft(true);
    const toastId = toast.loading("Saving draft...");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("image", heroFile);
      formData.append("status", "draft");

      selectedTopics.forEach((topicId) => {
        formData.append("topic", topicId);
      });

      const response = await articlesApi.create(formData);

      if (response.success) {
        toast.success("Draft saved to staging area!", { id: toastId });
        router.push("/articles/drafts");
      } else {
        toast.error(response.error || "Failed to save draft", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving draft", { id: toastId });
    } finally {
      setIsSavingDraft(false);
    }
  };

  useEffect(() => {
    const fetchTopics = async () => {
      setTopicsLoading(true);
      const res = await articleTopicsApi.list();
      if (res.success && res.data) {
        // Handle nested response: { success: true, data: { success: true, data: [...] } }
        const actualData = res.data.data ?? res.data;
        setAvailableTopics(Array.isArray(actualData) ? actualData : []);
      }
      setTopicsLoading(false);
    };
    fetchTopics();
  }, []);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const removeHeroImage = () => {
    setHeroImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col transition-colors duration-300">
      {/* Editor Toolbar */}
      <header className="h-16 md:h-20 border-b border-zinc-200 dark:border-zinc-900 px-4 md:px-12 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-120 transition-colors duration-300">
        <div className="flex items-center gap-3 md:gap-8 min-w-0">
          <Link
            href="/dashboard"
            className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-transparent shadow-sm dark:shadow-none"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-600">
              Composer
            </span>
            <span className="text-[11px] md:text-sm font-black text-zinc-900 dark:text-white italic tracking-tight truncate max-w-30 md:max-w-none">
              {title || "NEW SIGNAL..."}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant={isPreview ? "default" : "outline"}
            onClick={() => setIsPreview(!isPreview)}
            className="rounded-full px-3 md:px-6 h-9 md:h-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest"
          >
            <Eye size={14} className="md:mr-2" />
            <span className="hidden sm:inline">
              {isPreview ? "Close Preview" : "Live Preview"}
            </span>
          </Button>
          <button
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className="lg:hidden w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-transparent shadow-sm active:scale-90"
          >
            <Settings2
              size={16}
              className={
                showMobileSettings
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-500"
              }
            />
          </button>
          <div className="hidden sm:flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              onClick={() => handleSaveDraft()}
              disabled={isSavingDraft || isPublishing}
              className="rounded-full px-6 h-12 text-[10px] font-black uppercase tracking-widest text-zinc-500"
            >
              <Save size={16} className="mr-2" />
              {isSavingDraft ? "Saving..." : "Draft"}
            </Button>
            <Button
              onClick={() => handlePublish()}
              disabled={isPublishing}
              className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 border-none"
            >
              <Send size={16} className="mr-2" />
              {isPublishing ? "..." : "Publish"}
            </Button>
          </div>
          {/* Mobile Only: Compact Publish */}
          <Button
            onClick={() => handlePublish()}
            disabled={isPublishing}
            className="sm:hidden w-9 h-9 rounded-full bg-emerald-500 text-white p-0 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <Send size={14} />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Area */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-12 md:p-24 transition-all duration-700 ${isPreview ? "opacity-0 scale-95 pointer-events-none absolute inset-0" : "opacity-100 scale-100 relative"}`}
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-8 md:gap-12">
            {heroImage && (
              <div className="relative group shadow-xl shadow-black/5 dark:shadow-none rounded-3xl">
                <img
                  src={heroImage}
                  alt="Hero"
                  className="w-full aspect-21/9 object-cover rounded-3xl"
                />

                <button
                  onClick={removeHeroImage}
                  className="absolute top-4 right-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-700 p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500 dark:hover:border-red-900 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <textarea
              placeholder="TITLE..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-4xl sm:text-5xl md:text-6xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-900 focus:outline-none resize-none min-h-25 leading-[0.9]"
            />

            <div className="flex items-center gap-8 border-y border-zinc-200 dark:border-zinc-900 py-6">
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />

              <Button
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer p-0 h-auto bg-transparent hover:bg-transparent"
              >
                <ImageIcon size={16} />
                {heroImage ? "Change Visual" : "Add Hero Visual"}
              </Button>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-900"></div>

              <Button
                variant="ghost"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors ml-auto cursor-pointer p-0 h-auto bg-transparent hover:bg-transparent"
              >
                <Clock size={16} />
                Schedule
              </Button>
            </div>

            {/* Topic Selector (visible on all screen sizes) */}
            <div className="flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-900 pb-6">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-zinc-400 dark:text-zinc-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  Topics
                </span>
                {selectedTopics.length > 0 && (
                  <span className="ml-auto text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                    {selectedTopics.length} Selected
                  </span>
                )}
              </div>
              {topicsLoading ? (
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Loading topics...
                  </span>
                </div>
              ) : availableTopics.length === 0 ? (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 italic">
                  No topics found.{" "}
                  <Link
                    href="/topics"
                    className="underline hover:text-zinc-700 dark:hover:text-zinc-400"
                  >
                    Create one first.
                  </Link>
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic._id);
                    return (
                      <button
                        key={topic._id}
                        type="button"
                        onClick={() => toggleTopic(topic._id)}
                        className={`px-4 py-2 border rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                            : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                      >
                        {topic.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="w-full">
              <Editor
                value={content}
                onChange={handleContentChange}
                placeholder="PROSE ENTRY / START WRITING..."
              />
            </div>
          </div>
        </main>

        {/* Mobile Settings Drawer */}
        <AnimatePresence>
          {showMobileSettings && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileSettings(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-150 lg:hidden"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 bg-white dark:bg-zinc-950 rounded-t-[2.5rem] p-8 z-151 lg:hidden border-t border-zinc-200 dark:border-zinc-800 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Settings2 size={18} className="text-zinc-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">
                      Signal Parameters
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowMobileSettings(false)}
                    className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">
                      Clearance Level
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {clearanceLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() => setClearanceLevel(level)}
                          className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-left border transition-all ${
                            clearanceLevel === level
                              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                              : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-900 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Allow Feedback
                      </span>
                      <Switch
                        checked={allowFeedback}
                        onCheckedChange={setAllowFeedback}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Enable Encryption
                      </span>
                      <Switch
                        checked={enableEncryption}
                        onCheckedChange={setEnableEncryption}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-900">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase"
                      onClick={() => {
                        handleSaveDraft();
                        setShowMobileSettings(false);
                      }}
                    >
                      Save Draft
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase"
                      onClick={() => {
                        handlePublish();
                        setShowMobileSettings(false);
                      }}
                    >
                      Publish
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Preview Layer */}
        <AnimatePresence>
          {isPreview && (
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg z-115 overflow-y-auto p-4 sm:p-12 md:p-24 transition-colors duration-500"
            >
              <div className="max-w-350 mx-auto bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white shadow-2xl shadow-black/5 dark:shadow-none rounded-4xl md:rounded-[3rem] p-6 md:p-32 min-h-[80vh] border border-zinc-100 dark:border-zinc-900 transition-colors duration-500">
                <div className="flex items-center gap-4 mb-8 md:mb-20 text-zinc-900 dark:text-white">
                  <span className="w-8 md:w-12 h-px bg-zinc-400 dark:bg-zinc-800"></span>
                  <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600">
                    Feed Projection
                  </span>
                </div>

                {selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
                    {selectedTopics.map((topicId) => {
                      const topic = availableTopics.find(
                        (t) => t._id === topicId,
                      );
                      return (
                        <Badge
                          key={topicId}
                          variant="secondary"
                          className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-zinc-200 dark:border-transparent transition-colors duration-300"
                        >
                          {topic?.name || "Topic"}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                <h1 className="text-4xl md:text-8xl font-black font-outfit uppercase tracking-tighter leading-[0.9] text-zinc-900 dark:text-white mb-8 md:mb-12">
                  {title || "Untitiled Dispatch"}
                </h1>

                <div
                  className={`aspect-video md:aspect-21/9 ${heroImage ? "bg-transparent border-none shadow-xl shadow-black/5 dark:shadow-none" : "bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-transparent"} rounded-3xl md:rounded-[2.5rem] mb-8 md:mb-20 overflow-hidden relative group transition-colors duration-300`}
                >
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-800 font-black tracking-widest text-sm md:text-xl uppercase italic">
                      No Visual Loaded
                    </div>
                  )}
                </div>

                <div
                  className="max-w-4xl"
                  data-color-mode={theme === "dark" ? "dark" : "light"}
                >
                  {content ? (
                    <MarkdownPreview
                      source={content}
                      style={{
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                      className="text-lg md:text-2xl font-light leading-relaxed bg-transparent! text-inherit! wmde-markdown"
                    />
                  ) : (
                    <p className="text-zinc-300 dark:text-zinc-800 italic font-light animate-pulse">
                      [ Dispatch Prose Rendering in Real-time ]
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Sidebar */}
        <aside className="w-96 border-l border-zinc-200 dark:border-zinc-900 flex-col p-8 gap-10 bg-white/50 dark:bg-zinc-950/50 z-10 hidden lg:flex transition-colors duration-300 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Settings2 size={18} className="text-zinc-400 dark:text-zinc-500" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">
              Signal Parameters
            </h3>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600 italic">
                Clearance Level
              </label>
              <Select value={clearanceLevel} onValueChange={setClearanceLevel}>
                <SelectTrigger className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl h-auto p-4 text-[11px] font-bold text-zinc-900 dark:text-white focus:ring-0 focus:ring-offset-0 focus:border-zinc-300 dark:focus:border-zinc-600 transition-colors shadow-sm dark:shadow-none">
                  <SelectValue placeholder="Select clearance level" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                  {clearanceLevels.map((level) => (
                    <SelectItem
                      key={level}
                      value={level}
                      className="text-[11px] font-bold uppercase tracking-widest py-3 px-4 focus:bg-zinc-100 dark:focus:bg-zinc-900 focus:text-zinc-900 dark:focus:text-white transition-colors cursor-pointer"
                    >
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600 italic">
                  Primary Topic
                </label>
                {selectedTopics.length > 0 && (
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                    {selectedTopics.length} selected
                  </span>
                )}
              </div>
              {topicsLoading ? (
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400 rounded-full animate-spin" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                    Syncing nodes...
                  </span>
                </div>
              ) : availableTopics.length === 0 ? (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 italic">
                  No topics available.{" "}
                  <Link
                    href="/topics"
                    className="underline hover:text-zinc-600"
                  >
                    Define a node first.
                  </Link>
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic._id);
                    return (
                      <button
                        key={topic._id}
                        type="button"
                        onClick={() => toggleTopic(topic._id)}
                        className={`px-4 py-2 border rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-md dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 shadow-black/20 dark:shadow-zinc-100/10"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-500 shadow-sm dark:shadow-none"
                        }`}
                      >
                        {topic.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-zinc-200 dark:border-zinc-900 pt-8 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <label
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-500 cursor-pointer"
                  onClick={() => setAllowFeedback(!allowFeedback)}
                >
                  Allow Feedback
                </label>
                <Switch
                  checked={allowFeedback}
                  onCheckedChange={setAllowFeedback}
                />
              </div>
              <div className="flex items-center justify-between">
                <label
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-500 cursor-pointer"
                  onClick={() => setEnableEncryption(!enableEncryption)}
                >
                  Enable Encryption
                </label>
                <Switch
                  checked={enableEncryption}
                  onCheckedChange={setEnableEncryption}
                />
              </div>
            </div>
          </div>

          <Card className="mt-auto p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/50 shadow-none flex flex-col gap-4 transition-colors duration-300">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
              Article Stats
            </span>
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-700 uppercase">
                  Words
                </span>
                <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white leading-none">
                  {wordCount}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-700 uppercase">
                  Read Time
                </span>
                <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white leading-none">
                  {readTime}M
                </span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
