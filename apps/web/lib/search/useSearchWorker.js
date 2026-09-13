"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function useSearchWorker(items, query) {
  const workerRef = useRef(null);
  const requestId = useRef(0);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let worker;
    let active = true;
    const fail = () => setError("Search is temporarily unavailable. Please reopen search to retry.");
    try {
      worker = new Worker(new URL("./search.worker.js", import.meta.url), { type: "module" });
      workerRef.current = worker;
      worker.onmessage = ({ data }) => {
        if (active && data.id === requestId.current) {
          setResponse({ ...data, items });
          setError("");
        }
      };
      worker.onerror = fail;
      worker.postMessage({ type: "index", items });
    } catch {
      fail();
    }
    return () => {
      active = false;
      worker?.terminate();
      workerRef.current = null;
    };
  }, [items]);

  useEffect(() => {
    const id = ++requestId.current;
    // The input updates immediately; only background searches are debounced.
    const timer = setTimeout(() => {
      workerRef.current?.postMessage({ type: "query", id, query });
    }, query.trim() ? 80 : 0);
    return () => clearTimeout(timer);
  }, [items, query]);

  const results = useMemo(() => {
    if (response?.items !== items) return [];
    const byId = new Map(items.map((item) => [item.id, item]));
    return response.matches.flatMap(({ id, score }) => byId.has(id) ? [{ ...byId.get(id), score }] : []);
  }, [items, response]);

  // Keep previous results visible while searching, but mark them as stale.
  return { results, resultQuery: response?.query || "", searching: Boolean(query.trim()) && (response?.query !== query || response?.items !== items), error };
}
