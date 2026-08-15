"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setOAuthCredentials } from "@/lib/store/authSlice";

export default function AuthBridge({ children }) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const [oauthReady, setOauthReady] = useState(false);

  useEffect(() => {
    if (status === "loading" || !session?.user) return;

    let active = true;
    fetch("/api/auth/backend-session", {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((result) => {
        if (active && result.user)
          dispatch(setOAuthCredentials({ user: result.user }));
      })
      .catch(() => signOut({ redirectTo: "/login" }))
      .finally(() => {
        if (active) setOauthReady(true);
      });
    return () => {
      active = false;
    };
  }, [session, status, dispatch]);

  const ready = status !== "loading" && (!session?.user || oauthReady);

  if (!ready)
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
      </div>
    );
  return children;
}
