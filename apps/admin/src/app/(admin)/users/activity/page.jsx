"use client";

import {
  AdminContent,
  AdminPagination,
} from "@/components/admin";
import { UserModuleShell } from "../UserModuleShell";
import { useGetAuditLogsQuery } from "@/redux/services/userApi";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function UserActivityRowSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="h-3.5 w-32 rounded-md" />
      </div>
      <Skeleton className="h-3.5 w-24 rounded-md" />
    </div>
  );
}

export default function UserActivityPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const { data, isLoading } = useGetAuditLogsQuery({ page, limit });
  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination || {
    page: 1,
    total: 0,
    totalPages: 1,
  };
  return (
    <UserModuleShell
        title="Administrative activity"
        description="Immutable history of sensitive user-management actions."
    >
      <AdminContent>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {isLoading ? (
            Array.from({ length: limit }).map((_, i) => (
              <UserActivityRowSkeleton key={i} />
            ))
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log._id}
                className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {log.action.replaceAll(".", " ")}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {log.actor?.fullName || "Unknown admin"}
                    {log.targetUser ? ` → ${log.targetUser.fullName}` : ""}
                  </p>
                </div>
                <time className="text-xs text-zinc-400">
                  {new Date(log.createdAt).toLocaleString()}
                </time>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-sm text-zinc-500">
              No administrative activity recorded yet.
            </div>
          )}
        </div>
        <AdminPagination
          page={pagination.page}
          pages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onLimitChange={(val) => {
            setLimit(val);
            setPage(1);
          }}
          itemLabel="events"
          onPageChange={setPage}
        />
      </AdminContent>
    </UserModuleShell>
  );
}
