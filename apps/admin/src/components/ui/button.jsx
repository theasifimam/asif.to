import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

/**
 * Button variants for Soft Neo-Bento design
 * - No borders
 * - Rounded corners (16px)
 * - Smooth transitions
 */
const buttonVariants = cva(
  [
  "inline-flex items-center justify-center gap-2",
  "rounded-full",
  "font-semibold",
  "transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-200 ease-out",
  "active:scale-[0.985]",
  "disabled:pointer-events-none disabled:opacity-50",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"],

  {
    variants: {
      variant: {
        default: [
        "bg-primary text-primary-foreground",
        "shadow-sm shadow-blue-600/10 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/15"],

        secondary: [
        "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        "hover:bg-zinc-200 dark:hover:bg-zinc-700"],

        ghost: ["text-foreground", "hover:bg-muted"],
        destructive: [
        "bg-destructive text-destructive-foreground",
        "hover:bg-destructive/90"],

        outline: [
        "bg-white text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
        "border border-zinc-200/90 dark:border-zinc-800",
        "shadow-xs hover:bg-zinc-50 hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-700"],

        link: ["text-primary underline-offset-4", "hover:underline"],
        tactical: [
        "bg-white text-black font-black uppercase tracking-[0.3em] text-[11px]",
        "hover:bg-blue-50 active:scale-[0.98]",
        "rounded-lg shadow-lg shadow-black/5"]

      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-7 py-3 text-base",
        icon: "h-10 w-10 shrink-0 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);









/**
 * Button - Soft Neo-Bento styled button component
 */
const Button = forwardRef(
  (
  { className, variant, size, loading, children, disabled, asChild = false, ...props },
  ref) =>
  {
    const Comp = asChild ? Slot : "button";

    const content = asChild ? children :
    <>
        {loading &&
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">
        
            <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4" />
        
            <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        
          </svg>
      }
        {children}
      </>;


    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}>
        
        {content}
      </Comp>);

  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
