"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import AuthModal from "@/components/auth/AuthModal";

/**
 * Persistent bottom-sheet for intercepted auth routes.
 *
 * Lives in the @modal layout so the sheet stays mounted when the user
 * switches between /login and /signup - only the inner tab content changes.
 *
 * All URL-modifying functions in AuthCard are guarded by !isModal, so no
 * window.history.replaceState call can escape into the modal context.
 */
export default function InterceptedAuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isOpen, setIsOpen] = useState(true);

  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  // Check if current route is actually an auth route
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup");

  // Derive the initial tab from the intercepted route path.
  const defaultTab = pathname?.startsWith("/signup") ? "signup" : "signin";

  // Only open modal if on an auth route AND the user is NOT authenticated
  useEffect(() => {
    if (isAuthRoute && !isAuthenticated) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [pathname, isAuthRoute, isAuthenticated]);

  // Capture the safe back-URL once on mount (before any navigation happens).
  const [safeBackUrl] = useState(() => {
    if (typeof window === "undefined") return "/";
    try {
      const ref = document.referrer;
      if (!ref) return "/";
      const refUrl = new URL(ref);
      if (refUrl.origin !== window.location.origin) return "/";
      const path = refUrl.pathname + refUrl.search + refUrl.hash;
      if (
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/forgot-password")
      )
        return "/";
      return path || "/";
    } catch {
      return "/";
    }
  });

  const handleClose = () => {
    setIsOpen(false);
    if (!isAuthenticated) {
      setTimeout(() => {
        router.push(safeBackUrl);
      }, 120);
    }
  };

  if (isAuthenticated || !isAuthRoute) {
    return null;
  }

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      defaultTab={defaultTab}
      callbackUrl={callbackUrl}
      updateUrl={false}
    />
  );
}