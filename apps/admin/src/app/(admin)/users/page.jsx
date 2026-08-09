"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight } from
'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { useGetUsersQuery, useCreateUserMutation } from '@/redux/services/userApi';

// Components
import { UserTable } from './UserTable';
import { AddUserModal } from './AddUserModal';

// Types & Helpers
import { Input, Button } from '@/components/ui';

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // RTK Query hooks
  const { data: response, isLoading: loading, refetch } = useGetUsersQuery({
    page: currentPage,
    limit: 10,
    ...(search && { search }),
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter })
  });

  const [createUser, { isLoading: submitting }] = useCreateUserMutation();

  const users = response?.data?.users || [];
  const pagination = response?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData).unwrap();
      toast.success("User provisioned successfully");
      setIsAddOpen(false);
    } catch (err) {
      toast.error(err.data?.message || "Failed to create user");
    }
  };

  const fetchUsers = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="p-4 sm:p-8 md:p-12 flex flex-col gap-8 md:gap-10 max-w-[1600px] mx-auto text-zinc-900 dark:text-zinc-400 transition-colors duration-300">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-2 md:mt-0">
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="w-8 md:w-12 h-[1px] bg-zinc-400 dark:bg-zinc-800" />
                        <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">User Management</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
                        Users.
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-600 text-sm font-medium max-w-xl">
                        Manage roles, permissions, and account status for all editorial users.
                    </p>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <Button
            variant="outline"
            onClick={() => fetchUsers(pagination.page)}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 transition-all h-11 md:h-14"
            title="Refresh">
            
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </Button>
                    <Button
            onClick={() => setIsAddOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-6 md:px-8 h-11 md:h-14 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shadow-black/10 dark:shadow-white/5 transition-all">
            
                        <UserPlus size={16} />
                        Add User
                    </Button>
                </div>
            </section>

            {/* Filters */}
            <section className="flex flex-col lg:flex-row gap-4 lg:items-center bg-white dark:bg-zinc-950/40 p-4 md:p-5 rounded-[2rem] border border-zinc-200 dark:border-zinc-800/60 shadow-sm dark:shadow-none">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" size={14} />
                    <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 rounded-2xl md:rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-white transition-all text-xs h-11 md:h-12" />
          
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={roleFilter} onValueChange={(val) => {setRoleFilter(val);setCurrentPage(1);}}>
                        <SelectTrigger className="w-full sm:w-36 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-3xl h-11 md:h-12 text-[10px] font-black uppercase tracking-widest">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                            <SelectItem value="reader">Reader</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(val) => {setStatusFilter(val);setCurrentPage(1);}}>
                        <SelectTrigger className="w-full sm:w-36 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-3xl h-11 md:h-12 text-[10px] font-black uppercase tracking-widest">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="hidden sm:flex items-center px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                        Total: <span className="ml-2 text-zinc-900 dark:text-white">{pagination.total}</span>
                    </div>
                </div>
            </section>

            {/* Users Table */}
            <section className="bg-white dark:bg-zinc-950/40 rounded-[2rem] md:rounded-[32px] border border-zinc-200 dark:border-zinc-800/60 overflow-hidden shadow-sm dark:shadow-none transition-all">
                <UserTable
          users={users}
          loading={loading} />
        
            </section>

            {/* Pagination */}
            {pagination.totalPages > 1 &&
      <section className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-transparent border border-zinc-200 dark:border-zinc-800/50 rounded-2xl md:rounded-full shadow-sm dark:shadow-none">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
                        {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => setCurrentPage(pagination.page - 1)}
            className="p-2 h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-all">
            
                            <ChevronLeft size={14} />
                        </Button>
                        <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setCurrentPage(pagination.page + 1)}
            className="p-2 h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-all">
            
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </section>
      }

            {/* Modals */}
            <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleCreateUser}
        submitting={submitting} />
      
        </div>);

}