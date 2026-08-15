"use client";

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
  const handleOpenChange = (open) => {
    if (!open) {
      if (onClose) onClose();
      if (onOpenChange) onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
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
                className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-200"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] sm:w-full max-w-[460px] z-201 outline-none"
              >
                <AuthCard
                  defaultTab={defaultTab}
                  callbackUrl={callbackUrl}
                  onClose={handleClose}
                  isModal={true}
                  updateUrl={updateUrl}
                />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
