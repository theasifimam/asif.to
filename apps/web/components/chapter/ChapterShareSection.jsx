"use client";

import React, { useState } from "react";
import { Share2, Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react";

export default function ChapterShareSection({ chapter }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60 space-y-4">
      <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
        <Share2 className="w-4 h-4 text-blue-500" />
        Share this Chapter
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        Help others learn by sharing this lesson with your friends and network.
      </p>
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        <button
          onClick={() => {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(
              `Check out this lesson: ${chapter?.title} on asif.to`,
            );
            window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 flex items-center justify-center transition-all active:scale-90"
          title="Share on WhatsApp"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.105 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </button>
        <button
          onClick={() => {
            const url = encodeURIComponent(window.location.href);
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${url}`,
              "_blank",
            );
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 flex items-center justify-center transition-all active:scale-90"
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(
              `Check out this lesson: ${chapter?.title} on asif.to`,
            );
            window.open(
              `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
              "_blank",
            );
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/10 dark:bg-white/10 text-black dark:text-white hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center transition-all active:scale-90"
          title="Share on X"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const url = encodeURIComponent(window.location.href);
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
              "_blank",
            );
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 flex items-center justify-center transition-all active:scale-90"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopyLink}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            copied
              ? "bg-emerald-500/10 text-emerald-500 font-bold"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
          title="Copy link to clipboard"
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        </button>
        {typeof navigator !== "undefined" && navigator.share && (
          <button
            onClick={async () => {
              try {
                await navigator.share({
                  title: chapter?.title,
                  text: `Check out this lesson on asif.to`,
                  url: window.location.href,
                });
              } catch (err) {}
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-all active:scale-90 shadow-md shadow-blue-500/20"
            title="More share options..."
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
