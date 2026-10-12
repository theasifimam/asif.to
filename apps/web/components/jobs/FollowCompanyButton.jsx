"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

/** Follow a company = a job alert limited to that company; new roles arrive by email. */
export default function FollowCompanyButton({ companyId, companyName }) {
  const { isAuthenticated, requireAuth } = useAuthPrompt();
  const [alertId, setAlertId] = useState(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/jobs/me/alerts")
      .then(({ data }) => setAlertId((data?.data || []).find((alert) => alert.company === String(companyId).toLowerCase())?._id || null))
      .catch(() => {});
  }, [isAuthenticated, companyId]);

  const toggle = async () => {
    if (!isAuthenticated) return requireAuth();
    setWorking(true);
    try {
      if (alertId) {
        await api.delete(`/jobs/me/alerts/${alertId}`);
        setAlertId(null);
        toast.success(`You will no longer get emails about ${companyName}`);
      } else {
        const { data } = await api.post("/jobs/me/alerts", { company: companyId });
        setAlertId(data?.data?._id || "on");
        toast.success(`We will email you when ${companyName} lists a new job`);
      }
    } catch {
      toast.error("Couldn't update that. Please try again.");
    } finally {
      setWorking(false);
    }
    return undefined;
  };

  const Icon = alertId ? BellRing : Bell;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={working}
      aria-pressed={Boolean(alertId)}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-black transition disabled:opacity-60 ${alertId ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700"}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {alertId ? "Following" : "Follow for new jobs"}
    </button>
  );
}
