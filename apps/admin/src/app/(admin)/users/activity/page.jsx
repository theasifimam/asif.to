"use client";

import {
  AdminContent,
  AdminPagination,
} from "@/components/admin";
import { UserModuleShell } from "../UserModuleShell";
import { useGetAuditLogsQuery } from "@/redux/services/userApi";
import { useState } from "react";

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
          {logs.map((log) => (
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
          ))}
          {!isLoading && logs.length === 0 && (
            <div className="py-20 text-center text-sm text-zinc-500">
              No administrative activity recorded yet.
            </div>
          )}
          {isLoading && (
            <div className="py-20 text-center text-sm text-zinc-500">
              Loading activity…
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
