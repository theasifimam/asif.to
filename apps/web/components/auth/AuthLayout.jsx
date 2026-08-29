"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import LogoLoader from "@/components/ui/LogoLoader";

export default function AuthLayout({ children }) {
  const router = useRouter();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleDismiss = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LogoLoader className="h-10 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-md transition-all duration-300 font-sans cursor-pointer overflow-y-auto"
    >
      {/* Modal Container Card (Glassmorphism View) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md cursor-default my-auto"
      >
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              isModal: true,
              onClose: handleDismiss,
            })
          : children}
      </motion.div>
    </div>
  );
}
