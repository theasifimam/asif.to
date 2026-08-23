"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Download, RefreshCw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminContent,
  AdminFilters,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import {
  useGetUsersQuery,
  useCreateInvitationMutation,
  useUpdateUserMutation,
} from "@/redux/services/userApi";
import { UserTable } from "./UserTable";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { UserOverview } from "./UserOverview";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { UserModuleShell } from "./UserModuleShell";

const EditUserModal = dynamic(() =>
  import("./EditUserModal").then((module) => module.EditUserModal),
);
const AddUserModal = dynamic(() =>
  import("./AddUserModal").then((module) => module.AddUserModal),
);

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [urlFilters, setUrlFilters] = useUrlFilters({ view: "table" });
  const viewMode = urlFilters.view || "table";
  const setViewMode = (v) =>
    setUrlFilters((current) => ({ ...current, view: v }));
  const [editingUser, setEditingUser] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const deferredSearch = useDebouncedValue(search);
  const {
    data: response,
    isLoading: loading,
    refetch,
  } = useGetUsersQuery({
    page: currentPage,
    limit,
    ...(deferredSearch && { search: deferredSearch }),
    ...(roleFilter !== "all" && { role: roleFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(providerFilter !== "all" && { provider: providerFilter }),
    ...(verifiedFilter !== "all" && { verified: verifiedFilter }),
    sort,
  });
  const users = response?.data?.users || [];
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [createInvitation, { isLoading: inviting }] =
    useCreateInvitationMutation();
  const pagination = response?.data?.pagination || {
    page: 1,
    total: 0,
    totalPages: 1,
  };

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("asif_admin_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/export.csv`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "asif-users.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to export users");
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingUser) return;
    try {
      await updateUser({ id: editingUser._id, formData }).unwrap();
      toast.success("User updated successfully");
      setEditingUser(null);
    } catch (error) {
      toast.error(error.data?.message || "Unable to update user");
    }
  };

  const handleInvite = async ({ email, role }) => {
    try {
      const result = await createInvitation({ email, role }).unwrap();
      toast.success(result.message || "Invitation sent");
      return result.data;
    } catch (error) {
      toast.error(error.data?.message || "Unable to invite user");
      throw error;
    }
  };

  return (
    <UserModuleShell
      title="Users"
      description="Manage roles, permissions, and account status for all editorial users."
      actions={
        <>
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          {hasPermission(currentUser, "users.edit") && (
            <Button
              variant="outline"
              onClick={handleExport}
              className="hidden sm:inline-flex"
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            title="Refresh users"
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
          </Button>
          {hasPermission(currentUser, "invitations.manage") && (
            <Button
              onClick={() => setIsAddOpen(true)}
              className="w-full sm:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add user
            </Button>
          )}
        </>
      }
    >
      <UserOverview />
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={updateFilter(setSearch)}
          placeholder="Search users..."
        />
        <Select value={roleFilter} onValueChange={updateFilter(setRoleFilter)}>
          <SelectTrigger className="h-10 w-full rounded-full bg-white/90 px-4 text-xs font-semibold  dark:bg-[#18181b] md:w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="reader">Reader</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={updateFilter(setStatusFilter)}
        >
          <SelectTrigger className="h-10 w-full rounded-full bg-white/90 px-4 text-xs font-semibold  dark:bg-[#18181b] md:w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="deactivated">Deactivated</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={providerFilter}
          onValueChange={updateFilter(setProviderFilter)}
        >
          <SelectTrigger className="h-10 w-full rounded-full bg-white/90 px-4 text-xs font-semibold  dark:bg-[#18181b] md:w-36">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="credentials">Email</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="github">GitHub</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={verifiedFilter}
          onValueChange={updateFilter(setVerifiedFilter)}
        >
          <SelectTrigger className="h-10 w-full rounded-full bg-white/90 px-4 text-xs font-semibold  dark:bg-[#18181b] md:w-36">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={updateFilter(setSort)}>
          <SelectTrigger className="h-10 w-full rounded-full bg-white/90 px-4 text-xs font-semibold  dark:bg-[#18181b] md:w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="recently_active">Recently active</SelectItem>
            <SelectItem value="least_active">Least active</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilters>
      <AdminContent plain={viewMode === "card"}>
        <UserTable
          users={users}
          loading={loading}
          viewMode={viewMode}
          onUpdate={setEditingUser}
          canUpdate={hasPermission(currentUser, "users.edit")}
          limit={limit}
        />
        <AdminPagination
          page={pagination.page}
          pages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onLimitChange={(val) => {
            setLimit(val);
            setCurrentPage(1);
          }}
          itemLabel="users"
          onPageChange={setCurrentPage}
        />
      </AdminContent>
      {editingUser && (
        <EditUserModal
          key={editingUser._id}
          isOpen
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onUpdate={handleUpdate}
          submitting={updating}
        />
      )}
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleInvite}
        submitting={inviting}
      />
    </UserModuleShell>
  );
}
