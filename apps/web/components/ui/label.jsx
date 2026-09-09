import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-xs font-bold leading-none select-none text-zinc-900 dark:text-zinc-100",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
