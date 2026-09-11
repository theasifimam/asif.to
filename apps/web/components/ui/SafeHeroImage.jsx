"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GraduationCap } from "lucide-react";

export default function SafeHeroImage({
  src,
  alt,
  title,
  categoryName,
  courseTitle,
  className = "",
}) {
  const [hasError, setHasError] = useState(false);

  if (src && !hasError) {
    return (
      <div className="overflow-hidden rounded-2xl md:rounded-3xl bg-zinc-100 dark:bg-zinc-900 shadow-sm border border-zinc-200/70 dark:border-zinc-800">
        <Image
          src={src}
          alt={alt || title || "Banner"}
          width={1200}
          height={630}
          className={`h-auto w-full object-cover ${className}`}
          priority
          onError={() => setHasError(true)}
          unoptimized
        />
      </div>
    );
  }

  // Fallback: Elegant Bento Hero Card when image is missing or fails to load
  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-linear-to-br from-blue-950 via-zinc-900 to-indigo-950 p-6 sm:p-10 border border-zinc-800/80 shadow-lg text-white">
      {/* Decorative background glows & pattern */}
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          {courseTitle && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-300">
              <GraduationCap className="h-3.5 w-3.5" />
              {courseTitle}
            </span>
          )}
          {categoryName && (
            <span className="rounded-full bg-zinc-800/80 border border-zinc-700/80 px-3 py-1 text-[11px] font-bold text-zinc-300">
              {categoryName}
            </span>
          )}
        </div>

        <h2 className="font-outfit text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
          {title || alt}
        </h2>
      </div>
    </div>
  );
}
