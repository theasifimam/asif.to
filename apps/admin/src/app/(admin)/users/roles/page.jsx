"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AdminContent } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGetPermissionMatrixQuery,
  useUpdatePermissionMatrixMutation,
} from "@/redux/services/userApi";
import { UserModuleShell } from "../UserModuleShell";

const roles = ["reader", "author", "editor", "admin", "super_admin"];
const roleLabel = (role) => role.replace("_", " ");

export default function RolesPage() {
  const { user, checkUser } = useAuth();
  const { data, isLoading, isError, refetch } = useGetPermissionMatrixQuery();
  const [updateMatrix, { isLoading: isSaving }] = useUpdatePermissionMatrixMutation();
  const [matrix, setMatrix] = useState(null);
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const payload = data?.data;
  const canEdit = user?.role === "super_admin";
  const currentMatrix = matrix || payload?.roles;

  const groups = useMemo(() => {
    const result = [];
    for (const permission of payload?.catalog || []) {
      let group = result.find((item) => item.name === permission.group);
      if (!group) {
        group = { name: permission.group, permissions: [] };
        result.push(group);
      }
      group.permissions.push(permission);
    }
    return result;
  }, [payload]);

  const toggle = (role, permission) => {
    if (!canEdit || role === "super_admin") return;
    setMatrix((current) => {
      const base = current || payload.roles;
      const selected = new Set(base[role] || []);
      if (selected.has(permission)) selected.delete(permission);
      else selected.add(permission);
      return { ...base, [role]: [...selected] };
    });
  };

  const save = async () => {
    try {
      await updateMatrix(currentMatrix).unwrap();
      await checkUser();
      toast.success("Role permissions updated");
    } catch (error) {
      toast.error(error?.data?.message || "Unable to update permissions");
    }
  };

  const toggleGroup = (name) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (isLoading || !currentMatrix) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;
  }

  if (isError) {
    return <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Unable to load permissions. <button className="font-bold underline" onClick={refetch}>Try again</button></div>;
  }

  return (
    <UserModuleShell
        title="Roles & permissions"
        description="Choose exactly which areas each role can view and manage. Changes are enforced by the server and reflected in navigation."
        actions={canEdit ? <div className="flex gap-2"><Button variant="outline" onClick={() => setMatrix(payload.defaults)}><RotateCcw className="mr-2 h-4 w-4" />Defaults</Button><Button onClick={save} disabled={isSaving}><Save className="mr-2 h-4 w-4" />{isSaving ? "Saving…" : "Save changes"}</Button></div> : null}
    >
      <AdminContent>
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{canEdit ? "Super admin access is permanently protected. Save after changing the matrix; affected users receive the new permissions on their next authenticated request." : "This matrix is read-only. Only a super admin can change role permissions."}</p>
        </div>
        <div className="overflow-x-auto rounded-[28px] sm:rounded-[32px] border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
          <table className="admin-table w-full min-w-[860px] text-sm">
            <thead className="bg-zinc-50/75 dark:bg-[#18181b]/60 border-b border-zinc-100 dark:border-zinc-800/80">
              <tr>
                <th className="sticky left-0 z-10 bg-zinc-50/90 p-4.5 text-left text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500 dark:bg-[#18181b]/90">Permission</th>
                {roles.map((role) => <th key={role} className="p-4.5 text-center text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">{roleLabel(role)}</th>)}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <PermissionGroup
                  key={group.name}
                  group={group}
                  matrix={currentMatrix}
                  toggle={toggle}
                  canEdit={canEdit}
                  expanded={openGroups.has(group.name)}
                  onToggle={() => toggleGroup(group.name)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </AdminContent>
    </UserModuleShell>
  );
}

function PermissionGroup({
  group,
  matrix,
  toggle,
  canEdit,
  expanded,
  onToggle,
}) {
  return <>
    <tr className="border-y border-zinc-200/70 bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-900/80">
      <td colSpan={6} className="p-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600 transition-colors hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/70 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-4 w-4 text-blue-600" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
            {group.name}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-normal text-zinc-500 shadow-2xs dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
            {group.permissions.length} permissions
          </span>
        </button>
      </td>
    </tr>
    {expanded && group.permissions.map((permission) => <tr key={permission.key} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/70 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors">
      <td className="sticky left-0 bg-white p-4.5 dark:bg-[#121215]"><div className="font-bold font-outfit text-zinc-950 dark:text-zinc-100">{permission.label}</div><code className="text-[10px] font-semibold text-zinc-400">{permission.key}</code></td>
      {roles.map((role) => {
        const allowed = role === "super_admin" || matrix[role]?.includes("*") || matrix[role]?.includes(permission.key);
        const disabled = !canEdit || role === "super_admin";
        return <td key={role} className="p-3 text-center"><button type="button" disabled={disabled} onClick={() => toggle(role, permission.key)} aria-label={`${allowed ? "Remove" : "Grant"} ${permission.label} for ${roleLabel(role)}`} className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border transition-all ${allowed ? "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40" : "border-zinc-200 bg-white text-transparent dark:border-zinc-800 dark:bg-zinc-950"} ${disabled ? "cursor-not-allowed opacity-70" : "hover:border-blue-400 active:scale-95"}`}>{allowed && <Check className="h-3.5 w-3.5" />}</button></td>;
      })}
    </tr>)}
  </>;
}
