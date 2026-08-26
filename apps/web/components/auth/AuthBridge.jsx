"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setOAuthCredentials } from "@/lib/store/authSlice";
import { RefreshCw } from "lucide-react";

export default function AuthBridge({ children }) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const [oauthReady, setOauthReady] = useState(false);
  const [bridgeError, setBridgeError] = useState(false);

  useEffect(() => {
    if (status === "loading" || !session?.user) return;

    let cancelled = false;
    setBridgeError(false);
    setOauthReady(false);

    fetch("/api/auth/backend-session", {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (cancelled) return;
        // 401 means the session was explicitly revoked server-side → force re-auth
        if (response.status === 401) {
          await signOut({ redirectTo: "/login" });
          return;
        }
        if (!response.ok) throw new Error(`status ${response.status}`);
        const result = await response.json();
        if (result.user) dispatch(setOAuthCredentials({ user: result.user }));
        setOauthReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        // Retry once after 1.5 s before giving up
        setTimeout(async () => {
          if (cancelled) return;
          try {
            const retryRes = await fetch("/api/auth/backend-session", {
              method: "POST",
              credentials: "include",
            });
            if (retryRes.status === 401) {
              await signOut({ redirectTo: "/login" });
              return;
            }
            if (!retryRes.ok) throw new Error();
            const result = await retryRes.json();
            if (result.user)
              dispatch(setOAuthCredentials({ user: result.user }));
          } catch {
            // Give up — show inline error; do NOT destroy the NextAuth session
            if (!cancelled) setBridgeError(true);
          } finally {
            if (!cancelled) setOauthReady(true);
          }
        }, 1500);
      });

    return () => {
      cancelled = true;
    };
  }, [session, status, dispatch]);

  const ready = status !== "loading" && (!session?.user || oauthReady);

  if (!ready)
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
      </div>
    );

  if (bridgeError)
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
            <RefreshCw size={22} className="text-red-500" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">
              Connection problem
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Could not reach the server. Check your connection and try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return children;
}
