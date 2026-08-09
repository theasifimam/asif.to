import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";





/**
 * Input - Soft Neo-Bento styled input component
 *
 * Features:
 * - Pill-shaped "pod" design (14px radius)
 * - No visible borders
 * - Soft background
 */
const Input = forwardRef(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles - pill-shaped pod
          "flex h-12 w-full rounded-[14px] px-4 py-3",
          "bg-input",
          "text-sm text-foreground placeholder:text-muted-foreground",
          // Focus state
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Error state
          error &&
          "ring-2 ring-destructive ring-offset-2 ring-offset-background",
          // Transitions
          "transition-smooth",
          className
        )}
        ref={ref}
        {...props} />);


  }
);

Input.displayName = "Input";

export { Input };