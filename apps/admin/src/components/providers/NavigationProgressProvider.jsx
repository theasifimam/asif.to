"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, speed: 300, minimum: 0.08 });

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(e) {
      const anchor = e.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("/") ||
        (href.startsWith(window.location.origin) &&
          href !== window.location.href)
      ) {
        NProgress.start();
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

export default function NavigationProgressProvider() {
  return (
    <>
      <style>{`
        #nprogress {
          pointer-events: none;
        }
        #nprogress .bar {
          background: var(--m3-primary, var(--accent, #2563eb));
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 10px var(--m3-primary, var(--accent, #2563eb)), 0 0 5px var(--m3-primary, var(--accent, #2563eb));
        }
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px var(--m3-primary, var(--accent, #2563eb)), 0 0 5px var(--m3-primary, var(--accent, #2563eb));
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }
      `}</style>
      <Suspense fallback={null}>
        <NavigationProgressInner />
      </Suspense>
    </>
  );
}
