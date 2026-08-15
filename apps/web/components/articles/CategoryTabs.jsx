"use client";

import React from 'react';
import { motion } from 'framer-motion';







export default function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-4 border-b border-zinc-100 dark:border-zinc-900 mb-8">
            {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`relative py-2 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'}`}>
            
                        {category}
                        {isActive &&
            <motion.div
              layoutId="activeCategory"
              className="absolute -bottom-4 left-0 right-0 h-1 bg-zinc-900 dark:bg-white rounded-full" />

            }
                    </button>);

      })}
        </div>);

}
