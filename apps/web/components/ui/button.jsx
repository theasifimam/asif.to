"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import LogoLoader from "@/components/ui/LogoLoader";

const variantStyles = {
  default:
    "bg-blue-600 text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  outline:
    "border border-zinc-200/90 bg-white text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:border-zinc-700",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  destructive:
    "bg-rose-600 text-white shadow-xs hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500",
  link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
};

const sizeStyles = {
  default: "h-10 px-5 py-2 text-sm",
  sm: "h-8 px-3.5 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-9 w-9 shrink-0 p-0",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className = "",
} = {}) {
  const v = variantStyles[variant] || variantStyles.default;
  const s = sizeStyles[size] || sizeStyles.default;
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-200 ease-out active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    v,
    s,
    className
  );
}

const Button = forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const content = asChild ? (
      children
    ) : (
      <>
        {loading && <LogoLoader className="h-4 w-4" />}
        {children}
      </>
    );

    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
