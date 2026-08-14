"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Clock,
  Eye,
  Share2,
  Facebook,
  Instagram,
  Link2,
  Check,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  useGetArticleByIdQuery,
  useGetArticlesQuery,
} from "@/lib/api/articlesApi";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/config";
import { Loader2 } from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import BookmarkButton from "./BookmarkButton";
import ArticleCard from "./ArticleCard";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import AuthorIdentityCard from "./AuthorIdentityCard";
import MarkdownCodePlayground from "@/components/interactive-code/MarkdownCodePlayground";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  {
    ssr: false,
    loading: () => (
      <p className="text-zinc-300 dark:text-zinc-800 italic font-light animate-pulse">
        [ Loading Dispatch Data... ]
      </p>
    ),
  },
);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.531 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ArticleClient({ slug, initialData }) {
  const { theme } = useTheme();
  const id = slug.substring(slug.lastIndexOf("-") + 1);
  const { data: response, isLoading, error } = useGetArticleByIdQuery(id);
  const { data: moreArticles } = useGetArticlesQuery({ limit: 4 });
  const article = response?.data || initialData;
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle =
    article?.title || "Check out this investigation on asif.to";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: <WhatsAppIcon />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: <Facebook size={18} fill="currentColor" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Instagram",
      icon: <Instagram size={18} />,
      url: `https://www.instagram.com/`,
    },
  ];

  React.useEffect(() => {
    if (article?.content && !isLoading) {
      const highlightCode = () => {
        const codeBlocks = document.querySelectorAll("pre, code");
        codeBlocks.forEach((block) => {
          if (!block.dataset.highlighted) {
            hljs.highlightElement(block);
            block.dataset.highlighted = "true";
          }
        });
      };
      const timeout = setTimeout(highlightCode, 100);
      return () => clearTimeout(timeout);
    }
  }, [article, isLoading]);

  const isInitialLoading = !article && isLoading;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-zinc-400" size={40} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            Loading Intelligence Dispatch...
          </span>
        </div>
      </div>
    );
  }

  if (!article || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-outfit mb-2">Signal Lost</h2>
          <p className="text-zinc-500 text-sm">
            We could not locate the requested investigation.
          </p>
        </div>
        <Link
          href="/"
          className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-bold uppercase tracking-widest"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-500">
      <Header />

      <main className="flex flex-col items-center w-full pt-24 md:pt-28 pb-20">
        {/* Article Open Header */}
        <div className="w-full max-w-4xl px-6 flex flex-col gap-6 mb-10">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest w-fit"
          >
            <ArrowLeft size={16} />
            Back to Dispatches
          </Link>

          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
              {article.topic?.[0]?.name || "EDITORIAL"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {format(new Date(article.createdAt), "MMM d, yyyy")}
            </span>
            {article.readCount && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  {article.readCount.toLocaleString()} reads
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-outfit tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
            {article.title}
          </h1>

          {/* Author & Action Row */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 mt-2">
            <Link
              href="/author/asif"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 relative border border-zinc-200 dark:border-zinc-700">
                <Image
                  src={
                    article.author?.avatar
                      ? getImageUrl(article.author.avatar)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.fullName || "A")}&background=18181b&color=ffffff`
                  }
                  alt={article.author?.fullName || "Author"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Written By
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {article.author?.fullName}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <BookmarkButton articleId={article._id} />
            </div>
          </div>
        </div>

        {/* Cover Image Container */}
        <div className="w-full max-w-4xl px-6 mb-12">
          <div className="relative aspect-[16/9] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-md">
            <Image
              src={getImageUrl(article.image)}
              alt={article.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Article Body Content */}
        <article className="w-full max-w-4xl px-6 flex flex-col gap-10">
          <MarkdownCodePlayground className="article-markdown-playground">
          <div data-color-mode={theme === "dark" ? "dark" : "light"}>
            <MarkdownPreview
              source={article.content}
              style={{ backgroundColor: "transparent", color: "inherit" }}
              className="text-lg md:text-xl font-light leading-relaxed !bg-transparent !text-inherit wmde-markdown"
            />
          </div>
          </MarkdownCodePlayground>

          <AuthorIdentityCard publishedAt={article.createdAt} updatedAt={article.updatedAt} avatar={article.author?.avatar} />

          {/* Share Section */}
          <div className="flex flex-col gap-6 py-8 border-y border-zinc-200/60 dark:border-zinc-800/60 my-6">
            <div className="flex items-center gap-2">
              <Share2 size={16} className="text-zinc-400" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
                Share Investigation
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              ))}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 text-xs font-bold uppercase tracking-wider transition-all"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <Link2 size={16} />
                )}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {moreArticles?.data && (
          <section className="w-full max-w-[1400px] mt-20 px-6 lg:px-12 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">
                Further Dispatches
              </h2>
              <Link
                href="/articles"
                className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                View All &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {moreArticles.data.slice(0, 4).map((a) => (
                <ArticleCard
                  key={a._id}
                  article={{
                    id: a._id,
                    slug: a.slug,
                    title: a.title,
                    author: a.author?.fullName || "Anonymous",
                    date: format(new Date(a.createdAt), "MMM d, yyyy"),
                    imageUrl: a.image,
                    views: a.readCount,
                  }}
                  variant="vertical"
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
