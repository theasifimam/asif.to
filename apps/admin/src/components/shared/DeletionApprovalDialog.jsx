"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deletionApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function currentRequestId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("deletionRequest") || "";
}

function removeRequestParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("deletionRequest");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

const labelMap = {
  chapters: "Chapters",
  courseTopics: "Course topics",
  categories: "Interview categories",
  interviewQuestions: "Interview questions",
  quizQuestions: "Course-exclusive quiz questions",
  sharedQuizQuestions: "Shared quiz questions from every linked course",
  cheatsheets: "Cheatsheets",
};

export default function DeletionApprovalDialog({ onDeleted }) {
  const { user } = useAuth();
  const [requestId, setRequestId] = useState("");
  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [otpStage, setOtpStage] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const id = currentRequestId();
    setRequestId(id);
  }, []);

  useEffect(() => {
    if (!requestId) return;

    let alive = true;
    setBusy(true);

    deletionApi.getDeletionRequest(requestId).then((response) => {
      if (!alive) return;

      if (response.success) {
        setRequest(response.data?.data || null);
      } else {
        toast.error(response.error || "Unable to load deletion request");
        removeRequestParam();
        setRequestId("");
      }
      setBusy(false);
    });

    return () => {
      alive = false;
    };
  }, [requestId]);

  const close = () => {
    if (busy) return;
    removeRequestParam();
    setRequestId("");
    setRequest(null);
    setOtp("");
    setOtpStage(false);
  };

  const sendOtp = async () => {
    setBusy(true);
    const response = await deletionApi.sendDeletionApprovalOtp(requestId);
    setBusy(false);

    if (!response.success) {
      toast.error(response.error || "Unable to send approval OTP");
      return;
    }

    setMaskedEmail(response.data?.data?.maskedEmail || "");
    setOtp("");
    setOtpStage(true);
    toast.success("Approval OTP sent to your admin email");
  };

  const approve = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit approval OTP");
      return;
    }

    setBusy(true);
    const response = await deletionApi.approveDeletion(requestId, otp);
    setBusy(false);

    if (!response.success) {
      toast.error(response.error || "Unable to approve deletion");
      return;
    }

    toast.success("Content permanently deleted after dual approval");
    close();
    await onDeleted?.();
  };

  const reject = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Reject deletion of ${request?.entitySnapshot?.title || "this content"}? Nothing will be deleted.`,
      )
    ) {
      return;
    }

    setBusy(true);
    const response = await deletionApi.rejectDeletion(requestId);
    setBusy(false);

    if (!response.success) {
      toast.error(response.error || "Unable to reject deletion");
      return;
    }

    toast.success("Deletion request rejected");
    close();
  };

  if (!requestId) return null;

  const requesterId = String(
    request?.requestedBy?._id || request?.requestedBy || "",
  );
  const isRequester = requesterId && requesterId === String(user?._id || "");
  const selectedEntries = Object.entries(request?.selections || {}).filter(
    ([, selected]) => selected,
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close approval dialog"
        onClick={close}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-800 dark:bg-[#0f0f11]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600">
              Second administrator approval
            </p>
            <h2 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">
              Review protected deletion
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            disabled={busy}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {busy && !request ? (
            <div className="flex h-44 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : request ? (
            <>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/25">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-sm font-black text-rose-950 dark:text-rose-200">
                      You are the independent safety check.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-rose-800 dark:text-rose-300">
                      Approving permanently deletes the selected records. Verify
                      the course and counts carefully. Your OTP is separate from
                      the requester&apos;s OTP.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-xs font-semibold text-zinc-500">
                  Course
                </p>
                <p className="mt-1 font-black text-zinc-950 dark:text-white">
                  {request.entitySnapshot?.title}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Requested by{" "}
                  <strong>
                    {request.requestedBy?.fullName ||
                      request.requestedBy?.username ||
                      request.requestedBy?.email ||
                      "another administrator"}
                  </strong>
                </p>
              </div>

              <div className="space-y-2">
                {selectedEntries.map(([key]) => {
                  let count = null;
                  if (key === "quizQuestions")
                    count = request.impact?.quizExclusive;
                  else if (key === "sharedQuizQuestions")
                    count = request.impact?.quizShared;
                  else count = request.impact?.[key];

                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                        key === "sharedQuizQuestions"
                          ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                      }`}
                    >
                      <span className="font-semibold">
                        {labelMap[key] || key}
                      </span>
                      <span className="font-mono text-xs">{count ?? "—"}</span>
                    </div>
                  );
                })}
              </div>

              {Number(request.impact?.otherCoursesSameTech || 0) > 0 &&
                request.selections?.cheatsheets && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                    Warning: {request.impact.otherCoursesSameTech} other course(s)
                    use the same techId. Selected cheatsheets are techId-based and
                    will be permanently removed for that technology.
                  </div>
                )}

              {isRequester ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  You created this request, so you cannot approve it. A different
                  admin/super admin must complete the second OTP.
                </div>
              ) : request.status === "completed" ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  This protected deletion has already completed.
                </div>
              ) : ["rejected", "expired", "stale", "failed"].includes(
                  request.status,
                ) ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-950">
                  This request is {request.status}. It cannot be approved.
                </div>
              ) : !otpStage ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={reject} disabled={busy}>
                    Reject — delete nothing
                  </Button>
                  <Button
                    onClick={sendOtp}
                    disabled={busy || !request.canCurrentUserApprove}
                    className="bg-rose-600 text-white hover:bg-rose-700"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Send my approval OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs leading-5 text-zinc-500">
                    A 6-digit approval code was sent to {maskedEmail}. Entering
                    it below is the final authorization. The server will re-check
                    all content counts before deletion; if anything changed, the
                    request becomes stale instead of deleting unreviewed content.
                  </p>
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit approval OTP"
                    className="h-14 rounded-2xl text-center font-mono text-xl tracking-[0.35em]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOtpStage(false);
                        setOtp("");
                      }}
                      disabled={busy}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={approve}
                      disabled={busy || otp.length !== 6}
                      className="bg-rose-600 text-white hover:bg-rose-700"
                    >
                      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                      Approve & permanently delete
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
