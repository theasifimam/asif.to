"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, MailCheck, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { deletionApi } from "@/lib/api";

const defaultSelections = {
  chapters: true,
  courseTopics: true,
  categories: true,
  interviewQuestions: true,
  quizQuestions: true,
  sharedQuizQuestions: false,
  cheatsheets: true,
};

function SelectionRow({
  checked,
  disabled,
  onCheckedChange,
  title,
  description,
  danger = false,
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
        danger
          ? "border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      } ${disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-zinc-950 dark:text-white">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="mt-0.5 shrink-0"
      />
    </label>
  );
}

export default function DeletionDialog({
  entity,
  entityModel,
  open,
  onClose,
  onDeleted,
}) {
  const [impact, setImpact] = useState(null);
  const [eligibleApprovers, setEligibleApprovers] = useState(0);
  const [required, setRequired] = useState({});
  const [selections, setSelections] = useState(defaultSelections);
  const [stage, setStage] = useState("review");
  const [requestId, setRequestId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setImpact(null);
    setEligibleApprovers(0);
    setRequired({});
    setSelections(defaultSelections);
    setStage("review");
    setRequestId("");
    setMaskedEmail("");
    setOtp("");
    setBusy(false);
  };

  useEffect(() => {
    if (!open || !entity?._id) return;

    let alive = true;
    reset();

    (async () => {
      setBusy(true);
      const response = await deletionApi.deletionImpact(entityModel, entity._id);
      if (!alive) return;

      if (response.success) {
        const data = response.data?.data;
        setImpact(data?.impact || {});
        setEligibleApprovers(data?.eligibleApprovers || 0);
        setRequired(data?.requiredSelections || {});
        setSelections((current) => ({
          ...current,
          chapters: true,
          courseTopics: true,
          quizQuestions:
            data?.requiredSelections?.quizQuestions === true
              ? true
              : current.quizQuestions,
        }));
      } else {
        toast.error(response.error || "Unable to inspect deletion impact");
      }
      setBusy(false);
    })();

    return () => {
      alive = false;
    };
  }, [open, entity?._id]);

  const close = () => {
    if (busy) return;
    reset();
    onClose?.();
  };

  const updateSelection = (key, value) => {
    setSelections((current) => {
      const next = { ...current, [key]: value };

      // Categories cannot be deleted while their interview questions remain.
      if (key === "categories" && value) next.interviewQuestions = true;
      if (key === "interviewQuestions" && !value) next.categories = false;

      return next;
    });
  };

  const begin = async () => {
    setBusy(true);
    const response = await deletionApi.beginDeletion(entityModel, entity._id, {
      selections,
    });
    setBusy(false);

    if (!response.success) {
      toast.error(response.error || "Unable to start deletion request");
      return;
    }

    setRequestId(response.data?.data?.requestId || "");
    setMaskedEmail(response.data?.data?.maskedEmail || "");
    setOtp("");
    setStage("requesterOtp");
    toast.success("Deletion OTP sent to your admin email");
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit OTP from your email");
      return;
    }

    setBusy(true);
    const response = await deletionApi.verifyDeletionInitiator(requestId, otp);
    setBusy(false);

    if (!response.success) {
      toast.error(response.error || "Unable to verify OTP");
      return;
    }

    setStage("pendingApproval");
    toast.success("Second-admin approval requested");
  };

  const totalDestructive = useMemo(() => {
    if (!impact) return 0;
    return (
      Number(impact.chapters || 0) +
      Number(impact.courseTopics || 0) +
      (selections.categories ? Number(impact.categories || 0) : 0) +
      (selections.interviewQuestions
        ? Number(impact.interviewQuestions || 0)
        : 0) +
      (selections.quizQuestions ? Number(impact.quizExclusive || 0) : 0) +
      (selections.sharedQuizQuestions ? Number(impact.quizShared || 0) : 0) +
      (selections.cheatsheets ? Number(impact.cheatsheets || 0) : 0)
    );
  }, [impact, selections]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-delete-title"
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-800 dark:bg-[#0f0f11]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-200 bg-zinc-50/95 p-5 backdrop-blur dark:border-zinc-800 dark:bg-[#0f0f11]/95 sm:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600">
              Protected destructive action
            </p>
            <h2
              id="course-delete-title"
              className="mt-1 text-xl font-black text-zinc-950 dark:text-white"
            >
              Delete {course?.title || "course"}
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
          {stage === "review" && (
            <>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-200">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-black">
                      This is permanent and can affect SEO.
                    </p>
                    <p className="mt-1 text-xs leading-5">
                      Deleted pages may return 404, indexed URLs can lose traffic,
                      and the selected content cannot be recovered from the admin
                      panel. The database operation runs only after your OTP and a
                      different admin/super admin&apos;s OTP.
                    </p>
                  </div>
                </div>
              </div>

              {busy && !impact ? (
                <div className="flex h-44 items-center justify-center">
                  <LogoLoader className="h-6 w-6  text-blue-600"  />
                </div>
              ) : impact ? (
                <div className="space-y-3">
                  <SelectionRow
                    checked
                    disabled
                    title={`Chapters (${impact.chapters || 0})`}
                    description="Required. Chapters cannot exist without their entity,
  entityModel, so they are always permanently deleted."
                  />
                  <SelectionRow
                    checked
                    disabled
                    title={`Course topics (${impact.courseTopics || 0})`}
                    description="Required. Course topics have a mandatory course reference and cannot be preserved as orphans."
                  />
                  <SelectionRow
                    checked={selections.interviewQuestions}
                    onCheckedChange={(value) =>
                      updateSelection("interviewQuestions", value)
                    }
                    title={`Interview questions (${impact.interviewQuestions || 0})`}
                    description="Deletes the interview questions assigned directly to this item or to its course categories."
                  />
                  <SelectionRow
                    checked={selections.categories}
                    onCheckedChange={(value) =>
                      updateSelection("categories", value)
                    }
                    title={`Interview categories (${impact.categories || 0})`}
                    description={
                      selections.categories
                        ? "These categories will be permanently deleted. Their interview questions must also be selected."
                        : "These categories will be preserved as standalone categories by removing the course reference."
                    }
                  />
                  <SelectionRow
                    checked={selections.quizQuestions}
                    disabled={required.quizQuestions === true}
                    onCheckedChange={(value) =>
                      updateSelection("quizQuestions", value)
                    }
                    title={`Course-exclusive quiz / flashcard questions (${impact.quizExclusive || 0})`}
                    description={
                      required.quizQuestions
                        ? "Required because these questions belong only to this item and the quiz schema requires at least one course."
                        : "Deletes quiz questions that belong only to this item."
                    }
                  />
                  <SelectionRow
                    checked={selections.sharedQuizQuestions}
                    onCheckedChange={(value) =>
                      updateSelection("sharedQuizQuestions", value)
                    }
                    danger={selections.sharedQuizQuestions}
                    title={`Shared quiz questions (${impact.quizShared || 0})`}
                    description={
                      selections.sharedQuizQuestions
                        ? "DANGER: these questions are also used by other courses and will be deleted from every course."
                        : "Recommended: preserve shared questions and only detach this item from them."
                    }
                  />
                  <SelectionRow
                    checked={selections.cheatsheets}
                    onCheckedChange={(value) =>
                      updateSelection("cheatsheets", value)
                    }
                    danger={
                      selections.cheatsheets &&
                      Number(impact.otherCoursesSameTech || 0) > 0
                    }
                    title={`Cheatsheets (${impact.cheatsheets || 0})`}
                    description={
                      Number(impact.otherCoursesSameTech || 0) > 0
                        ? `Cheatsheets are linked by techId, and ${impact.otherCoursesSameTech} other course(s) use the same techId. Deleting them can affect those courses too.`
                        : "Deletes cheatsheets linked to this item technology."
                    }
                  />

                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs leading-5 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      Automatic reference cleanup:
                    </strong>{" "}
                    {impact.relatedArticles || 0} independent article(s) reference
                    this item. They are not deleted; their dead course/chapter/question
                    references are removed automatically.
                  </div>
                </div>
              ) : null}

              {eligibleApprovers === 0 && impact && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                  No second active admin/super admin is available. This course
                  cannot be deleted until another eligible administrator exists.
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-zinc-500">
                  <strong className="text-zinc-900 dark:text-white">
                    {totalDestructive}
                  </strong>{" "}
                  selected records may be permanently removed.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={close} disabled={busy}>
                    Cancel
                  </Button>
                  <Button
                    onClick={begin}
                    disabled={busy || !impact || eligibleApprovers === 0}
                    className="bg-rose-600 text-white hover:bg-rose-700"
                  >
                    {busy ? (
                      <LogoLoader className="h-4 w-4 "  />
                    ) : (
                      <MailCheck className="h-4 w-4" />
                    )}
                    Send my deletion OTP
                  </Button>
                </div>
              </div>
            </>
          )}

          {stage === "requesterOtp" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-black text-blue-950 dark:text-blue-200">
                      Verify your own admin identity
                    </p>
                    <p className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-300">
                      A 6-digit code was sent to {maskedEmail}. After you verify,
                      the deletion request is sent to a different admin/super
                      admin. You cannot approve your own request.
                    </p>
                  </div>
                </div>
              </div>

              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="6-digit OTP"
                className="h-14 rounded-2xl text-center font-mono text-xl tracking-[0.35em]"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={close} disabled={busy}>
                  Cancel request
                </Button>
                <Button
                  onClick={verify}
                  disabled={busy || otp.length !== 6}
                  className="bg-rose-600 text-white hover:bg-rose-700"
                >
                  {busy && <LogoLoader className="h-4 w-4 "  />}
                  Verify & request second approval
                </Button>
              </div>
            </div>
          )}

          {stage === "pendingApproval" && (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-black text-zinc-950 dark:text-white">
                Waiting for another administrator
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Nothing has been deleted yet. Another active admin/super admin
                has received an in-app notification and email. They must review
                exactly what you selected, request their own OTP, and approve it.
              </p>
              <Button onClick={close} className="mt-5">
                Done
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
