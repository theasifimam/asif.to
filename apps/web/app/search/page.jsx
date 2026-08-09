"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGetArticlesQuery } from '@/lib/api/articlesApi';
import { useGetTopicsQuery } from '@/lib/api/topicsApi';

const SearchHero = dynamic(() => import('@/components/search/SearchHero'), {
  ssr: false
});

const SearchFilters = dynamic(() => import('@/components/search/SearchFilters'), {
  ssr: false
});

const ArticleGrid = dynamic(() => import('@/components/search/ArticleGrid'), {
  ssr: false,
  loading: () =>
  <div className="flex flex-col gap-8 py-10">
            <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) =>
      <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl" />
      )}
            </div>
        </div>

});

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: topicsResponse, isLoading: topicsLoading } = useGetTopicsQuery();
  const topics = useMemo(() => topicsResponse?.data || [], [topicsResponse]);
  const displayTopics = useMemo(() => [
  { _id: 'all', name: 'All' },
  ...topics],
  [topics]);

  useEffect(() => {
    if (!activeTopicId) {
      setActiveTopicId('all');
    }
  }, [activeTopicId]);

  const { data: articlesResponse, isLoading: articlesLoading } = useGetArticlesQuery(
    {
      topic: activeTopicId && activeTopicId !== 'all' ? activeTopicId : undefined,
      status: 'published',
      search: debouncedSearch || undefined
    }
  );

  const articles = useMemo(() => articlesResponse?.data || [], [articlesResponse]);

  const activeTopicName = useMemo(() =>
  displayTopics.find((t) => t._id === activeTopicId)?.name || 'All',
  [displayTopics, activeTopicId]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
            <Header />

            <main className="flex-1 w-full flex flex-col pb-20">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full flex flex-col gap-10">
                    <SearchHero />

                    <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            topics={displayTopics}
            topicsLoading={topicsLoading}
            activeTopicId={activeTopicId}
            onTopicChange={setActiveTopicId} />
          

                    <ArticleGrid
            articles={articles}
            loading={articlesLoading}
            searchQuery={searchQuery}
            activeTopicName={activeTopicName} />
          
                </div>
            </main>

            <Footer />
        </div>);

}