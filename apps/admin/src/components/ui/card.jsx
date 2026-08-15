import { cn } from "@/lib/utils";
import { forwardRef } from "react";

/**
 * Card - Soft Neo-Bento styled card component
 *
 * Features:
 * - Hyper-rounded corners (24px)
 * - Soft shadow
 * - No borders
 */
const Card = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[24px] border border-zinc-200/80 bg-card text-card-foreground shadow-[0_1px_2px_rgba(24,24,27,0.025),0_12px_32px_-24px_rgba(24,24,27,0.2)] dark:border-zinc-800/80",
          className
        )}
        {...props} />);


  }
);
Card.displayName = "Card";

const CardHeader = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props} />);


  }
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-base font-bold tracking-tight text-zinc-950 dark:text-zinc-50",
          className
        )}
        {...props} />);


  });
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(


  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props} />);


  });
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />;
  }
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props} />);


  }
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter };
