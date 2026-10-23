// app/admin/users/loading.tsx
// Next.js route-level loading UI — shown during initial navigation

import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserTableSkeleton } from "@/features/admin/users/components/user-table-skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Users className="h-4.5 w-4.5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">
            User Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage accounts, roles, and access control
          </p>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[76px] animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="py-3 pl-4 text-xs font-medium text-muted-foreground">
                User
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Ban Reason
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Joined
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <UserTableSkeleton rows={8} />
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
