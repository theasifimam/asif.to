import React from "react";
import { cn } from "@/lib/utils";






export const VerificationBadge = ({
  className,
  size = 16
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-[#E2FF54]", className)}>
      
      {/* Material Design Verified Badge */}
      <path
        d="M23 12l-2.44-2.79.34-3.69-3.61-.82-2.52-2.9L12 3.5 9.23 1.8 6.71 4.7l-3.61.81.34 3.69L1 12l2.44 2.79-.34 3.69 3.61.82 2.52 2.9L12 20.5l2.77 1.7 2.52-2.9 3.61-.81-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"
        fill="currentColor" />
      
    </svg>);

};