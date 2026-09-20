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
    <section className="px-4 pb-2 sm:px-6 sm:pb-4" aria-labelledby="job-subscriptions-title">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-4xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h2 id="job-subscriptions-title" className="font-outfit text-lg font-black tracking-tight">
                  Your job alert subscriptions
                </h2>
                <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Manage the job emails you receive from asif.to.
                </p>
              </div>
            </div>
            <span className="self-start rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 sm:self-auto">
              {loading ? "Loading" : `${alerts.length} active`}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 p-5 text-sm font-semibold text-zinc-500 sm:p-6">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading your subscriptions…
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {alerts.map((alert) => (
                <div key={alert._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-black">
                      <BriefcaseBusiness className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>Job email alert</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {alertLabel(alert).map((filter) => (
                        <span key={filter} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {filter.startsWith("Location:") && <MapPin className="h-3 w-3 text-zinc-400" />}
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => turnOff(alert._id)}
                    disabled={removingId === alert._id}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-3.5 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/70 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    {removingId === alert._id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                    Turn off
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
