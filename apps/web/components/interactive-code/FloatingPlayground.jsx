"use client";

import Link from "next/link";
import { Code2 } from "lucide-react";

export default function FloatingPlayground() {
  return (
    <Link
      href="/run"
      className="hidden sm:inline-flex fixed bottom-6 right-6 z-40 h-12 items-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-black text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
      aria-label="Open code playground page"
      title="Open code playground"
    >
      <Code2 className="h-4 w-4" />
      <span>Playground</span>
    </Link>
  );
}

