"use client";

import { useCallback, useRef, useState } from "react";

export default function useUndoRedo(initialValue) {
  const [present, setPresentState] = useState(initialValue);
  const past = useRef([]);
  const future = useRef([]);

  const setPresent = useCallback((nextValue) => {
    setPresentState((current) => {
      const next =
        typeof nextValue === "function" ? nextValue(current) : nextValue;

      if (JSON.stringify(next) === JSON.stringify(current)) return current;

      past.current.push(current);
      if (past.current.length > 60) past.current.shift();
      future.current = [];

      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPresentState((current) => {
      if (!past.current.length) return current;

      const previous = past.current.pop();
      future.current.push(current);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setPresentState((current) => {
      if (!future.current.length) return current;

      const next = future.current.pop();
      past.current.push(current);
      return next;
    });
  }, []);

  const reset = useCallback((value) => {
    past.current = [];
    future.current = [];
    setPresentState(value);
  }, []);

  return {
    present,
    setPresent,
    undo,
    redo,
    reset,
    get canUndo() {
      return past.current.length > 0;
    },
    get canRedo() {
      return future.current.length > 0;
    },
  };
}
