import { Suspense } from "react";
import InterceptedAuthModal from "@/components/auth/InterceptedAuthModal";

/**
 * Layout for the @modal parallel-route slot.
 *
 * Rendering the modal here — rather than inside each intercepted page — means
 * the bottom sheet stays mounted when the user switches between /login and
 * /signup.  The child pages ((.)login / (.)signup) return null; the modal
 * reads usePathname() to know which tab to show.
 */
export default function ModalLayout({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <InterceptedAuthModal />
      </Suspense>
      {/* children is null for both intercepted pages, kept for completeness */}
      {children}
    </>
  );
}
