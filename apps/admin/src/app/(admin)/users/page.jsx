"use client";

import { useState } from "react";
import { RefreshCw, UserPlus } from "lucide-react";
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
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";
import {
  useCreateUserMutation,
  useGetUsersQuery,
} from "@/redux/services/userApi";
import { UserTable } from "./UserTable";
import { AddUserModal } from "./AddUserModal";
import { ViewToggle } from "@/components/ViewToggle";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const {
    data: response,
    isLoading: loading,
    refetch,
  } = useGetUsersQuery({
    page: currentPage,
    limit: 10,
    ...(search && { search }),
    ...(roleFilter !== "all" && { role: roleFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  });
  const [createUser, { isLoading: submitting }] = useCreateUserMutation();
  const users = response?.data?.users || [];
  const pagination = response?.data?.pagination || {
    page: 1,
    total: 0,
    totalPages: 1,
  };

  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData).unwrap();
      toast.success("User provisioned successfully");
      setIsAddOpen(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to create user");
    }
  };

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="User management"
        title="Users"
        description="Manage roles, permissions, and account status for all editorial users."
        actions={
          <div className="flex items-center gap-2 w-full">
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button
              variant="outline"
              size="icon"
              onClick={refetch}
              title="Refresh users"
              className="md:flex-2 sm:flex-1 sm:w-full"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
            </Button>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="md:flex-3 sm:flex-3 sm:w-full"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add user
            </Button>
          </div>
        }
      />
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={updateFilter(setSearch)}
          placeholder="Search users"
        />
        <Select value={roleFilter} onValueChange={updateFilter(setRoleFilter)}>
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
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
          <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900 md:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilters>
      <AdminContent plain={viewMode === "card"}>
        <UserTable users={users} loading={loading} viewMode={viewMode} />
        <AdminPagination
          page={pagination.page}
          pages={pagination.totalPages}
          total={pagination.total}
          itemLabel="users"
          onPageChange={setCurrentPage}
        />
      </AdminContent>
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleCreateUser}
        submitting={submitting}
      />
    </AdminPage>
  );
}
