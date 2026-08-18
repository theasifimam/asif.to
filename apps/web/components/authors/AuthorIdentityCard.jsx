import Image from "next/image";
import Link from "next/link";
import { CalendarDays, RefreshCw, UserRound } from "lucide-react";
import { authorIdentity } from "@/lib/authorIdentity";
import { assetUrl } from "@/lib/seo";

const dateText = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not recorded";

function resolveAuthorData(author, explicitAvatar) {
  if (!author) {
    return {
      name: authorIdentity.name || "Asif Imam",
      username: "asif",
      role: authorIdentity.role || "Full-Stack JavaScript Developer",
      bio: authorIdentity.shortBio || "",
      avatar: explicitAvatar || null,
      profileUrl: "/author/asif",
    };
  }

  if (typeof author === "string") {
    const isAsif =
      author.toLowerCase() === "asif" || author.toLowerCase() === "asif imam";
    const username = isAsif ? "asif" : author.toLowerCase().replace(/\s+/g, "");
    return {
      name: isAsif ? authorIdentity.name || "Asif Imam" : author,
      username,
      role: isAsif
        ? authorIdentity.role || "Full-Stack JavaScript Developer"
        : "Content Author & Contributor",
      bio: isAsif ? authorIdentity.shortBio : "",
      avatar: explicitAvatar || null,
      profileUrl: username ? `/author/${encodeURIComponent(username)}` : null,
    };
  }

  const name =
    author.fullName ||
    author.name ||
    (author.username ? author.username : authorIdentity.name || "Asif Imam");

  const isAsif =
    name.toLowerCase() === "asif" ||
    name.toLowerCase() === "asif imam" ||
    author.username?.toLowerCase() === "asif";

  const username = author.username || (isAsif ? "asif" : "");

  const role =
    author.role ||
    author.jobTitle ||
    author.headline ||
    (isAsif
      ? authorIdentity.role || "Full-Stack JavaScript Developer"
      : "Author & Contributor");

  const bio =
    author.bio ||
    author.shortBio ||
    (isAsif ? authorIdentity.shortBio : "");

  const resolvedAvatar = explicitAvatar || author.avatar || author.image || null;

  const profileUrl =
    author.url ||
    (username ? `/author/${encodeURIComponent(username)}` : null);

  return {
    name,
    username,
    role,
    bio,
    avatar: resolvedAvatar,
    profileUrl,
  };
}

export default function AuthorIdentityCard({
  author,
  publishedAt,
  updatedAt,
  avatar,
  compact = false,
  label = "Written and maintained by",
  className = "",
}) {
  const authorData = resolveAuthorData(author, avatar);
  const avatarSrc = authorData.avatar ? assetUrl(authorData.avatar) : null;

  const meaningfulUpdate =
    updatedAt &&
    (!publishedAt ||
      new Date(updatedAt).getTime() - new Date(publishedAt).getTime() > 60000);

  const avatarElement = (
    <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={authorData.name}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <UserRound className="h-6 w-6" />
      )}
    </div>
  );

  return (
    <aside
      className={`rounded-4xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${compact ? "p-4" : "p-5 sm:p-6"} ${className}`.trim()}
      aria-label={`About the author: ${authorData.name}`}
    >
      <div className="flex items-start gap-4">
        {authorData.profileUrl ? (
          <Link
            href={authorData.profileUrl}
            className="group shrink-0"
            aria-label={`View ${authorData.name}'s profile`}
          >
            {avatarElement}
          </Link>
        ) : (
          avatarElement
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600 dark:text-blue-400">
            {label}
          </p>

          {authorData.profileUrl ? (
            <Link
              href={authorData.profileUrl}
              className="mt-1 inline-flex flex-wrap items-baseline gap-2 group hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <strong className="text-base text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-bold">
                {authorData.name}
              </strong>
              {authorData.role && (
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {authorData.role}
                </span>
              )}
            </Link>
          ) : (
            <div className="mt-1 inline-flex flex-wrap items-baseline gap-2">
              <strong className="text-base text-zinc-900 dark:text-white font-bold">
                {authorData.name}
              </strong>
              {authorData.role && (
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {authorData.role}
                </span>
              )}
            </div>
          )}

          {!compact && authorData.bio && (
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
              {authorData.bio}
            </p>
          )}

          {(publishedAt || meaningfulUpdate) && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-zinc-400">
              {publishedAt && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> Published{" "}
                  {dateText(publishedAt)}
                </span>
              )}
              {meaningfulUpdate && (
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Updated {dateText(updatedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

