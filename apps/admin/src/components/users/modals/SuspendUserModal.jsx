"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useState } from "react";
import { NeoModal } from "@/components/ui/neo-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";










const DURATIONS = [
{ label: "24 Hours", value: "24h" },
{ label: "3 Days", value: "3d" },
{ label: "7 Days", value: "7d" },
{ label: "30 Days", value: "30d" }];


export function SuspendUserModal({ isOpen, onClose, userId, username, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("24h");

  const handleSuspend = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    setLoading(true);
    try {
      const res = await usersApi.suspend(userId, reason, duration);
      if (res.success) {
        toast.success(`@${username} has been suspended for ${duration}`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Failed to suspend user");
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
      title="Suspend User"
      description={`Temporarily restrict access for @${username}.`}
      variant="warning"
      footer={
      <div className="flex gap-3 w-full">
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1 rounded-[12px] font-bold">
                        Cancel
                    </Button>
                    <Button
          onClick={handleSuspend}
          disabled={loading}
          className="flex-1 rounded-[12px] bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wide">
          
                        {loading ? <LogoLoader className="w-4 h-4 "  /> : "Suspend Account"}
                    </Button>
                </div>
      }>
      
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                            {DURATIONS.map((d) =>
              <SelectItem key={d.value} value={d.value}>
                                    {d.label}
                                </SelectItem>
              )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input
            placeholder="Violation of community guidelines..."
            value={reason}
            onChange={(e) => setReason(e.target.value)} />
          
                </div>
            </div>
        </NeoModal>);

}