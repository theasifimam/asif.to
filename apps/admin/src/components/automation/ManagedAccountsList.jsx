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






















export function ManagedAccountsList({ accounts, loading, onAddAccount, onRemoveAccount }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [adding, setAdding] = useState(false);

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
    } finally {setAdding(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm("Are you sure you want to remove this account?")) return;
    await onRemoveAccount(id);
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
          description="Enter the username of the account you want to manage.">
          
                    <form onSubmit={handleAddAccount} className="space-y-4">
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                required />
              
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                id="notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Purpose of this account..." />
              
                        </div>
                        <Button type="submit" disabled={adding} className="w-full">
                            {adding ? "Adding..." : "Add Account"}
                        </Button>
                    </form>
                </NeoModal>
            </div>

            <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[300px]">User</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notes</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Added On</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ?
            <tr>
                                <td colSpan={4} className="p-4 text-center">Loading...</td>
                            </tr> :
            accounts.length === 0 ?
            <tr>
                                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                    No managed accounts yet. Add one to get started.
                                </td>
                            </tr> :

            accounts.map((account) =>
            <tr key={account._id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={account.user.profilePicture?.url} />
                                                <AvatarFallback>{account.user.username?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{account.user.fullName}</div>
                                                <div className="text-sm text-muted-foreground">@{account.user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">{account.notes || "-"}</td>
                                    <td className="p-4">{new Date(account.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemove(account._id)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </td>
                                </tr>
            )
            }
                    </tbody>
                </table>
            </div>
        </div>);

}