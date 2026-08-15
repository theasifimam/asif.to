"use client";

import React from 'react';
import ArticleCard from '@/components/articles/ArticleCard';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';








export default function ArticleGrid({
  articles,
  loading,
  searchQuery,
  activeTopicName
}) {
  return (
    <div className="flex flex-col gap-2 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    {searchQuery ?
          `Search Results (${articles.length})` :
          `Suggested in ${activeTopicName || 'Investigations'} (${articles.length})`}
                </h2>
            </div>

            {loading ?
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-zinc-300" size={40} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Decoding Signals...</span>
                </div> :
      articles.length > 0 ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-8">
                    {articles.map((article) =>
        <ArticleCard
          key={article._id}
          article={{
            id: article._id,
            slug: article.slug,
            title: article.title,
            author: article.author?.fullName || 'Anonymous',
            date: format(new Date(article.createdAt), 'MMM dd, yyyy'),
            imageUrl: article.image,
            views: article.readCount
          }}
          variant="horizontal" />

        )}
                </div> :

      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-zinc-400 text-sm font-medium italic">"No signals found matching your inquiry."</p>
                </div>
      }
        </div>);

}