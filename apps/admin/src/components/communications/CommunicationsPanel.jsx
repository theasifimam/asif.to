"use client";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { sections } from "./CommunicationsShell";
import InboxWorkspace from "./InboxWorkspace";
import DiscussionsWorkspace from "./DiscussionsWorkspace";
import ManagementWorkspace from "./ManagementWorkspace";
export default function CommunicationsPanel({ section, record }) {
  const { user } = useAuth();
  const definition = sections.find(item => item.key === section);
  if (definition?.permission && !hasPermission(user, definition.permission)) return <p className="rounded-2xl border p-6">You do not have access to this area.</p>;
  if (section === "inbox") return <InboxWorkspace />;
  if (section === "discussions") return <DiscussionsWorkspace />;
  return <ManagementWorkspace key={`${section}:${record || "list"}`} section={section} record={record} />;
}
