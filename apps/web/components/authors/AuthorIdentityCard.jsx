import Image from "next/image";
import Link from "next/link";
import { CalendarDays, RefreshCw, UserRound } from "lucide-react";
import { authorIdentity } from "@/lib/authorIdentity";
import { assetUrl } from "@/lib/seo";

const dateText = (value) => value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not recorded";

export default function AuthorIdentityCard({ publishedAt, updatedAt, avatar, compact = false }) {
  const meaningfulUpdate = updatedAt && (!publishedAt || new Date(updatedAt).getTime() - new Date(publishedAt).getTime() > 60000);
  return <aside className={`rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${compact ? "p-4" : "p-5 sm:p-6"}`} aria-label="About the author">
    <div className="flex items-start gap-4">
      <Link href="/author/asif" className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-blue-600 text-white">
        {avatar ? <Image src={assetUrl(avatar)} alt="Asif" fill className="object-cover" unoptimized /> : <UserRound className="h-6 w-6" />}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">Written and maintained by</p>
        <Link href="/author/asif" className="mt-1 inline-flex flex-wrap items-baseline gap-2 hover:text-blue-600"><strong className="text-base">Asif</strong><span className="text-xs font-semibold text-zinc-500">Full-Stack JavaScript Developer</span></Link>
        {!compact && <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{authorIdentity.shortBio}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-zinc-400">
          {publishedAt && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3"/> Published {dateText(publishedAt)}</span>}
          {meaningfulUpdate && <span className="inline-flex items-center gap-1"><RefreshCw className="h-3 w-3"/> Updated {dateText(updatedAt)}</span>}
        </div>
      </div>
    </div>
  </aside>;
}
