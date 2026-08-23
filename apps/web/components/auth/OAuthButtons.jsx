"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function OAuthButtons({ callbackUrl = "/" }) {
  const [pending, setPending] = useState("");
  const start = async (provider) => {
    setPending(provider);
    await signIn(provider, { redirectTo: callbackUrl });
    setPending("");
  };
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <ProviderButton
        label="Google"
        provider="google"
        pending={pending}
        onClick={start}
        icon={<GoogleIcon />}
      />
      <ProviderButton
        label="GitHub"
        provider="github"
        pending={pending}
        onClick={start}
        icon={<GitHubIcon />}
      />
    </div>
  );
}
function ProviderButton({ label, provider, pending, onClick, icon }) {
  const busy = Boolean(pending);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onClick(provider)}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-zinc-200/90 bg-white hover:bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 px-3 text-xs font-bold text-zinc-900 dark:text-white shadow-xs transition-all duration-150 disabled:cursor-wait disabled:opacity-60 active:scale-98 cursor-pointer"
    >
      {pending === provider ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      ) : (
        icon
      )}
      <span>{pending === provider ? "Connecting…" : label}</span>
    </button>
  );
}
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.86A6.01 6.01 0 0 1 6.08 12c0-.65.11-1.27.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.48l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5 fill-current shrink-0"
      aria-hidden="true"
    >
      <path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A10.95 10.95 0 0 1 12 6.32c.98 0 1.95.13 2.87.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.07.79 2.16v3.03c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}
