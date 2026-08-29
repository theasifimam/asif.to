"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  KeyRound,
  LogOut,
  Shield,
  Trash2,
  UserX,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import {
  useDeactivateAccountMutation,
  useDeleteAccountMutation,
  useSendOtpMutation,
} from "@/lib/api/authApi";

export default function AccountManagementSettings({ user }) {
  const dispatch = useAppDispatch();
  const [action, setAction] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [deactivateAccount, { isLoading: deactivating }] =
    useDeactivateAccountMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();
  const busy = deactivating || deleting;

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    if (!user?.email) {
      return toast.error("No registered email found for this account.");
    }
    try {
      const res = await sendOtp({
        email: user.email,
        name: user.fullName || user.username,
      }).unwrap();
      if (res.success) {
        toast.success(`Verification code sent to ${user.email}`);
        setOtpCountdown(60);
      } else {
        toast.error(res.message || "Failed to send verification code");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send verification code");
    }
  };

  const finishSession = async () => {
    await fetch("/api/auth/backend-session", { method: "DELETE" }).catch(
      () => {},
    );
    dispatch(clearCredentials());
    await signOut({ redirectTo: "/" });
  };

  const submit = async () => {
    if (!otp.trim() || otp.trim().length < 6) {
      return toast.error(
        "Please enter the 6-digit verification code sent to your email.",
      );
    }
    if (user?.provider === "credentials" && !password.trim()) {
      return toast.error("Please enter your current account password.");
    }

    try {
      const payload = {
        confirmation: confirmation.trim(),
        password: password.trim(),
        otp: otp.trim(),
      };

      const result =
        action === "deactivate"
          ? await deactivateAccount(payload).unwrap()
          : await deleteAccount(payload).unwrap();

      toast.success(result.message);
      await finishSession();
    } catch (error) {
      toast.error(error?.data?.message || `Unable to ${action} your account`);
    }
  };

  const openActionModal = (act) => {
    setAction(act);
    setConfirmation("");
    setPassword("");
    setOtp("");
    setOtpCountdown(0);
  };

  const expected =
    action === "delete" ? `DELETE @${user?.username}` : user?.username;

  const isFormValid =
    confirmation.trim() === expected &&
    otp.trim().length === 6 &&
    (user?.provider !== "credentials" || password.trim().length > 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold">Account & security</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Review your account identity and manage active sessions.
            </p>
          </div>
        </div>
        <dl className="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          <AccountRow label="Username" value={`@${user?.username || ""}`} />
          <AccountRow label="Email" value={user?.email || "—"} />
          <AccountRow
            label="Sign-in method"
            value={
              user?.provider === "credentials"
                ? "Email and password"
                : user?.provider || "—"
            }
            capitalize
          />
          <AccountRow
            label="Email status"
            value={user?.isVerified ? "Verified" : "Unverified"}
          />
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          {user?.provider === "credentials" && (
            <Link
              href="/forgot-password"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-xs font-bold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
            >
              <KeyRound size={15} /> Change password
            </Link>
          )}
          <button
            type="button"
            onClick={finishSession}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-xs font-bold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-red-200 bg-white p-6 dark:border-red-950 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-red-600 dark:text-red-400">
              Danger Zone & Account Controls
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              High-security operations require OTP verification and your current
              password.
            </p>
          </div>
        </div>
        <div className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-800">
          <DangerAction
            icon={UserX}
            title="Deactivate account"
            description="Temporarily disable sign-in and hide your profile. Your saved data and published content remain preserved. Sign back in any time to instantly reactivate."
            button="Deactivate"
            onClick={() => openActionModal("deactivate")}
          />
          <DangerAction
            icon={Trash2}
            title="Delete account"
            description="Request account removal. You have a 30-day window to sign back in and restore it. After 30 days your personal data is permanently removed, but published contributions stay preserved."
            button="Delete account"
            destructive
            onClick={() => openActionModal("delete")}
          />
        </div>
      </section>

      {/* Security Confirmation Modal */}
      {action && (
        <div
          className="fixed inset-0 z-120 grid place-items-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>

            <h2 className="mt-4 text-xl font-black font-outfit text-foreground">
              {action === "delete"
                ? "Permanently Delete Account?"
                : "Deactivate Your Account?"}
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              {action === "delete"
                ? "This action is irreversible. For security, you must confirm your password and verify a one-time code sent to your email."
                : "You will be signed out on all devices. For your protection, verify with password and OTP."}
            </p>

            <div className="mt-5 space-y-4">
              {/* Step 1: Confirmation Phrase */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                  1. Type{" "}
                  <span className="font-mono text-red-600 font-bold">
                    {expected}
                  </span>{" "}
                  to confirm
                </label>
                <input
                  autoFocus
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder={expected}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-xs font-semibold outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              {/* Step 2: Password (if credentials account) */}
              {user?.provider === "credentials" && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                    2. Current Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your current password"
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-10 text-xs font-semibold outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      size={15}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: OTP Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                    {user?.provider === "credentials" ? "3." : "2."} Email
                    Verification OTP
                  </label>
                  <button
                    type="button"
                    disabled={sendingOtp || otpCountdown > 0}
                    onClick={handleSendOtp}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                  >
                    {sendingOtp ? (
                      <>
                        <LogoLoader className=" w-3 h-3"  />
                        <span>Sending...</span>
                      </>
                    ) : otpCountdown > 0 ? (
                      `Resend in ${otpCountdown}s`
                    ) : (
                      <>
                        <Send size={11} />
                        <span>Send OTP code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Enter 6-digit OTP"
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs font-mono font-bold tracking-widest outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={15}
                  />
                </div>
                <p className="text-[10px] text-zinc-400">
                  Verification code will be sent to{" "}
                  <strong>{user?.email}</strong>
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => setAction("")}
                className="h-10 rounded-xl px-4 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !isFormValid}
                onClick={submit}
                className="h-10 rounded-xl bg-red-600 px-5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40 shadow-md shadow-red-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                {busy ? (
                  <>
                    <LogoLoader className=" w-3.5 h-3.5"  />
                    <span>Processing…</span>
                  </>
                ) : action === "delete" ? (
                  "Confirm & Delete Account"
                ) : (
                  "Confirm & Deactivate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountRow({ label, value, capitalize }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr]">
      <dt className="text-xs font-semibold text-zinc-400">{label}</dt>
      <dd
        className={`text-xs font-bold text-zinc-700 dark:text-zinc-200 ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function DangerAction({
  icon: Icon,
  title,
  description,
  button,
  onClick,
  destructive,
}) {
  return (
    <div className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`h-9 shrink-0 rounded-xl border px-4 text-xs font-bold cursor-pointer transition-colors ${destructive ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950" : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
      >
        {button}
      </button>
    </div>
  );
}
