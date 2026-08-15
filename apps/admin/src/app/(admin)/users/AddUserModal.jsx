"use client";

import { useState } from "react";
import { Check, Copy, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, Input } from "@/components/ui";

const roleDescriptions = {
  author: "Can create and manage their own content.",
  editor: "Can review, edit, and publish content across the platform.",
  admin: "Can manage users and platform operations.",
};

export function AddUserModal({ isOpen, onClose, onAdd, submitting }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("author");
  const [inviteUrl, setInviteUrl] = useState("");

  const close = () => {
    setEmail("");
    setRole("author");
    setInviteUrl("");
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const result = await onAdd({ email: email.trim(), role });
      if (result?.inviteUrl) setInviteUrl(result.inviteUrl);
    } catch {
      // The parent owns user-facing API feedback.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="overflow-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-lg">
        <form onSubmit={submit}>
          <div className="border-b border-zinc-100 px-6 py-6 dark:border-zinc-900 sm:px-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <UserPlus size={20} />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
                Add a team member
              </DialogTitle>
              <DialogDescription className="max-w-md text-sm leading-6 text-zinc-500">
                Send a secure, single-use invitation. They will create or
                connect their own account—no passwords need to be shared.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 px-6 py-6 sm:px-8">
            <div className="space-y-2">
              <label
                htmlFor="invite-email"
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="invite-email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="h-11 rounded-xl pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Starting role
              </label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 rounded-xl bg-zinc-50 p-3 text-xs leading-5 text-zinc-500 dark:bg-zinc-900">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                {roleDescriptions[role]}
              </div>
            </div>

            {inviteUrl && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  <Check size={16} /> Invitation ready
                </div>
                <p className="mt-1 text-xs leading-5 text-emerald-700/80 dark:text-emerald-400">
                  Copy the secure link if email delivery is unavailable.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                    toast.success("Invitation link copied");
                  }}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" /> Copy invitation link
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 dark:border-zinc-900 dark:bg-zinc-900/40 sm:px-8">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !email.trim()}>
              {submitting ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
