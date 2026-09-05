"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const TRACE_PATH =
  "M305 293 C292 307 273 318 250 318 C214 318 184 290 182 255 C180 220 205 190 240 180 C275 170 310 190 322 225 L347 315 C330 340 305 359 275 370 C220 390 160 365 130 310 C105 260 110 200 150 160 C190 120 250 110 300 145 C336 170 350 210 360 250 C370 290 380 330 390 365";

/** Muted asif.to mark that fills along its continuous line in a loop. */
export default function LogoLoader({ className, size, label = "Loading" }) {
  const maskId = `asif-loader-${useId().replaceAll(":", "")}`;
  const dimensions = size ? { width: size, height: size } : undefined;

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex h-5 w-5 shrink-0 align-middle", className)}
      style={dimensions}
    >
      <svg viewBox="0 0 500 500" className="h-full w-full" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <path
              className="asif-logo-trace"
              d={TRACE_PATH}
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="90"
            />
          </mask>
          <filter id={`${maskId}-muted`}>
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.45  0 0 0 0 0.48  0 0 0 0 0.53  0 0 0 1 0"
            />
          </filter>
        </defs>
        <image href="/logo.png" width="500" height="500" opacity="0.24" filter={`url(#${maskId}-muted)`} />
        <image href="/logo.png" width="500" height="500" mask={`url(#${maskId})`} />
      </svg>

      <style jsx>{`
        .asif-logo-trace {
          stroke-dasharray: 1300;
          stroke-dashoffset: 1300;
          animation: asif-logo-fill 1.9s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        @keyframes asif-logo-fill {
          0% { stroke-dashoffset: 1300; }
          72%, 88% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1300; }
        }
        @media (prefers-reduced-motion: reduce) {
          .asif-logo-trace { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
    </span>
  );
}
