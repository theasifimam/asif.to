"use client";

import { useState } from "react";
import { Copy, MailPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminContent } from "@/components/admin";
import { UserModuleShell } from "../UserModuleShell";
import {
  useCancelInvitationMutation,
  useCreateInvitationMutation,
  useGetInvitationsQuery,
} from "@/redux/services/userApi";

export default function InvitationsPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("author");
  const [inviteUrl, setInviteUrl] = useState("");
  const { data, isLoading } = useGetInvitationsQuery({ limit: 50 });
  const [createInvitation, { isLoading: creating }] =
    useCreateInvitationMutation();
  const [cancelInvitation] = useCancelInvitationMutation();
  const invitations = data?.data?.invitations || [];

  const submit = async (event) => {
    event.preventDefault();
    try {
      const result = await createInvitation({ email, role }).unwrap();
      setInviteUrl(result.data.inviteUrl);
      setEmail("");
      toast.success(result.message || "Invitation created");
    } catch (error) {
      toast.error(error.data?.message || "Unable to create invitation");
    }
  };

  return (
    <UserModuleShell
        title="Invitations"
        description="Invite editorial users without creating or sharing passwords."
    >
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={submit}
          className="h-fit space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <h2 className="text-lg font-black text-zinc-950 dark:text-white">
              Invite a teammate
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Links expire after seven days and can only be accepted once.
            </p>
          </div>
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="author@example.com"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button disabled={creating} className="w-full">
            <MailPlus className="mr-2 h-4 w-4" />
            {creating ? "Creating…" : "Create invitation"}
          </Button>
          {inviteUrl && (
            <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Secure invitation link
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  toast.success("Invitation link copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </Button>
            </div>
          )}
        </form>
        <AdminContent>
          <div className="overflow-x-auto">
            <table className="admin-table w-full text-left text-sm">
              <thead className="bg-zinc-50/75 dark:bg-[#18181b]/60 border-b border-zinc-100 dark:border-zinc-800/80">
                <tr>
                  <th className="px-6 py-4.5">Email</th>
                  <th className="px-6 py-4.5">Role</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5">Expires</th>
                  <th className="px-6 py-4.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {invitations.map((invite) => (
                  <tr key={invite._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4.5 font-bold font-outfit text-zinc-950 dark:text-white">{invite.email}</td>
                    <td className="px-6 py-4.5">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20">
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${invite.effectiveStatus === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-500/20" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                        {invite.effectiveStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-zinc-500 text-xs font-medium">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      {invite.effectiveStatus === "pending" && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full px-3 text-xs font-bold border-zinc-200/80 dark:border-zinc-800"
                            onClick={async () => {
                              try {
                                const result = await createInvitation({
                                  email: invite.email,
                                  role: invite.role,
                                }).unwrap();
                                setInviteUrl(result.data.inviteUrl);
                                toast.success("Invitation resent");
                              } catch (error) {
                                toast.error(
                                  error.data?.message ||
                                    "Unable to resend invitation",
                                );
                              }
                            }}
                          >
                            Resend
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            aria-label={`Cancel invitation for ${invite.email}`}
                            onClick={async () => {
                              try {
                                await cancelInvitation(invite._id).unwrap();
                                toast.success("Invitation cancelled");
                              } catch (error) {
                                toast.error(
                                  error.data?.message ||
                                    "Unable to cancel invitation",
                                );
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && invitations.length === 0 && (
              <div className="py-16 text-center text-xs font-semibold text-zinc-400">
                No invitations yet.
              </div>
            )}
            {isLoading && (
              <div className="py-16 text-center text-xs font-semibold text-zinc-400">
                Loading invitations…
              </div>
            )}
          </div>
        </AdminContent>
      </div>
    </UserModuleShell>
  );
}
