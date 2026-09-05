import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 ${className}`}
    />
  );
}

export function CheatsheetReaderSkeleton() {
  return (
    <div
      className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950"
      role="status"
      aria-label="Loading cheatsheet"
    >
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-24 sm:px-6">
        <SkeletonBlock className="h-4 w-36 rounded-full" />
        <section className="mt-6 space-y-5 rounded-4xl bg-white p-7 dark:bg-zinc-900 sm:p-10">
          <SkeletonBlock className="h-7 w-40 rounded-full" />
          <SkeletonBlock className="h-10 w-4/5 sm:h-14" />
          <SkeletonBlock className="h-5 w-full max-w-2xl" />
          <SkeletonBlock className="h-5 w-2/3 max-w-xl" />
          <div className="flex gap-2 pt-2">
            <SkeletonBlock className="h-9 w-24 rounded-full" />
            <SkeletonBlock className="h-9 w-32 rounded-full" />
          </div>
        </section>
        <section className="mt-6 space-y-5 py-6 sm:py-10">
          <SkeletonBlock className="h-8 w-2/5" />
          {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-10/12"].map(
            (width, index) => (
              <SkeletonBlock key={index} className={`h-5 ${width}`} />
            ),
          )}
          <SkeletonBlock className="h-36 w-full rounded-2xl" />
          <SkeletonBlock className="h-8 w-1/2" />
          {["w-full", "w-5/6", "w-full", "w-3/4"].map((width, index) => (
            <SkeletonBlock key={index} className={`h-5 ${width}`} />
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function ChapterReaderSkeleton() {
  return (
    <div
      className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950"
      role="status"
      aria-label="Loading lesson"
    >
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-36 sm:pt-40 lg:pt-28 flex flex-col gap-3 sm:gap-6 pb-32 sm:pb-16">

        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-8 w-8 rounded-full" />
              <SkeletonBlock className="h-5 w-48 rounded-md hidden sm:block" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-4 w-32 rounded-md" />
              <SkeletonBlock className="hidden lg:block h-8 w-36 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 relative">
          <section className="flex flex-col gap-3 lg:col-span-8 xl:col-span-9 transition-all duration-300">

             {/* Top Quick Navigation Skeleton */}
             <SkeletonBlock className="h-12 w-full rounded-2xl" />

             {/* Main Document Card Skeleton */}
             <div className="flex flex-col gap-4 py-2 sm:gap-6 sm:py-10">
               <SkeletonBlock className="h-10 w-3/4" />
               {["w-full", "w-11/12", "w-full", "w-4/5", "w-full"].map((width, index) => (
                  <SkeletonBlock key={index} className={`h-5 ${width}`} />
               ))}
               <SkeletonBlock className="h-40 w-full rounded-2xl mt-4" />
               <SkeletonBlock className="h-8 w-1/2 mt-4" />
               {["w-full", "w-5/6", "w-full", "w-3/4"].map((width, index) => (
                 <SkeletonBlock key={index} className={`h-5 ${width}`} />
               ))}
             </div>
          </section>

          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 z-30">
            <div className="h-[calc(100vh-7.5rem)] flex flex-col gap-3 p-4 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/60 dark:border-zinc-800/60">
                <SkeletonBlock className="h-6 w-1/2 mb-2" />
                <SkeletonBlock className="h-8 w-full mb-4 rounded-xl" />
                <div className="space-y-2">
                  {[
                    "w-full",
                    "w-11/12",
                    "w-full",
                    "w-4/5",
                    "w-full",
                    "w-10/12",
                    "w-full",
                  ].map((width, index) => (
                    <SkeletonBlock key={index} className={`h-12 rounded-2xl ${width}`} />
                  ))}
                </div>
             </div>
          </aside>
        </div>
      </main>
      <Footer containerWidth="max-w-7xl" />
    </div>
  );
}
