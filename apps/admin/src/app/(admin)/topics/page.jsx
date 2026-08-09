"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { topicsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Card } from "@/components/ui";

import TopicHeader from './components/TopicHeader';
import TopicGrid from './components/TopicGrid';
import { TopicDialog, TopicDeleteDialog } from './components/TopicDialogs';

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trend, setTrend] = useState('Stable');

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await topicsApi.list();
      if (response.success && response.data?.data) {
        setTopics(response.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setSubmitting(true);
    const toastId = toast.loading("Creating topic...");
    try {
      const res = await topicsApi.create({ name, description, trend });
      toast.success("Topic created successfully", { id: toastId });
      setIsAddOpen(false);
      resetForm();
      fetchTopics();
    } catch (error) {
      toast.error("Failed to create topic", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTopic || !name.trim()) return;
    setSubmitting(true);
    const toastId = toast.loading("Updating topic...");
    try {
      await topicsApi.update(selectedTopic._id, { name, description, trend });
      toast.success("Topic updated successfully", { id: toastId });
      setIsEditOpen(false);
      resetForm();
      fetchTopics();
    } catch (error) {
      toast.error("Failed to update topic", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTopic) return;
    setSubmitting(true);
    const toastId = toast.loading("Deleting topic...");
    try {
      await topicsApi.delete(selectedTopic._id);
      toast.success("Topic deleted", { id: toastId });
      setIsDeleteOpen(false);
      setSelectedTopic(null);
      fetchTopics();
    } catch (error) {
      toast.error("Failed to delete topic", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTrend('Stable');
    setSelectedTopic(null);
  };

  const openEdit = (topic) => {
    setSelectedTopic(topic);
    setName(topic.name);
    setDescription(topic.description || '');
    setTrend(topic.trend || 'Stable');
    setIsEditOpen(true);
  };

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 md:p-12 flex flex-col gap-8 md:gap-12 max-w-[1600px] mx-auto text-zinc-900 dark:text-zinc-400 transition-colors duration-300">
      
      <TopicHeader
        search={search}
        setSearch={setSearch}
        resetForm={resetForm}
        setIsAddOpen={setIsAddOpen}
      />

      <TopicGrid
        loading={loading}
        filteredTopics={filteredTopics}
        openEdit={openEdit}
        setSelectedTopic={setSelectedTopic}
        setIsDeleteOpen={setIsDeleteOpen}
      />

      {/* Modals */}
      <TopicDialog
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        title="Create New Topic"
        onConfirm={handleCreate}
        submitting={submitting}
        form={{ name, setName, description, setDescription, trend, setTrend }}
      />

      <TopicDialog
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title="Edit Topic"
        onConfirm={handleUpdate}
        submitting={submitting}
        form={{ name, setName, description, setDescription, trend, setTrend }}
      />

      <TopicDeleteDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        selectedTopic={selectedTopic}
        handleDelete={handleDelete}
        submitting={submitting}
      />

      {/* Deep Management View */}
      <Card className="bg-[#09090b] rounded-[2rem] md:rounded-[3rem] border-zinc-900 p-6 sm:p-8 md:p-12 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Cross-Topic Analytics</span>
            <h2 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tighter text-white">Hierarchical Relations</h2>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-zinc-900">
          {['Sub-topic Structures', 'Cross-linking Metrics', 'Metadata Ingestion Rules', 'Archival Weights'].map((item, i) => (
            <div key={i} className="py-6 md:py-8 flex items-center justify-between group cursor-pointer lg:hover:px-6 transition-all">
              <div className="flex items-center gap-4 md:gap-6 min-w-0">
                <span className="text-[10px] md:text-sm font-black italic text-zinc-800 shrink-0">DATA.0{i + 1}</span>
                <span className="text-base md:text-xl font-bold font-outfit uppercase tracking-tight text-zinc-400 group-hover:text-white transition-colors truncate">{item}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-800 group-hover:text-white transition-all transform group-hover:translate-x-2 shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}