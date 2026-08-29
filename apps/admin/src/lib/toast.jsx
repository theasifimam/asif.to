"use client";

import React from "react";
import { toast as sonnerToast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import LogoLoader from "@/components/ui/LogoLoader";

/**
 * Variant configuration with distinctive icons and colors
 */
const VARIANTS = {
  success: {
    icon: CheckCircle2,
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    badgeBorder: "border-emerald-500/20 dark:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    dotColor: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    badgeBg: "bg-red-500/10 dark:bg-red-500/15",
    badgeBorder: "border-red-500/20 dark:border-red-500/30",
    iconColor: "text-red-600 dark:text-red-400",
    glow: "shadow-[0_0_12px_rgba(239,68,68,0.15)]",
    dotColor: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/15",
    badgeBorder: "border-amber-500/20 dark:border-amber-500/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    dotColor: "bg-amber-500",
  },
  info: {
    icon: Info,
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/15",
    badgeBorder: "border-blue-500/20 dark:border-blue-500/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    glow: "shadow-[0_0_12px_rgba(37,99,235,0.15)]",
    dotColor: "bg-blue-500",
  },
  loading: {
    icon: LogoLoader,
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/15",
    badgeBorder: "border-blue-500/20 dark:border-blue-500/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    glow: "shadow-[0_0_12px_rgba(37,99,235,0.15)]",
    dotColor: "bg-blue-500 animate-pulse",
  },
};

/**
 * Rich Toast Content Component
 */
function RichToastCard({
  t,
  title,
  description,
  variant = "info",
  avatar = null,
  image = null,
  action = null,
  cancel = null,
}) {
  const config = VARIANTS[variant] || VARIANTS.info;
  const IconComponent = config.icon;
  const mediaSrc = avatar || image;

  return (
    <div className="admin-rich-toast flex w-full max-w-sm items-start gap-3.5 rounded-2xl border border-zinc-200/90 bg-white p-3.5 text-left shadow-xl shadow-zinc-950/10 backdrop-blur-xl dark:border-zinc-800 dark:bg-[#121215] dark:shadow-black/60 select-none">
      {/* Left Column: Avatar/Image or Colored Icon Badge */}
      {mediaSrc ? (
        <div className="relative shrink-0 mt-0.5">
          <div className="h-10 w-10 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/80 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaSrc}
              alt={title || "Notification"}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          {/* Mini Status Dot Badge */}
          <span
            className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-[#121215] ${config.badgeBg} ${config.iconColor}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
          </span>
        </div>
      ) : (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${config.badgeBg} ${config.badgeBorder} ${config.iconColor} ${config.glow} mt-0.5`}
        >
          <IconComponent className="h-4.5 w-4.5" />
        </div>
      )}

      {/* Middle Column: Title & Description */}
      <div className="flex min-w-0 flex-1 flex-col pt-0.5">
        {title && (
          <h4 className="font-outfit text-[13.5px] font-bold tracking-tight text-foreground leading-snug">
            {title}
          </h4>
        )}
        {description && (
          <p className="font-sans text-[11.5px] font-medium text-muted-foreground/90 leading-relaxed mt-0.5 line-clamp-3">
            {description}
          </p>
        )}

        {/* Optional Action Buttons */}
        {(action || cancel) && (
          <div className="mt-2.5 flex items-center gap-2">
            {action && (
              <button
                type="button"
                onClick={(e) => {
                  action.onClick?.(e);
                  sonnerToast.dismiss(t);
                }}
                className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-blue-500 active:scale-95 cursor-pointer"
              >
                {action.label}
              </button>
            )}
            {cancel && (
              <button
                type="button"
                onClick={(e) => {
                  cancel.onClick?.(e);
                  sonnerToast.dismiss(t);
                }}
                className="rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer"
              >
                {cancel.label || "Dismiss"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Subtle Dismiss Button */}
      <button
        type="button"
        onClick={() => sonnerToast.dismiss(t)}
        className="shrink-0 -mr-1 -mt-0.5 rounded-lg p-1 text-muted-foreground/60 transition hover:bg-muted/30 hover:text-foreground active:scale-95 cursor-pointer"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * Enhanced Toast Dispatcher
 */
function createToastMethod(variant) {
  return (titleOrOptions, options = {}) => {
    let title = "";
    let opts = options;

    if (typeof titleOrOptions === "string" || React.isValidElement(titleOrOptions)) {
      title = titleOrOptions;
    } else if (titleOrOptions && typeof titleOrOptions === "object") {
      title = titleOrOptions.title || "";
      opts = { ...titleOrOptions, ...options };
    }

    const { description, avatar, image, action, cancel, duration, id } = opts;

    // If rich properties are provided (avatar, image, custom action, or explicit rich mode), render RichToastCard
    if (avatar || image || action || cancel || description) {
      return sonnerToast.custom(
        (t) => (
          <RichToastCard
            t={t}
            title={title}
            description={description}
            variant={variant}
            avatar={avatar}
            image={image}
            action={action}
            cancel={cancel}
          />
        ),
        { duration, id }
      );
    }

    // Standard sonner call with styled title
    return sonnerToast[variant](title, opts);
  };
}

export const toast = Object.assign(
  (title, options) => createToastMethod("info")(title, options),
  {
    success: createToastMethod("success"),
    error: createToastMethod("error"),
    warning: createToastMethod("warning"),
    info: createToastMethod("info"),
    loading: createToastMethod("loading"),
    promise: sonnerToast.promise,
    dismiss: sonnerToast.dismiss,
    custom: sonnerToast.custom,
  }
);

export default toast;
