"use client";

import { useState } from "react";
import { NeoModal } from "@/components/ui/neo-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";









export function BanUserModal({ isOpen, onClose, userId, username, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const isConfirmed = confirmation === username;

  const handleBan = async () => {
    if (!isConfirmed) return;
    if (!reason.trim()) {
      toast.error("Please provide a reason for the ban");
      return;
    }

    setLoading(true);
    try {
      const res = await usersApi.ban(userId, reason);
      if (res.success) {
        toast.success(`@${username} has been permanently banned`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Failed to ban user");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeoModal
      isOpen={isOpen}
      onClose={onClose}
      title="PERMANENT BAN"
      description={`Permanently disable access for @${username}. This action cannot be easily undone.`}
      variant="danger"
      footer={
      <div className="flex gap-3 w-full">
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1 rounded-[12px] font-bold">
                        Cancel
                    </Button>
                    <Button
          onClick={handleBan}
          disabled={loading || !isConfirmed}
          className="flex-1 rounded-[12px] bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide">
          
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Execute Ban"}
                    </Button>
                </div>
      }>
      
            <div className="space-y-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                        Banning this user will remove their profile visibility and prevent them from logging in. All their content may be hidden.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Reason for Ban</Label>
                    <Input
            placeholder="Severe violation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)} />
          
                </div>

                <div className="space-y-2">
                    <Label className="text-red-500">Type "{username}" to confirm</Label>
                    <Input
            placeholder={username}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="border-red-500/30 focus-visible:ring-red-500/30" />
          
                </div>
            </div>
        </NeoModal>);

}