"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "./job-sheet.css";

const JobDetailSheet = dynamic(() => import("./JobDetailSheet"), { ssr: false });
const JobSheetContext = createContext(null);

export const useJobSheet = () => useContext(JobSheetContext);

export default function JobSheetProvider({ children }) {
  const [selection, setSelection] = useState(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const restore = () => {
      const slug = new URL(window.location.href).searchParams.get("job");
      setSelection((current) => slug ? current?.slug === slug ? current : { slug } : null);
    };
    const initial = window.setTimeout(restore, 0);
    window.addEventListener("popstate", restore);
    return () => { window.clearTimeout(initial); window.removeEventListener("popstate", restore); };
  }, []);

  const openJob = useCallback((event, job) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    triggerRef.current = event.currentTarget;
    const url = new URL(window.location.href);
    url.searchParams.set("job", job.slug);
    window.history.pushState({ ...window.history.state, asifJobSheet: true }, "", url);
    setSelection({ slug: job.slug, summary: job });
  }, []);

  const close = useCallback(() => {
    if (window.history.state?.asifJobSheet) window.history.back();
    else {
      const url = new URL(window.location.href);
      url.searchParams.delete("job");
      window.history.replaceState(window.history.state, "", url);
      setSelection(null);
    }
  }, []);
  const restoreFocus = useCallback((event) => { event.preventDefault(); triggerRef.current?.focus({ preventScroll: true }); }, []);
  const value = useMemo(() => ({ openJob }), [openJob]);

  return <JobSheetContext.Provider value={value}>
    {children}
    {selection && <JobDetailSheet key={selection.slug} selection={selection} onClose={close} onRestoreFocus={restoreFocus} />}
  </JobSheetContext.Provider>;
}
