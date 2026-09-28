"use client";

import { useEffect, useState } from "react";
import { BellRing, BriefcaseBusiness, LoaderCircle, MapPin, Power } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

const labels = {
  keyword: "Role",
  category: "Category",
  location: "Location",
  employmentType: "Employment",
  workMode: "Work mode",
  experienceLevel: "Experience",
};

const displayValue = (value) =>
  String(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function alertLabel(alert) {
  const filters = Object.entries(labels)
    .filter(([key]) => alert[key])
    .map(([key]) => `${labels[key]}: ${displayValue(alert[key])}`);

  return filters.length ? filters : ["All new UAE jobs"];
}

export default function JobSubscriptions() {
  const { isAuthenticated } = useAuthPrompt();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;
    api
      .get("/jobs/me/alerts")
      .then(({ data }) => {
        if (active) setAlerts(data?.data || []);
      })
      .catch(() => {
        if (active) toast.error("Unable to load your job subscriptions");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const turnOff = async (alertId) => {
    setRemovingId(alertId);
    try {
      await api.delete(`/jobs/me/alerts/${alertId}`);
      setAlerts((current) => current.filter((alert) => alert._id !== alertId));
      toast.success("Job subscription turned off");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update this subscription");
    } finally {
      setRemovingId(null);
    }
  };

  if (!isAuthenticated || (!loading && !alerts.length)) return null;

  return (
    <div className="mt-6 rounded-3xl border border-blue-200/60 bg-blue-50/50 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20" aria-labelledby="job-subscriptions-title">
      <div className="flex flex-col gap-2 border-b border-blue-100/60 p-4 dark:border-blue-900/40">
        <div className="flex items-start gap-2.5">
          <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <h2 id="job-subscriptions-title" className="font-outfit text-sm font-black tracking-tight text-blue-950 dark:text-blue-100">
              Active Alerts
            </h2>
            <p className="mt-0.5 text-[10px] font-medium text-blue-700/70 dark:text-blue-300/70">
              Manage your job email alerts.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-4 text-[11px] font-semibold text-blue-600">
          <LoaderCircle className="h-3 w-3 animate-spin" />
          Loading alerts…
        </div>
      ) : (
        <div className="divide-y divide-blue-100/60 dark:divide-blue-900/40">
          {alerts.map((alert) => (
            <div key={alert._id} className="flex flex-col gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1">
                  {alertLabel(alert).map((filter) => (
                    <span key={filter} className="inline-flex items-center gap-1 rounded-md bg-blue-100/50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {filter.startsWith("Location:") && <MapPin className="h-2.5 w-2.5 text-blue-400" />}
                      {filter}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => turnOff(alert._id)}
                disabled={removingId === alert._id}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-[10px] font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/70 dark:text-red-400 dark:hover:bg-red-950/30 w-full"
              >
                {removingId === alert._id ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
                Turn off
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
