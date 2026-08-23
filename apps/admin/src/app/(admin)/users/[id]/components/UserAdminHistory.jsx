"use client";

import { useState } from "react";
import { KeyRound, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import {
  useAddUserNoteMutation,
  useRevokeUserSessionsMutation,
} from "@/redux/services/userApi";

export default function UserAdminHistory({
  userId,
  notes = [],
  audit = [],
  isOwnProfile,
}) {
  const [body, setBody] = useState("");
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [addNote, { isLoading }] = useAddUserNoteMutation();
  const [revokeSessions, { isLoading: revoking }] =
    useRevokeUserSessionsMutation();
  const saveNote = async () => {
    try {
      await addNote({ id: userId, body }).unwrap();
      setBody("");
      toast.success("Internal note added");
    } catch (error) {
      toast.error(error.data?.message || "Unable to add note");
    }
  };
  return (
    <section className="grid gap-1 sm:gap-1 lg:grid-cols-2">
      <div className="rounded-[28px] sm:rounded-4xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-black font-outfit text-zinc-950 dark:text-white text-base sm:text-lg tracking-tight">
              Internal notes
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Visible only to authorized administrators.
            </p>
          </div>
          <MessageSquarePlus className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="flex gap-2">
          <Input
            value={body}
            maxLength={2000}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add a private operational note…"
            className="rounded-full text-xs h-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 px-4 focus-visible:bg-white"
          />
          <Button
            disabled={isLoading || !body.trim()}
            onClick={saveNote}
            className="rounded-full px-5 h-10 font-bold text-xs shrink-0"
          >
            Add
          </Button>
        </div>
        <div className="mt-4 max-h-64 space-y-2.5 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note._id}
              className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 p-3.5 border border-zinc-200/60 dark:border-zinc-800/80"
            >
              <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {note.body}
              </p>
              <p className="mt-1.5 text-[10px] font-bold text-zinc-400">
                {note.author?.fullName} ·{" "}
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="py-8 text-center text-xs font-semibold text-zinc-400">
              No internal notes.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[28px] sm:rounded-4xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-black font-outfit text-zinc-950 dark:text-white text-base sm:text-lg tracking-tight">
              Security & audit
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Recent administrative actions for this account.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-bold h-9 px-4 border-zinc-200/80 dark:border-zinc-800"
            disabled={isOwnProfile || revoking}
            onClick={() => setIsLogoutConfirmOpen(true)}
          >
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            Force logout
          </Button>
        </div>
        <div className="max-h-72 divide-y divide-zinc-100 dark:divide-zinc-800/80 overflow-y-auto">
          {audit.map((event) => (
            <div key={event._id} className="py-2.5">
              <p className="text-xs font-bold capitalize text-zinc-800 dark:text-zinc-200">
                {event.action.replaceAll(".", " ")}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-zinc-400">
                {event.actor?.fullName || "System"} ·{" "}
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {audit.length === 0 && (
            <p className="py-8 text-center text-xs font-semibold text-zinc-400">
              No administrative actions.
            </p>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setIsLogoutConfirmOpen(false);
          try {
            await revokeSessions(userId).unwrap();
            toast.success("Sessions revoked");
          } catch (error) {
            toast.error(error.data?.message || "Unable to revoke sessions");
          }
        }}
        title="Force logout?"
        description="Sign this user out from every active session?"
        confirmText="Logout user"
        variant="destructive"
        loading={revoking}
      />
    </section>
  );
}
