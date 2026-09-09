"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, ExternalLink, Send, Share2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { useAppSelector } from "@/lib/store/hooks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function JobActions({ job, layout = "stacked" }) {
  const { requireAuth, isAuthenticated } = useAuthPrompt();
  const user = useAppSelector((state) => state.auth.user);
  const [saved, setSaved] = useState(false);
  const [working, setWorking] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  const isBar = layout === "bar";

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get("/jobs/me/saved?limit=100")
      .then(({ data }) => {
        setSaved(Boolean(data?.data?.some((item) => item.job?._id === job._id)));
      })
      .catch(() => {});
  }, [isAuthenticated, job._id]);

  const save = async () => {
    if (!requireAuth()) return;
    setWorking(true);
    try {
      const { data } = await api.post(`/jobs/${job._id}/save`);
      setSaved(Boolean(data?.data?.saved));
      toast.success(data?.data?.saved ? "Job saved" : "Job removed from saved jobs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update saved jobs");
    } finally {
      setWorking(false);
    }
  };

  const apply = async () => {
    if (!requireAuth()) return;
    if (job.status === "expired") return;
    if (job.applicationType === "internal") {
      setShowApplication(true);
      return;
    }
    setWorking(true);
    try {
      const { data } = await api.post(`/jobs/${job._id}/external-apply`);
      if (data?.data?.redirectUrl) window.location.assign(data.data.redirectUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to open the company application page");
      setWorking(false);
    }
  };

  const share = async () => {
    const payload = {
      title: `${job.title} at ${job.companyName}`,
      text: `View this UAE job on asif.to`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(payload.url);
        toast.success("Job link copied");
      }
      fetch(`${API}/jobs/${job._id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ event: "share" }),
      }).catch(() => {});
    } catch {}
  };

  const submitInternal = async (event) => {
    event.preventDefault();
    setWorking(true);
    const form = new FormData(event.currentTarget);
    try {
      const token = localStorage.getItem("asif_token");
      const response = await fetch(`${API}/jobs/${job._id}/apply`, {
        method: "POST",
        body: form,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Application could not be submitted");
      setShowApplication(false);
      toast.success("Application submitted to the employer");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div className={isBar ? "flex items-center gap-2" : "space-y-2.5"}>
        <Button
          type="button"
          onClick={apply}
          disabled={working || job.status === "expired"}
          className={`${isBar ? "h-11 min-w-0 flex-1" : "h-12 w-full"} rounded-full bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6`}
        >
          {job.applicationType === "external" ? (
            <ExternalLink className="h-4 w-4 shrink-0" />
          ) : (
            <Send className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">
            {job.status === "expired"
              ? "Applications closed"
              : job.applicationType === "external"
                ? "Apply on company website"
                : "Apply through asif.to"}
          </span>
        </Button>

        <div className={`flex items-center gap-2 ${isBar ? "shrink-0" : ""}`}>
          <Button
            type="button"
            variant="outline"
            onClick={save}
            disabled={working}
            aria-pressed={saved}
            className={`h-11 rounded-full border border-zinc-200/90 bg-white px-4 text-xs font-black hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-900 ${isBar ? "shrink-0" : "flex-1"}`}
          >
            {saved ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <Bookmark className="h-4 w-4 shrink-0" />
            )}
            <span className={isBar ? "hidden sm:inline" : ""}>{saved ? "Saved" : "Save job"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={share}
            aria-label="Share job"
            className="h-11 w-11 shrink-0 rounded-full border border-zinc-200/90 bg-white hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Share2 className="h-4 w-4 shrink-0" />
          </Button>
        </div>
      </div>

      {!isBar && job.applicationType === "external" && job.status !== "expired" && (
        <p className="mt-2 text-[10px] leading-4 text-zinc-400">
          You’ll continue to the employer or original source. asif.to records the click but cannot confirm whether you submit there.
        </p>
      )}

      {showApplication && (
        <div
          className="fixed inset-0 z-150 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-title"
        >
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-zinc-800/80 bg-zinc-950 p-6 text-left text-zinc-100 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setShowApplication(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-blue-400 mb-5">
              <Send className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                Direct application
              </p>
              <h2 id="application-title" className="mt-1 font-outfit text-2xl font-black tracking-tight text-white">
                Apply for {job.title}
              </h2>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-zinc-400">
                Your details and CV will be stored privately and shared directly with the employer.
              </p>
            </div>

            <form onSubmit={submitInternal} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="app-fullName" className="text-xs font-bold text-zinc-300" required>
                  Full name
                </Label>
                <Input
                  id="app-fullName"
                  name="fullName"
                  required
                  maxLength={180}
                  defaultValue={user?.fullName || user?.name || ""}
                  placeholder="e.g. Alex Smith"
                  className="h-11 rounded-2xl border-zinc-800 bg-zinc-900/90 text-sm text-white placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-email" className="text-xs font-bold text-zinc-300" required>
                  Email
                </Label>
                <Input
                  id="app-email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  defaultValue={user?.email || ""}
                  placeholder="e.g. alex@example.com"
                  className="h-11 rounded-2xl border-zinc-800 bg-zinc-900/90 text-sm text-white placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="app-phone" className="text-xs font-bold text-zinc-300" required>
                  Phone number
                </Label>
                <Input
                  id="app-phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={40}
                  defaultValue={user?.mNumber || ""}
                  placeholder="+971 50 123 4567"
                  className="h-11 rounded-2xl border-zinc-800 bg-zinc-900/90 text-sm text-white placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-resume" className="text-xs font-bold text-zinc-300" required>
                    CV / resume
                  </Label>
                  <span className="text-[10px] font-medium text-zinc-500">
                    PDF, DOC, DOCX · max 8 MB
                  </span>
                </div>
                <Input
                  id="app-resume"
                  name="resume"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="h-auto rounded-2xl border-dashed border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-300 hover:border-zinc-700 file:mr-3 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-zinc-200"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="app-coverMessage" className="text-xs font-bold text-zinc-300">Cover message</Label>
                  <span className="text-[10px] font-medium text-zinc-500">optional</span>
                </div>
                <Textarea
                  id="app-coverMessage"
                  name="coverMessage"
                  maxLength={5000}
                  rows={4}
                  placeholder="Brief note to introduce yourself and why you're a fit..."
                  className="rounded-2xl border-zinc-800 bg-zinc-900/90 p-3.5 text-sm leading-6 text-white placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600"
                />
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowApplication(false)}
                  disabled={working}
                  className="rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={working}
                  loading={working}
                  className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-zinc-950 transition-all shadow-sm hover:bg-zinc-200 disabled:opacity-50"
                >
                  {working ? "Submitting…" : "Submit application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
