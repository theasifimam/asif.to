"use client";

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import AuthCard from "./AuthCard";

export default function AuthModal({
  isOpen,
  onOpenChange,
  onClose,
  defaultTab = "signin",
  callbackUrl = "/",
  updateUrl = true,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-md z-200"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 z-201 flex items-end sm:items-center justify-center pointer-events-none p-0 sm:p-4">
                <motion.div
                  drag={isMobile ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.05, bottom: 0.8 }}
                  dragSnapToOrigin={true}
                  onDragEnd={(_, info) => {
                    if (
                      isMobile &&
                      (info.offset.y > 75 || info.velocity.y > 200)
                    ) {
                      handleClose();
                    }
                  }}
                  initial={
                    isMobile
                      ? { y: "100%", opacity: 0 }
                      : { opacity: 0, scale: 0.95, y: 16 }
                  }
                  animate={
                    isMobile
                      ? { y: 0, opacity: 1 }
                      : { opacity: 1, scale: 1, y: 0 }
                  }
                  exit={
                    isMobile
                      ? { y: "100%", opacity: 0 }
                      : { opacity: 0, scale: 0.95, y: 16 }
                  }
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="w-full max-w-[460px] outline-none touch-pan-y pointer-events-auto"
                >
                  <AuthCard
                    defaultTab={defaultTab}
                    callbackUrl={callbackUrl}
                    onClose={handleClose}
                    isModal={true}
                    updateUrl={updateUrl}
                  />
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
