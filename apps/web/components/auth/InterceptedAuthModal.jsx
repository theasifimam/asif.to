"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";

export default function InterceptedAuthModal({ defaultTab = "signin" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 120);
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      defaultTab={defaultTab}
      callbackUrl={callbackUrl}
      updateUrl={true}
    />
  );
}
