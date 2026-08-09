import { cn } from "@/lib/utils";
import { LabelHTMLAttributes, forwardRef } from "react";





/**
 * Label - Form label component
 */
const Label = forwardRef(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}>
        
        {children}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>);

  }
);

Label.displayName = "Label";

export { Label };