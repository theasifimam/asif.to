"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCoursesScroll() {
  const coursesScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkCoursesScroll = useCallback(() => {
    if (!coursesScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = coursesScrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = coursesScrollRef.current;
    if (!el) return;
    checkCoursesScroll();
    el.addEventListener("scroll", checkCoursesScroll, { passive: true });
    window.addEventListener("resize", checkCoursesScroll);
    return () => {
      el.removeEventListener("scroll", checkCoursesScroll);
      window.removeEventListener("resize", checkCoursesScroll);
    };
  }, [checkCoursesScroll]);

  const scrollCourses = (direction) => {
    if (!coursesScrollRef.current) return;
    const { clientWidth } = coursesScrollRef.current;
    const scrollAmount = Math.max(260, clientWidth * 0.75);
    coursesScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return {
    coursesScrollRef,
    canScrollLeft,
    canScrollRight,
    scrollCourses,
  };
}
