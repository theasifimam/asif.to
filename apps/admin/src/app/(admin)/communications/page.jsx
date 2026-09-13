"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { sections } from "@/components/communications/CommunicationsShell";
export default function CommunicationsHome() {
  const { user } = useAuth(), router = useRouter();
  const first = sections.find(item => hasPermission(user, item.permission));
  useEffect(() => { if (first) router.replace(`/communications/${first.key}`); }, [first, router]);
  return <p className="p-6 text-sm text-zinc-400">{first ? "Opening communications?" : "You do not have access to communications."}</p>;
}
