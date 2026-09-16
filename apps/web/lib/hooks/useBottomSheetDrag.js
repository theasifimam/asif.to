"use client";

import { useState, useRef, useCallback } from "react";

export function useBottomSheetDrag({ onClose, threshold = 60 }) {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startStateRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    // Only primary pointer (left click or touch)
    if (e.button !== undefined && e.button !== 0) return;

    // Don't drag if interactive elements like buttons, inputs, links are clicked directly
    const target = e.target;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("[role='button']")
    ) {
      return;
    }

    startStateRef.current = {
      startY: e.clientY,
      startX: e.clientX,
      startTime: Date.now(),
      pointerId: e.pointerId,
    };
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!startStateRef.current) return;
    const deltaY = e.clientY - startStateRef.current.startY;
    const deltaX = e.clientX - startStateRef.current.startX;

    if (deltaY > 0) {
      setOffsetY(deltaY);
    } else if (deltaY < 0) {
      // Resistance going upwards
      setOffsetY(deltaY * 0.15);
    }
  }, []);

  const handlePointerUp = useCallback(
    (e) => {
      if (!startStateRef.current) return;
      const { startY, startX, startTime, pointerId } = startStateRef.current;
      startStateRef.current = null;

      try {
        if (e.currentTarget.hasPointerCapture(pointerId)) {
          e.currentTarget.releasePointerCapture(pointerId);
        }
      } catch (_) {}

      const deltaY = e.clientY - startY;
      const deltaX = e.clientX - startX;
      const dt = Math.max(1, Date.now() - startTime);
      const velocityY = deltaY / dt;

      setIsDragging(false);

      // Trigger close if dragged down past threshold OR fast downward flick
      const isSwipeDown =
        (deltaY > threshold && Math.abs(deltaX) < deltaY * 1.5) ||
        (velocityY > 0.35 && deltaY > 20);

      if (isSwipeDown) {
        setOffsetY(window.innerHeight || 600);
        setTimeout(() => {
          onClose();
          setOffsetY(0);
        }, 150);
      } else {
        setOffsetY(0);
      }
    },
    [onClose, threshold],
  );

  const handlePointerCancel = useCallback((e) => {
    if (!startStateRef.current) return;
    try {
      if (e.currentTarget.hasPointerCapture(startStateRef.current.pointerId)) {
        e.currentTarget.releasePointerCapture(startStateRef.current.pointerId);
      }
    } catch (_) {}
    startStateRef.current = null;
    setIsDragging(false);
    setOffsetY(0);
  }, []);

  const dragProps = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };

  const sheetStyle = {
    transform: offsetY ? `translateY(${offsetY}px)` : undefined,
    transition: isDragging
      ? "none"
      : "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return {
    dragProps,
    sheetStyle,
    isDragging,
  };
}
