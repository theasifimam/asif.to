"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Layers3, FileText } from "lucide-react";
import { getImageUrl } from "@/lib/config";

export function SafeCourseCover({ thumbnail, title, techName, slug }) {
  const [hasError, setHasError] = useState(false);

  if (thumbnail && !hasError) {
    return (
      <Link
        href={`/courses/${slug}`}
        className="relative mb-3 block w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 aspect-[2.1/1] border border-zinc-200/60 dark:border-zinc-800"
      >
        <Image
          src={getImageUrl(thumbnail)}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-103"
          onError={() => setHasError(true)}
          unoptimized
        />
      </Link>
    );
  }

  return (
    <Link
      href={`/courses/${slug}`}
      className="relative mb-3 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/15 via-indigo-500/10 to-violet-500/15 dark:from-blue-900/30 dark:via-zinc-850 dark:to-indigo-950/40 aspect-[2.1/1] border border-zinc-200/70 dark:border-zinc-800 transition-all group-hover:border-blue-500/40 p-3"
    >
      <div className="relative z-10 flex items-center gap-2.5 w-full">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80 group-hover:scale-105 group-hover:border-blue-500 transition-all">
          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-outfit text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100 block truncate">
            {title}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block truncate">
            {techName || "Track"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function SafeTopicCover({ image, title, topicType, courseTitle }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full aspect-[2.2/1] overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600/20 via-teal-600/10 to-zinc-900 dark:from-emerald-950 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between p-3.5">
      {image && !hasError ? (
        <>
          <Image
            src={getImageUrl(image)}
            alt={title || "Guide"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        </>
      ) : (
        <Layers3 className="w-20 h-20 text-emerald-500/15 absolute -right-2 -bottom-2 pointer-events-none" />
      )}

      {/* Top Badges Row */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 w-full">
        <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
          {topicType === "interview" ? "Interview Q&A" : "Guide"}
        </span>
        {courseTitle && (
          <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold text-white/90 border border-white/20 truncate max-w-35 xs:max-w-[180px]">
            {courseTitle}
          </span>
        )}
      </div>
    </div>
  );
}

export function SafeArticleCover({ image, title, categoryName }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full aspect-[2.2/1] overflow-hidden rounded-2xl bg-linear-to-br from-purple-600/20 via-purple-900/15 to-zinc-950 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between p-3.5">
      {image && !hasError ? (
        <>
          <Image
            src={getImageUrl(image)}
            alt={title || "Article"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        </>
      ) : (
        <FileText className="w-20 h-20 text-purple-500/15 absolute -right-2 -bottom-2 pointer-events-none" />
      )}

      {/* Floating Category Badge */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-purple-300 border border-purple-500/30">
          {categoryName}
        </span>
      </div>
    </div>
  );
}
