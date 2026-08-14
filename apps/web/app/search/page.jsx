import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchPageClient from "@/components/search/SearchPageClient";

export const metadata = { title: "Search", description: "Search all asif.to courses, tutorials, interview questions, cheatsheets, and coding practice." };

export default function SearchPage() {
  return <div className="min-h-screen bg-background text-foreground"><Header /><main className="mx-auto min-h-[75vh] max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
    <Suspense fallback={<div className="h-56 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900" />}><SearchPageClient /></Suspense>
  </main><Footer /></div>;
}
