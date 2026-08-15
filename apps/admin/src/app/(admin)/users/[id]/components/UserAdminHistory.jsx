"use client";

import { useState } from "react";
import { KeyRound, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
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
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-black text-zinc-950 dark:text-white">
              Internal notes
            </h2>
            <p className="text-xs text-zinc-500">
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
          />
          <Button disabled={isLoading || !body.trim()} onClick={saveNote}>
            Add
          </Button>
        </div>
        <div className="mt-5 max-h-64 space-y-3 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note._id}
              className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-950"
            >
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {note.body}
              </p>
              <p className="mt-2 text-[10px] text-zinc-400">
                {note.author?.fullName} ·{" "}
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="py-8 text-center text-xs text-zinc-400">
              No internal notes.
            </p>
          )}
        </div>
      </div>
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-black text-zinc-950 dark:text-white">
              Security & audit
            </h2>
            <p className="text-xs text-zinc-500">
              Recent administrative actions for this account.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isOwnProfile || revoking}
            onClick={async () => {
              if (!confirm("Sign this user out from every active session?"))
                return;
              try {
                await revokeSessions(userId).unwrap();
                toast.success("Sessions revoked");
              } catch (error) {
                toast.error(error.data?.message || "Unable to revoke sessions");
              }
            }}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Force logout
          </Button>
        </div>
        <div className="max-h-72 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
          {audit.map((event) => (
            <div key={event._id} className="py-3">
              <p className="text-xs font-bold capitalize text-zinc-700 dark:text-zinc-300">
                {event.action.replaceAll(".", " ")}
              </p>
              <p className="mt-1 text-[10px] text-zinc-400">
                {event.actor?.fullName || "System"} ·{" "}
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {audit.length === 0 && (
            <p className="py-8 text-center text-xs text-zinc-400">
              No administrative actions.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
