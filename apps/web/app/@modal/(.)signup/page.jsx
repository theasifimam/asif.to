import { Suspense } from "react";
import InterceptedAuthModal from "@/components/auth/InterceptedAuthModal";

export default function InterceptedSignupPage() {
  return (
    <Suspense fallback={null}>
      <InterceptedAuthModal defaultTab="signup" />
    </Suspense>
  );
}
