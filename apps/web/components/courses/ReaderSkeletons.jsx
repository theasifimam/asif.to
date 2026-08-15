import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 ${className}`} />;
}

export function CheatsheetReaderSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950" role="status" aria-label="Loading cheatsheet">
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
          {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-10/12"].map((width, index) => (
            <SkeletonBlock key={index} className={`h-5 ${width}`} />
          ))}
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" role="status" aria-label="Loading lesson">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-3 pb-24 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <SkeletonBlock className="h-4 w-32 rounded-full" />
          <SkeletonBlock className="h-9 w-28 rounded-full" />
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden space-y-4 lg:block">
            <SkeletonBlock className="h-8 w-3/5" />
            {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-10/12", "w-full"].map((width, index) => (
              <SkeletonBlock key={index} className={`h-12 ${width}`} />
            ))}
          </aside>
          <section className="min-w-0 space-y-6">
            <SkeletonBlock className="h-24 w-full rounded-2xl sm:h-32 sm:rounded-3xl" />
            <div className="space-y-5 py-2 sm:py-10">
              <SkeletonBlock className="h-9 w-3/4" />
              {["w-full", "w-11/12", "w-full", "w-4/5", "w-full"].map((width, index) => (
                <SkeletonBlock key={index} className={`h-5 ${width}`} />
              ))}
              <SkeletonBlock className="h-40 w-full rounded-2xl" />
              <SkeletonBlock className="h-8 w-1/2" />
              {["w-full", "w-5/6", "w-full", "w-3/4"].map((width, index) => (
                <SkeletonBlock key={index} className={`h-5 ${width}`} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
