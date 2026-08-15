import { Suspense } from "react";
import InterceptedAuthModal from "@/components/auth/InterceptedAuthModal";

export default function InterceptedLoginPage() {
  return (
    <Suspense fallback={null}>
      <InterceptedAuthModal defaultTab="signin" />
    </Suspense>
  );
}
