"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, ShieldCheck, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";











export function NeoModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "default"
}) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // Wait for animation
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;
  if (!isVisible && !isOpen) return null;

  const accentColor =
  variant === "danger" ?
  "text-red-500" :
  variant === "warning" ?
  "text-amber-500" :
  variant === "success" ?
  "text-green-500" :
  "text-primary";

  const borderColor =
  variant === "danger" ?
  "border-red-500/20" :
  variant === "warning" ?
  "border-amber-500/20" :
  variant === "success" ?
  "border-green-500/20" :
  "border-zinc-200/50 dark:border-white/10";

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose} />
      

      {/* Content */}
      <div
        className={cn(
          "relative w-full max-w-lg bg-card/95 backdrop-blur-md rounded-[32px] border shadow-2xl transition-all duration-300 transform",
          borderColor,
          isOpen ?
          "scale-100 opacity-100 translate-y-0" :
          "scale-95 opacity-0 translate-y-4"
        )}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/20 transition-colors">
          
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-6">
            <div
              className={cn(
                "w-12 h-12 rounded-[16px] flex items-center justify-center mb-2 bg-muted/10",
                accentColor
              )}>
              
              {variant === "danger" ?
              <AlertTriangle className="w-6 h-6" /> :
              variant === "warning" ?
              <AlertTriangle className="w-6 h-6" /> :
              variant === "success" ?
              <CheckCircle className="w-6 h-6" /> :

              <ShieldCheck className="w-6 h-6" />
              }
            </div>
            <h3 className="heading-title text-2xl font-black uppercase tracking-[0.1em]">
              {title}
            </h3>
            {description &&
            <p className="text-sm font-medium text-muted-foreground">
                {description}
              </p>
            }
          </div>

          {/* Body */}
          <div className="mb-8">{children}</div>

          {/* Footer */}
          {footer &&
          <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
              {footer}
            </div>
          }
        </div>
      </div>
    </div>,
    document.body
  );
}