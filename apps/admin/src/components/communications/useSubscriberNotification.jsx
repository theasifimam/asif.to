"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { AudiencePicker } from "./EmailEditor";
import SelectField from "./SelectField";
import { toast } from "sonner";
import { communicationApi as api, errorMessage } from "./api";
export default function useSubscriberNotification(type) {
  const { user } = useAuth();
  const allowed = hasPermission(user, "communications.campaigns.send");
  const [enabled, setEnabled] = useState(false), [topics, setTopics] = useState([]), [available, setAvailable] = useState([]), [templates, setTemplates] = useState([]), [template, setTemplate] = useState(""), [count, setCount] = useState(null), [error, setError] = useState("");
  const key = useRef(null);
  useEffect(() => {
    if (!enabled || !allowed) return;
    const controller = new AbortController();
    Promise.all([api("/public/topics", { signal: controller.signal }), api("/templates", { signal: controller.signal })]).then(([a, b]) => { setAvailable(a.topics); setTemplates(b.items); }).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); });
    return () => controller.abort();
  }, [enabled, allowed]);
  useEffect(() => {
    if (!enabled || !allowed) return;
    const controller = new AbortController();
    api("/audience", { method: "POST", body: { topics }, signal: controller.signal }).then(data => setCount(data.count)).catch(() => {});
    return () => controller.abort();
  }, [topics, enabled, allowed]);
  const notify = async (id, status) => {
    if (!enabled || status !== "published" || !allowed) return null;
    key.current ||= crypto.randomUUID();
    try { await api("/notify-content", { method: "POST", body: { type, id, template, topics, requestId: key.current } }); toast.success("Subscriber notification queued"); return null; }
    catch (e) { toast.error(`Content saved. Email announcement needs attention: ${errorMessage(e)}`); return `/communications/campaigns/notify?type=${type}&contentId=${id}`; }
  };
  const input = "w-full rounded-xl border border-zinc-200 bg-transparent p-2 text-sm dark:border-zinc-700";
  const controls = allowed ? <div className="space-y-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"><label className="flex gap-2 text-sm font-medium"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />Email subscribers after publishing</label>{enabled && <><SelectField aria-label="Announcement template" className={input} value={template} onChange={e => setTemplate(e.target.value)}><option value="">Choose email template</option>{templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</SelectField><AudiencePicker topics={available} value={topics} onChange={setTopics} /><p className="text-xs text-zinc-500">{count == null ? "Estimating audience…" : `${count} eligible recipients`}. No topics selects all active subscribers. Delivery runs after publishing.</p>{error && <p className="text-xs text-red-600">{error}</p>}</>}</div> : null;
  return { controls, notify, validate: status => { if (enabled && status === "published" && !template) { toast.error("Select a subscriber email template"); return false; } return true; } };
}
