"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAppSelector } from "@/lib/store/hooks";
import AuthModal from "./AuthModal";

const AuthPromptContext = createContext(null);

function currentReturnUrl() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function AuthPromptProvider({ children }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");

  const requireAuth = useCallback(() => {
    if (isAuthenticated) return true;
    setCallbackUrl(currentReturnUrl());
    setIsOpen(true);
    return false;
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({ isAuthenticated, requireAuth }),
    [isAuthenticated, requireAuth],
  );

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        defaultTab="signin"
        callbackUrl={callbackUrl}
        updateUrl={false}
      />
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error("useAuthPrompt must be used inside AuthPromptProvider");
  }
  return context;
}
