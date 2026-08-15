import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchPageClient from "@/components/search/SearchPageClient";

export const metadata = { title: "Search", description: "Search all asif.to courses, tutorials, interview questions, cheatsheets, and coding practice." };

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 mx-auto min-h-[75vh] w-full max-w-5xl px-4 sm:px-6 pb-24 pt-24 sm:pt-28">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-4xl bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60" />}>
          <SearchPageClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
