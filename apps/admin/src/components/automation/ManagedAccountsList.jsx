"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Search } from "lucide-react";
import { AutomationService } from "@/lib/automation.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { NeoModal } from "@/components/ui/neo-modal";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";

export function ManagedAccountsList({
  accounts,
  loading,
  onAddAccount,
  onRemoveAccount,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newUsername) return;

    setAdding(true);
    try {
      await onAddAccount(newUsername, newNotes);
      setNewUsername("");
      setNewNotes("");
      setIsAddModalOpen(false);
    } catch (error) {
      // Error handling is done in parent or service
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveClick = (id) => {
    setRemoveTargetId(id);
  };

  const handleRemoveConfirm = async () => {
    if (!removeTargetId) return;
    setRemoving(true);
    try {
      await onRemoveAccount(removeTargetId);
      setRemoveTargetId(null);
    } catch (e) {
      // Error handling is done by caller
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Managed Accounts</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>

        <NeoModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Managed Account"
          description="Enter the username of the account you want to manage."
        >
          <form onSubmit={handleAddAccount} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Purpose of this account..."
              />
            </div>
            <Button
              type="submit"
              disabled={adding}
              className="w-full rounded-full"
            >
              {adding ? "Adding..." : "Add Account"}
            </Button>
          </form>
        </NeoModal>
      </div>

      <div className="admin-surface overflow-hidden rounded-[28px] sm:rounded-4xl">
        <table className="admin-table w-full text-sm">
          <thead className="bg-zinc-50/75 dark:bg-[#18181b]/60 border-b border-zinc-100 dark:border-zinc-800/80">
            <tr>
              <th className="px-6 py-4.5 text-left text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500 w-75">
                User
              </th>
              <th className="px-6 py-4.5 text-left text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                Notes
              </th>
              <th className="px-6 py-4.5 text-left text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                Added On
              </th>
              <th className="px-6 py-4.5 text-right text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-16 text-center text-xs font-semibold text-zinc-400"
                >
                  Loading accounts...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-16 text-center text-xs font-semibold text-zinc-400"
                >
                  No managed accounts yet. Add one to get started.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr
                  key={account._id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-200/80 dark:border-zinc-700/80">
                        <AvatarImage src={account.user.profilePicture?.url} />
                        <AvatarFallback className="font-bold text-xs">
                          {account.user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold font-outfit text-zinc-950 dark:text-white text-sm">
                          {account.user.fullName}
                        </div>
                        <div className="text-xs text-zinc-400">
                          @{account.user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                    {account.notes || "—"}
                  </td>
                  <td className="px-6 py-4.5 text-xs text-zinc-500 font-medium">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      onClick={() => handleRemoveClick(account._id)}
                    >
                      <Trash className="h-4 w-4 text-rose-500" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={!!removeTargetId}
        onClose={() => setRemoveTargetId(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove managed account?"
        description="Are you sure you want to remove this account? They will lose access to managed automation features."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        loading={removing}
      />
    </div>
  );
}
