"use client";

import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleCard from "@/components/articles/ArticleCard";
import {
  MapPin,
  Calendar,
  Twitter,
  Linkedin,
  Globe,
  Newspaper,
  Loader2,
  UserCheck,
  Mail,
  Github,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/lib/config";
import { useGetArticlesQuery } from "@/lib/api/articlesApi";
import { useGetPublicProfileQuery } from "@/lib/api/authApi";

export default function AuthorClient({ username }) {
  const {
    data: profileRes,
    isLoading: profileLoading,
    error: profileError,
  } = useGetPublicProfileQuery(username);
  const user = profileRes?.data?.user;
  const authorId = user?._id;

  const { data: articlesRes, isLoading: articlesLoading } = useGetArticlesQuery(
    { author: authorId, status: "published" },
    { skip: !authorId },
  );

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-outfit mb-2">
            Author Not Found
          </h2>
          <p className="text-zinc-500 text-sm">
            The requested author profile could not be located.
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

  const articles = articlesRes?.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <Header />

      <main className="flex-1 w-full flex flex-col pt-24 md:pt-28 pb-20">
        <div className="max-w-350 mx-auto px-6 lg:px-12 w-full">
          {/* Author Dateline & Header */}
          <div className="flex items-center justify-between pb-4 mb-10 border-b border-zinc-200/60 dark:border-zinc-800/60 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
            <div className="flex items-center gap-2 text-emerald-500">
              <UserCheck size={14} />
              <span className="text-zinc-900 dark:text-white font-bold">
                AUTHOR PROFILE
              </span>
              <span>•</span>
              <span className="text-zinc-400">EDITORIAL CONTRIBUTOR</span>
            </div>
            <div>
              <span>{articles.length} Published Dispatches</span>
            </div>
          </div>

          {/* Author Identity Block */}
          <div className="flex flex-col md:flex-row items-start gap-8 pb-12 mb-12 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-md">
              <Image
                src={
                  user.avatar
                    ? getImageUrl(user.avatar)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=18181b&color=ffffff&size=256`
                }
                alt={user.fullName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex flex-col gap-3 flex-1">
              <h1 className="text-3xl md:text-5xl font-black font-outfit text-zinc-900 dark:text-white tracking-tight leading-none">
                {user.fullName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">
                {user.email && (
                  <span className="flex items-center gap-1.5 lowercase text-zinc-600 dark:text-zinc-300 font-semibold">
                    <Mail size={14} className="text-blue-500 shrink-0" />
                    <a
                      href={`mailto:${user.email}`}
                      className="hover:underline"
                    >
                      {user.email}
                    </a>
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-500 shrink-0" />{" "}
                    {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="shrink-0" /> Joined{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "2026"}
                </span>
              </div>

              {user.bio && (
                <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm md:text-base font-light leading-relaxed mt-2">
                  {user.bio}
                </p>
              )}

              {user.socials &&
                Object.values(user.socials).some((link) => link) && (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {user.socials.twitter && (
                      <a
                        href={
                          user.socials.twitter.startsWith("http")
                            ? user.socials.twitter
                            : `https://twitter.com/${user.socials.twitter}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-all"
                        title="Twitter / X"
                      >
                        <Twitter size={15} />
                      </a>
                    )}
                    {user.socials.linkedin && (
                      <a
                        href={
                          user.socials.linkedin.startsWith("http")
                            ? user.socials.linkedin
                            : `https://www.linkedin.com/in/${user.socials.linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-all"
                        title="LinkedIn"
                      >
                        <Linkedin size={15} />
                      </a>
                    )}
                    {user.socials.website && (
                      <a
                        href={
                          user.socials.website.startsWith("http")
                            ? user.socials.website
                            : `https://${user.socials.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-all"
                        title="Website"
                      >
                        <Globe size={15} />
                      </a>
                    )}
                    {user.socials.github && (
                      <a
                        href={
                          user.socials.github.startsWith("http")
                            ? user.socials.github
                            : `https://github.com/${user.socials.github}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-all"
                        title="GitHub"
                      >
                        <Github size={15} />
                      </a>
                    )}
                    {user.socials.instagram && (
                      <a
                        href={
                          user.socials.instagram.startsWith("http")
                            ? user.socials.instagram
                            : `https://instagram.com/${user.socials.instagram}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-all"
                        title="Instagram"
                      >
                        <Instagram size={15} />
                      </a>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Dispatches Grid */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <Newspaper size={18} className="text-amber-500" />
              <h2 className="text-2xl font-black font-outfit text-zinc-900 dark:text-white tracking-tight">
                Dispatches by {user.fullName.split(" ")[0]}
              </h2>
            </div>

            {articlesLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {articles.map((item) => (
                  <ArticleCard
                    key={item._id}
                    article={{
                      id: item._id,
                      slug: item.slug,
                      title: item.title,
                      author: item.author?.fullName || user.fullName,
                      date: new Date(item.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      ),
                      imageUrl: item.image,
                      views: item.readCount,
                    }}
                    variant="vertical"
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-400 text-sm font-medium">
                This author has not published any dispatches yet.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
