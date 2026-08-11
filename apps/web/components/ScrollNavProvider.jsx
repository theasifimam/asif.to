"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

const ScrollNavContext = createContext(true);

const SCROLL_THRESHOLD = 5;

function getScrollY() {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

export function ScrollNavProvider({ children }) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = getScrollY();
      const scrollDelta = currentScrollY - lastScrollY.current;
      if (currentScrollY <= 16) {
        setIsVisible(true);
      } else if (scrollDelta > SCROLL_THRESHOLD) {
        setIsVisible(false);
      } else if (scrollDelta < -SCROLL_THRESHOLD) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(updateVisibility);
      }
    };

    lastScrollY.current = getScrollY();
    setIsVisible(true);

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  return (
    <ScrollNavContext.Provider value={isVisible}>
      {children}
    </ScrollNavContext.Provider>
  );
}

export function useScrollNavVisible() {
  return useContext(ScrollNavContext);
}
