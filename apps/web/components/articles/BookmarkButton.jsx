"use client";

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useToggleBookmarkMutation } from '@/lib/api/authApi';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { toggleBookmark as toggleBookmarkAction } from '@/lib/store/authSlice';
import { toast } from 'sonner';
import AuthModal from '@/components/auth/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';








export default function BookmarkButton({
  articleId,
  initialIsBookmarked = false,
  className = "",
  onToggle
}) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toggleBookmarkMutation, { isLoading }] = useToggleBookmarkMutation();

  // Sync with user's current bookmarks from global store
  const isActuallyBookmarked = user?.bookmarks?.some((b) =>
  (typeof b === 'string' ? b : b._id) === articleId
  ) ?? initialIsBookmarked;

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      // Optimistic sync - update local store first or after mutation? 
      // I'll update after to be safe, or just let mutation handle it.
      const res = await toggleBookmarkMutation(articleId).unwrap();

      // Re-sync global auth store
      dispatch(toggleBookmarkAction(articleId));

      if (onToggle) onToggle(res.data.isBookmarked);
      toast.success(res.message);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update bookmark.");
    }
  };

  return (
    <>
            <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`group/bookmark relative p-2.5 rounded-full transition-all duration-300 active:scale-90 ${
        isActuallyBookmarked ?
        "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg shadow-black/20" :
        "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"} ${
        className}`}
        title={isActuallyBookmarked ? "Remove from reading list" : "Save for later"}>
        
                <motion.div
          initial={false}
          animate={{ scale: isActuallyBookmarked ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.3 }}>
          
                    <Bookmark
            size={18}
            strokeWidth={2}
            className={isActuallyBookmarked ? "fill-current" : ""} />
          
                </motion.div>
                
                {/* Tooltip-like indicator on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-800 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover/bookmark:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {isActuallyBookmarked ? "Saved" : "Save later"}
                </div>
            </button>

            <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        defaultTab="signin" />
      
        </>);

}
