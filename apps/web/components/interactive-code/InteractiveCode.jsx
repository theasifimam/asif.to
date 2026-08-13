"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const InteractiveCodeSandbox = dynamic(
  () => import("./InteractiveCodeSandbox"),
  {
    ssr: false,
    loading: () => <PlaygroundSkeleton label="Loading secure playground…" />,
  },
);

function PlaygroundSkeleton({
  label = "Playground ready when you scroll here",
}) {
  return (
    <div
      className="min-h-72 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      role="status"
    >
      <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mt-6 h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-950" />
      <p className="mt-4 text-xs font-semibold text-zinc-500">{label}</p>
    </div>
  );
}

export default function InteractiveCode(props) {
  const hostRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hostRef.current || visible) return;
    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={hostRef}>
      {visible ? <InteractiveCodeSandbox {...props} /> : <PlaygroundSkeleton />}
    </div>
  );
}
