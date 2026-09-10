import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Github,
  Globe,
  Linkedin,
  MapPin,
  RefreshCw,
  Twitter,
  UserRound,
} from "lucide-react";
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

function isHexObjectId(value) {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value.trim());
}

const SYSTEM_AUTH_ROLES = new Set([
  "admin",
  "super_admin",
  "superadmin",
  "super-admin",
  "editor",
  "reader",
  "user",
  "author",
  "member",
]);

function isSystemAuthRole(value) {
  if (!value || typeof value !== "string") return false;
  return SYSTEM_AUTH_ROLES.has(value.trim().toLowerCase());
}

function isDefaultOrFullStack(r) {
  if (!r || typeof r !== "string") return false;
  const clean = r.toLowerCase().replace(/[^a-z]/g, "");
  return (
    clean === "fullstackjavascriptdeveloper" ||
    clean === "fullstackdeveloper" ||
    clean === "javascriptdeveloper"
  );
}

function resolveAuthorData(author, explicitAvatar) {
  if (!author) {
    return {
      name: authorIdentity.name || "Asif Imam",
      username: "asif",
      role: "",
      bio: authorIdentity.shortBio || "",
      location: "",
      socials: {
        github: "https://github.com/theasifimam",
        linkedin: "",
        twitter: "",
        website: "",
      },
      avatar: explicitAvatar || authorIdentity.image || null,
      profileUrl: "/asif",
    };
  }

  if (typeof author === "string") {
    const trimmed = author.trim();
    if (isHexObjectId(trimmed)) {
      return {
        name: authorIdentity.name || "Asif Imam",
        username: "asif",
        role: "",
        bio: authorIdentity.shortBio || "",
        location: "",
        socials: {
          github: "https://github.com/theasifimam",
          linkedin: "",
          twitter: "",
          website: "",
        },
        avatar: explicitAvatar || authorIdentity.image || null,
        profileUrl: "/asif",
      };
    }
    const isAsif =
      trimmed.toLowerCase() === "asif" || trimmed.toLowerCase() === "asif imam";
    const username = isAsif ? "asif" : trimmed.toLowerCase().replace(/\s+/g, "");
    return {
      name: isAsif ? authorIdentity.name || "Asif Imam" : trimmed,
      username,
      role: "",
      bio: isAsif ? authorIdentity.shortBio : "",
      location: "",
      socials: isAsif
        ? {
            github: "https://github.com/theasifimam",
            linkedin: "",
            twitter: "",
            website: "",
          }
        : {},
      avatar: explicitAvatar || (isAsif ? authorIdentity.image : null) || null,
      profileUrl: isAsif ? "/asif" : username ? `/author/${encodeURIComponent(username)}` : null,
    };
  }

  const rawName = author.fullName || author.name || author.username;
  const validName =
    rawName && !isHexObjectId(rawName) ? String(rawName).trim() : null;
  const name = validName || authorIdentity.name || "Asif Imam";

  const rawUsername = author.username;
  const validUsername =
    rawUsername && !isHexObjectId(rawUsername)
      ? String(rawUsername).trim()
      : null;

  const isAsif =
    !validName ||
    name.toLowerCase() === "asif" ||
    name.toLowerCase() === "asif imam" ||
    validUsername?.toLowerCase() === "asif";

  const username = isAsif
    ? "asif"
    : validUsername || name.toLowerCase().replace(/\s+/g, "");

  const customRole =
    author.jobTitle ||
    author.headline ||
    (author.role && !isSystemAuthRole(author.role) ? author.role : null);

  const role =
    customRole && !isDefaultOrFullStack(customRole)
      ? customRole
      : "";

  const bio =
    author.bio ||
    author.shortBio ||
    (isAsif ? authorIdentity.shortBio : "");

  const location = author.location || "";

  const rawSocials =
    typeof author.socials === "string"
      ? (() => {
          try {
            return JSON.parse(author.socials);
          } catch {
            return {};
          }
        })()
      : author.socials || {};

  const cleanSocialUrl = (val, prefix) => {
    if (!val) return "";
    const s = String(val).trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    return `${prefix}${s.replace(/^@/, "")}`;
  };

  const socials = {
    website: rawSocials.website
      ? /^https?:\/\//i.test(rawSocials.website)
        ? rawSocials.website
        : `https://${rawSocials.website}`
      : "",
    twitter: cleanSocialUrl(rawSocials.twitter, "https://x.com/"),
    linkedin: cleanSocialUrl(
      rawSocials.linkedin,
      "https://www.linkedin.com/in/",
    ),
    github:
      cleanSocialUrl(rawSocials.github, "https://github.com/") ||
      (isAsif ? "https://github.com/theasifimam" : ""),
  };

  const isDefaultUiAvatar =
    typeof author.avatar === "string" &&
    author.avatar.includes("ui-avatars.com/api/?name=User");

  const resolvedAvatar =
    explicitAvatar ||
    (!isDefaultUiAvatar && author.avatar) ||
    author.image ||
    (isAsif ? authorIdentity.image : null) ||
    (author.avatar && !isDefaultUiAvatar ? author.avatar : null);

  const profileUrl =
    author.url ||
    (isAsif ? "/asif" : username ? `/author/${encodeURIComponent(username)}` : null);

  return {
    name,
    username,
    role,
    bio,
    location,
    socials,
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

  const hasSocials =
    authorData.socials &&
    (authorData.socials.github ||
      authorData.socials.linkedin ||
      authorData.socials.twitter ||
      authorData.socials.website);

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
      className={`rounded-4xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${compact ? "p-4 sm:p-5" : "p-5 sm:p-6"} ${className}`.trim()}
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
              className="mt-1 block group hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <strong className="text-base text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-bold block leading-snug">
                {authorData.name}
              </strong>
              {authorData.role && (
                <span className="mt-0.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {authorData.role}
                </span>
              )}
            </Link>
          ) : (
            <div className="mt-1 block">
              <strong className="text-base text-zinc-900 dark:text-white font-bold block leading-snug">
                {authorData.name}
              </strong>
              {authorData.role && (
                <span className="mt-0.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {authorData.role}
                </span>
              )}
            </div>
          )}

          {authorData.bio && (
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
              {authorData.bio}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-zinc-400">
            {authorData.location && (
              <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3 w-3 text-blue-500" />
                {authorData.location}
              </span>
            )}
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
            {hasSocials && (
              <div className="flex items-center gap-2 sm:ml-auto">
                {authorData.socials.github && (
                  <a
                    href={authorData.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="h-3.5 w-3.5" />
                  </a>
                )}
                {authorData.socials.linkedin && (
                  <a
                    href={authorData.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-blue-600 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                )}
                {authorData.socials.twitter && (
                  <a
                    href={authorData.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-sky-500 transition-colors"
                    title="Twitter / X Profile"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                  </a>
                )}
                {authorData.socials.website && (
                  <a
                    href={authorData.socials.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-blue-600 transition-colors"
                    title="Personal Website"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

