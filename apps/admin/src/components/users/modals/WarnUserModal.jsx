"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useState } from "react";
import { NeoModal } from "@/components/ui/neo-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";










const TEMPLATES = [
{ id: "guidelines", label: "General Guidelines Violation", text: "Please review our community guidelines making posts." },
{ id: "harassment", label: "Harassment Warning", text: "Respectful communication is required. harassment is not tolerated." },
{ id: "spam", label: "Spam / Solicitation", text: "Please do not use the platform for spam or unsolicited promotion." },
{ id: "inappropriate", label: "Inappropriate Content", text: "Your recent content was flagged as inappropriate." }];


export function WarnUserModal({ isOpen, onClose, userId, username, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState("");

  const handleWarn = async () => {
    if (!templateId) {
      toast.error("Please select a warning template");
      return;
    }

    setLoading(true);
    try {
      const res = await usersApi.warn(userId, templateId);
      if (res.success) {
        toast.success(`Warning sent to @${username}`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Failed to send warning");
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
      title="Send Warning"
      description={`Notify @${username} of a violation.`}
      variant="default"
      footer={
      <div className="flex gap-3 w-full">
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1 rounded-[12px] font-bold">
                        Cancel
                    </Button>
                    <Button
          onClick={handleWarn}
          disabled={loading}
          className="flex-1 rounded-[12px] btn-techno-primary font-bold uppercase tracking-wide">
          
                        {loading ? <LogoLoader className="w-4 h-4 "  /> : "Send Notice"}
                    </Button>
                </div>
      }>
      
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Warning Template</Label>
                    <Select value={templateId} onValueChange={setTemplateId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                            {TEMPLATES.map((t) =>
              <SelectItem key={t.id} value={t.id}>
                                    {t.label}
                                </SelectItem>
              )}
                        </SelectContent>
                    </Select>
                </div>

                {templateId &&
        <div className="p-4 bg-muted/30 rounded-xl border border-border/10">
                        <p className="text-xs font-mono text-muted-foreground">PREVIEW:</p>
                        <p className="text-sm italic mt-1 text-foreground">
                            "{TEMPLATES.find((t) => t.id === templateId)?.text}"
                        </p>
                    </div>
        }
            </div>
        </NeoModal>);

}