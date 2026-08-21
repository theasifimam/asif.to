"use client";

import Link from "next/link";
import { Code2 } from "lucide-react";

export default function FloatingPlayground() {
  return (
    <Link
      href="/run"
      className="fixed bottom-24 right-4 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-black text-white shadow-2xl shadow-blue-600/30 transition hover:-translate-y-1 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 sm:bottom-6 sm:right-6"
      aria-label="Open code playground page"
      title="Open code playground"
    >
      <Code2 className="h-5 w-5" />
      <span className="hidden sm:inline">Playground</span>
    </Link>
  );
}
