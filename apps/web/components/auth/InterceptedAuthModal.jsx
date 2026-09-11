"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  const [isOpen, setIsOpen] = useState(true);

  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  // Derive the initial tab from the intercepted route path.
  // After mount, AuthCard owns the active tab via its own state.
  const defaultTab = pathname?.startsWith("/signup") ? "signup" : "signin";

  // Re-open the sheet if the user navigates back to an auth route after
  // having dismissed it (edge-case guard).
  useEffect(() => {
    setIsOpen(true);
  }, [pathname]);

  // Capture the safe back-URL once on mount (before any navigation happens).
  // We use router.push(safeBackUrl) instead of router.back() to avoid
  // accidentally navigating the user to an external website.
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
    setTimeout(() => {
      router.push(safeBackUrl);
    }, 120);
  };

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