"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  KeyRound,
  LogOut,
  Shield,
  Trash2,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/store/hooks";
import { clearCredentials } from "@/lib/store/authSlice";
import {
  useDeactivateAccountMutation,
  useDeleteAccountMutation,
} from "@/lib/api/authApi";

export default function AccountManagementSettings({ user }) {
  const dispatch = useAppDispatch();
  const [action, setAction] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [deactivateAccount, { isLoading: deactivating }] =
    useDeactivateAccountMutation();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();
  const busy = deactivating || deleting;

  const finishSession = async () => {
    await fetch("/api/auth/backend-session", { method: "DELETE" }).catch(
      () => {},
    );
    dispatch(clearCredentials());
    await signOut({ redirectTo: "/" });
  };

  const submit = async () => {
    try {
      const result =
        action === "deactivate"
          ? await deactivateAccount(confirmation).unwrap()
          : await deleteAccount(confirmation).unwrap();
      toast.success(result.message);
      await finishSession();
    } catch (error) {
      toast.error(error?.data?.message || `Unable to ${action} your account`);
    }
  };

  const expected =
    action === "delete" ? `DELETE @${user?.username}` : user?.username;

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
              Review your account identity and end the current session.
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
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-xs font-bold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <KeyRound size={15} /> Change password
            </Link>
          )}
          <button
            type="button"
            onClick={finishSession}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-xs font-bold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
            <h2 className="text-sm font-extrabold">Account controls</h2>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              These actions immediately sign you out on every device.
            </p>
          </div>
        </div>
        <div className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-800">
          <DangerAction
            icon={UserX}
            title="Deactivate account"
            description="Temporarily disable sign-in and hide your profile. Your saved data and published content remain preserved."
            button="Deactivate"
            onClick={() => {
              setAction("deactivate");
              setConfirmation("");
            }}
          />
          <DangerAction
            icon={Trash2}
            title="Delete account"
            description="Remove your public account and disable access. Published content remains attributed and is not automatically destroyed."
            button="Delete account"
            destructive
            onClick={() => {
              setAction("delete");
              setConfirmation("");
            }}
          />
        </div>
      </section>

      {action && (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertTriangle size={20} />
            </div>
            <h2 className="mt-5 text-xl font-black">
              {action === "delete"
                ? "Delete your account?"
                : "Deactivate your account?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {action === "delete"
                ? "Your profile and account access will be removed. Published content is preserved to prevent broken pages."
                : "You will lose access until an administrator or support restores the account."}
            </p>
            <label className="mt-5 block text-xs font-bold text-zinc-600 dark:text-zinc-300">
              Type <span className="font-mono text-red-600">{expected}</span> to
              confirm
            </label>
            <input
              autoFocus
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-red-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setAction("")}
                className="h-10 rounded-xl px-4 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || confirmation !== expected}
                onClick={submit}
                className="h-10 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40"
              >
                {busy
                  ? "Processing…"
                  : action === "delete"
                    ? "Delete account"
                    : "Deactivate account"}
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
        className={`h-9 shrink-0 rounded-xl border px-4 text-xs font-bold ${destructive ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950" : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
      >
        {button}
      </button>
    </div>
  );
}
