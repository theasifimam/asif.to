"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import { useToggleSavedItemMutation, useGetMySavedItemsQuery } from "@/lib/api/authApi";
import { toast } from "sonner";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

/**
 * SaveButton — reusable bookmark/save toggle for any content type.
 *
 * @param {string} itemId   - MongoDB _id of the item
 * @param {"course"|"chapter"|"cheatsheet"|"quiz_question"} itemType
 * @param {string} [label]  - Optional text label (hidden when false)
 * @param {string} [size]   - "sm" | "md" (default: "md")
 * @param {string} [className] - Extra class names for the button
 */
export default function SaveButton({
  itemId,
  itemType,
  label,
  size = "md",
  className = "",
}) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { requireAuth } = useAuthPrompt();
  const pendingSave = React.useRef(false);
  const [toggleSaved, { isLoading: isToggling }] = useToggleSavedItemMutation();

  // Fetch user's saved items to compute current state
  const { data: savedRes } = useGetMySavedItemsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const isSaved = React.useMemo(() => {
    if (!savedRes?.data?.savedItems) return false;
    return savedRes.data.savedItems.some(
      (s) =>
        s._id?.toString() === itemId?.toString() && s.itemType === itemType,
    );
  }, [savedRes, itemId, itemType]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      pendingSave.current = true;
      requireAuth();
      return;
    }

    if (!itemId) {
      toast.error("Cannot save this item");
      return;
    }

    try {
      const res = await toggleSaved({ itemId, itemType }).unwrap();
      if (res.data.isSaved) {
        toast.success(`Saved to your library`);
      } else {
        toast.success(`Removed from your library`);
      }
    } catch {
      toast.error("Failed to update save status");
    }
  };

  React.useEffect(() => {
    if (!isAuthenticated || !pendingSave.current || !itemId) return;
    pendingSave.current = false;
    toggleSaved({ itemId, itemType })
      .unwrap()
      .then(() => toast.success("Saved to your library"))
      .catch(() => toast.error("Failed to save item"));
  }, [isAuthenticated, itemId, itemType, toggleSaved]);

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnSize =
    size === "sm" ? "px-2.5 py-1.5 text-[10px]" : "px-3.5 py-2 text-xs";

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      title={isSaved ? "Remove from saved" : "Save to library"}
      className={`group inline-flex items-center gap-2 rounded-full font-bold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
        ${
          isSaved
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5"
            : "bg-zinc-100/90 dark:bg-zinc-800/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/70 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/80 dark:hover:bg-zinc-700/90 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:-translate-y-0.5 shadow-xs"
        }
        ${btnSize} ${className}`}
    >
      <div className={`rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${isSaved ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 p-1"}`}>
        {isToggling ? (
          <LogoLoader className={`${iconSize} `}  />
        ) : isSaved ? (
          <BookmarkCheck className={`${iconSize}`} />
        ) : (
          <Bookmark className={`${iconSize}`} />
        )}
      </div>
      {label !== undefined && (
        <span>{isSaved ? "Saved" : label || "Save"}</span>
      )}
    </button>
  );
}
