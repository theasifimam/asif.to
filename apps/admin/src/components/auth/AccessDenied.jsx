"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessDenied({ permission }) {
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <LockKeyhole size={24} />
        </div>
        <h1 className="mt-5 text-xl font-black text-zinc-950 dark:text-white">
          Access not available
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Your current role does not include permission to view or manage this
          area.
        </p>
        {permission && (
          <p className="mt-4 rounded-xl bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-500 dark:bg-zinc-950">
            Required: {permission}
          </p>
        )}
        <Button asChild className="mt-6">
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
