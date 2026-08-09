"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  ShieldAlert,
  Ban,
  EyeOff,
  MessageSquare,
  Flag,
  Loader2 } from
"lucide-react";
import {
  NeoDropdown,
  NeoDropdownItem,
  NeoDropdownLabel,
  NeoDropdownSeparator } from
"@/components/ui/neo-dropdown";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { SuspendUserModal } from "./modals/SuspendUserModal";
import { BanUserModal } from "./modals/BanUserModal";
import { WarnUserModal } from "./modals/WarnUserModal";










export function UserActions({
  userId,
  username,
  isSuspended,
  isBanned,
  isShadowRestricted: initialShadowRestricted,
  onActionComplete
}) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState(null);
  const [isShadowRestricted, setIsShadowRestricted] = useState(initialShadowRestricted);
  const [loading, setLoading] = useState(false);

  const handleShadowRestrictToggle = async () => {
    setLoading(true);
    const newState = !isShadowRestricted;
    try {
      const res = await usersApi.shadowRestrict(userId, newState);
      if (res.success) {
        setIsShadowRestricted(newState);
        toast.success(`Shadow restriction ${newState ? "enabled" : "disabled"} for @${username}`);
        if (onActionComplete) onActionComplete();
      } else {
        toast.error(res.error || "Failed to update shadow restriction");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReports = () => {
    router.push(`/reports?userId=${userId}`);
  };

  return (
    <>
            <NeoDropdown
        align="right"
        trigger={
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[10px] hover:bg-primary hover:text-primary-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
        }>
        
                <NeoDropdownLabel>Moderation Actions</NeoDropdownLabel>

                <NeoDropdownItem
          icon={<Flag className="w-4 h-4" />}
          onClick={handleViewReports}>
          
                    View Reports
                </NeoDropdownItem>

                <NeoDropdownItem
          icon={<MessageSquare className="w-4 h-4" />}
          onClick={() => setActiveModal("warn")}>
          
                    Send Warning
                </NeoDropdownItem>

                <NeoDropdownSeparator />

                <NeoDropdownItem
          icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
          onClick={handleShadowRestrictToggle}>
          
                    {isShadowRestricted ? "Disable Shadow Ban" : "Shadow Restrict"}
                </NeoDropdownItem>

                <NeoDropdownItem
          icon={<ShieldAlert className="w-4 h-4" />}
          className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
          onClick={() => setActiveModal("suspend")}
          disabled={isSuspended || isBanned}>
          
                    {isSuspended ? "Already Suspended" : "Suspend User"}
                </NeoDropdownItem>

                <NeoDropdownItem
          icon={<Ban className="w-4 h-4" />}
          variant="destructive"
          onClick={() => setActiveModal("ban")}
          disabled={isBanned}>
          
                    {isBanned ? "User Banned" : "Ban User"}
                </NeoDropdownItem>
            </NeoDropdown>

            <SuspendUserModal
        isOpen={activeModal === "suspend"}
        onClose={() => setActiveModal(null)}
        userId={userId}
        username={username}
        onSuccess={onActionComplete} />
      

            <BanUserModal
        isOpen={activeModal === "ban"}
        onClose={() => setActiveModal(null)}
        userId={userId}
        username={username}
        onSuccess={onActionComplete} />
      

            <WarnUserModal
        isOpen={activeModal === "warn"}
        onClose={() => setActiveModal(null)}
        userId={userId}
        username={username}
        onSuccess={onActionComplete} />
      
        </>);

}