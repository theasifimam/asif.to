"use client";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

export default function LegacySignIn() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full text-center text-xs font-bold text-zinc-500 hover:text-blue-600"
      >
        Use email and password instead
      </button>
      <AuthModal isOpen={open} onOpenChange={setOpen} defaultTab="signin" />
    </>
  );
}
