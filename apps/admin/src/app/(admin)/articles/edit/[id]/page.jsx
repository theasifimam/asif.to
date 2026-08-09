"use client";

import React, { useState, useRef, useEffect, use } from 'react';
import {
  Eye,
  ChevronLeft,
  Image as ImageIcon,
  Save,
  Trash2,
  Loader2 } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Button,
  Badge } from
"@/components/ui";
import { articlesApi, topicsApi, Topic } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Editor component
import Editor from '@/components/Editor';

export default function EditArticlePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = params.id;

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Editor State
  const [heroImage, setHeroImage] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef(null);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        // Fetch topics
        const topicsRes = await topicsApi.list();
        if (topicsRes.success && topicsRes.data) {
          setAvailableTopics(topicsRes.data.data || topicsRes.data);
        }

        // Fetch article
        const articleRes = await articlesApi.get(id);
        if (articleRes.success && articleRes.data) {
          const article = articleRes.data.data || articleRes.data;
          setTitle(article.title);
          setSelectedTopics(article.topic.map((t) => typeof t === 'string' ? t : t._id || t));
          setHeroImage(`http://localhost:5000${article.image}`);
          setContent(article.content);

        } else {
          toast.error("Article not found");
          router.push('/articles/published');
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching article data");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

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

  const handleUpdate = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!content.replace(/<[^>]*>/g, '').trim()) return toast.error("Content is required");
    if (selectedTopics.length === 0) return toast.error("At least one topic is required");

    setIsUpdating(true);
    const toastId = toast.loading("Updating signal in archive...");

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (heroFile) {
        formData.append('image', heroFile);
      }

      selectedTopics.forEach((topicId) => {
        formData.append('topic', topicId);
      });

      const response = await articlesApi.update(id, formData);

      if (response.success) {
        toast.success("Signal updated successfully!", { id: toastId });
        router.push('/articles/published');
      } else {
        toast.error(response.error || "Failed to update signal", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during update", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTopic = (topicId) => {
    setSelectedTopics((prev) => prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-zinc-400" size={40} />
                    <span className="text-[11px] font-black uppercase tracking-[0.6em] text-zinc-500 animate-pulse">Syncing Archive...</span>
                </div>
            </div>);

  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col transition-colors duration-300">
            {/* Editor Toolbar */}
            <header className="h-20 border-b border-zinc-200 dark:border-zinc-900 px-12 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-[120] transition-colors duration-300">
                <div className="flex items-center gap-8">
                    <Link href="/articles/published" className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-transparent shadow-sm dark:shadow-none">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-600">Article Editor</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-white italic tracking-tight">{title || 'EDITING SIGNAL...'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
            variant={isPreview ? "default" : "outline"}
            onClick={() => setIsPreview(!isPreview)}
            className="rounded-full px-6 h-12 text-[10px] font-black uppercase tracking-widest">
            
                        <Eye size={16} className="mr-2" />
                        {isPreview ? 'Close Preview' : 'Live Preview'}
                    </Button>
                    <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-400 border-none shadow-xl shadow-emerald-500/20">
            
                        <Save size={16} className="mr-2" />
                        {isUpdating ? 'Re-writing...' : 'Update Dispatch'}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <main className={`flex-1 overflow-y-auto p-12 md:p-24 transition-all duration-700 ${isPreview ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100 relative'}`}>
                    <div className="max-w-4xl mx-auto flex flex-col gap-12">
                        {heroImage &&
            <div className="relative group shadow-xl shadow-black/5 dark:shadow-none rounded-3xl">
                                <img src={heroImage} alt="Hero" className="w-full aspect-[21/9] object-cover rounded-3xl" />
                                <button
                onClick={() => setHeroImage(null)}
                className="absolute top-4 right-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-700 p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                
                                    <Trash2 size={16} />
                                </button>
                            </div>
            }

                        <textarea
              placeholder="RE-LABEL DISPATCH..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-5xl md:text-6xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:outline-none resize-none min-h-[120px] leading-[0.9]" />
            

                        <div className="flex items-center gap-8 border-y border-zinc-200 dark:border-zinc-900 py-6">
                            <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageUpload} />
              
                            <Button
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer p-0 h-auto bg-transparent hover:bg-transparent">
                
                                <ImageIcon size={16} />
                                {heroImage ? 'Change Visual' : 'Add Hero Visual'}
                            </Button>
                        </div>

                        <div className="w-full">
                            <Editor value={content} onChange={handleContentChange} placeholder="RE-WRITE DISPATCH PROSE..." />
                        </div>
                    </div>
                </main>

                {/* Preview Layer */}
                <AnimatePresence>
                    {isPreview &&
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg z-[115] overflow-y-auto p-12 md:p-24 shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-colors duration-500">
            
                            <div className="max-w-[1400px] mx-auto bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white shadow-2xl shadow-black/5 dark:shadow-none rounded-[3rem] p-12 md:p-32 min-h-[80vh] border border-zinc-100 dark:border-zinc-900 transition-colors duration-500">
                                <div className="flex items-center gap-4 mb-20 text-zinc-900 dark:text-white">
                                    <span className="w-12 h-[1px] bg-zinc-400 dark:bg-zinc-800"></span>
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600">Re-Transmitting Projection</span>
                                </div>

                                {selectedTopics.length > 0 &&
              <div className="flex flex-wrap gap-3 mb-8">
                                        {selectedTopics.map((topicId) => {
                  const topic = availableTopics.find((t) => t._id === topicId);
                  return (
                    <Badge key={topicId} variant="secondary" className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-200 dark:border-transparent transition-colors duration-300">
                                                    {topic?.name || 'Topic'}
                                                </Badge>);

                })}
                                    </div>
              }

                                <h1 className="text-5xl md:text-8xl font-black font-outfit uppercase tracking-tighter leading-[0.9] text-zinc-900 dark:text-white mb-12">
                                    {title || 'Untitiled Dispatch'}
                                </h1>

                                <div className={`aspect-[21/9] ${heroImage ? 'bg-transparent border-none shadow-xl shadow-black/5 dark:shadow-none' : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-transparent'} rounded-[2.5rem] mb-20 overflow-hidden relative group transition-colors duration-300`}>
                                    {heroImage ?
                <img src={heroImage} alt="Hero Preview" className="w-full h-full object-cover" /> :

                <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-800 font-black tracking-widest text-xl uppercase italic">No Visual Loaded</div>
                }
                                </div>

                                <div
                className="text-2xl font-light leading-relaxed text-zinc-700 dark:text-zinc-300 max-w-4xl pr-8 md:pr-12 ql-editor"
                dangerouslySetInnerHTML={{ __html: content || '<p class="text-zinc-300 dark:text-zinc-800 italic font-light animate-pulse">[ Dispatch Prose Rendering in Real-time ]</p>' }} />
              
                            </div>
                        </motion.div>
          }
                </AnimatePresence>

                {/* Preview and Sidebars remain largely the same, but use dynamic categories from API */}
                <aside className="w-96 border-l border-zinc-200 dark:border-zinc-900 flex flex-col p-8 gap-10 bg-white/50 dark:bg-zinc-950/50 z-10 hidden lg:flex transition-colors duration-300 backdrop-blur-md">
                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600 italic">Primary Topic</label>
                        <div className="flex flex-wrap gap-2">
                            {availableTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic._id);
                return (
                  <Badge
                    key={topic._id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleTopic(topic._id)}
                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${isSelected ?
                    'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-lg' :
                    'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`
                    }>
                    
                                        {topic.name}
                                    </Badge>);

              })}
                        </div>
                    </div>
                </aside>
            </div>
        </div>);

}