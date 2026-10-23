// app/admin/users/page.tsx
// Async Server Component — data fetched server-side, parallel where possible

import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getUsersPage } from "@/features/admin/users/services/user-service";
import { UserTable } from "@/features/admin/users/components/user-table";
import { UserTableSkeleton } from "@/features/admin/users/components/user-table-skeleton";
import { UserSearch } from "@/features/admin/users/components/user-search";
import { UserFilters } from "@/features/admin/users/components/user-filters";
import { UserPagination } from "@/features/admin/users/components/user-pagination";
import { buildUsersQueryParams } from "@/features/admin/users/utils/user-utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export const metadata = {
  title: "User Management — Sentripost Admin",
};

// ─── Stats Card ────────────────────────────────────────────────────────────

function StatsCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Skeleton Header Table ──────────────────────────────────────────────────

function TableSkeleton() {
  return (
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
  );
}

// ─── Main Data Section ──────────────────────────────────────────────────────

async function UsersContent({
  queryParams,
  currentAdminId,
}: {
  queryParams: ReturnType<typeof buildUsersQueryParams>;
  currentAdminId: string;
}) {
  const result = await getUsersPage(queryParams);
  const isFiltered =
    !!queryParams.search ||
    queryParams.status !== "all" ||
    queryParams.role !== "all";

  return (
    <>
      <UserTable
        users={result.data}
        currentAdminId={currentAdminId}
        isFiltered={isFiltered}
      />
      <UserPagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        limit={result.limit}
      />
    </>
  );
}

// ─── Stats Section ──────────────────────────────────────────────────────────

async function UsersStats() {
  // Parallel fetch: all users, banned users
  const [all, banned] = await Promise.all([
    getUsersPage({
      page: 1,
      limit: 1,
      search: "",
      status: "all",
      role: "all",
      sortBy: "created_at",
      sortOrder: "desc",
    }),
    getUsersPage({
      page: 1,
      limit: 1,
      search: "",
      status: "banned",
      role: "all",
      sortBy: "created_at",
      sortOrder: "desc",
    }),
  ]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatsCard label="Total Users" value={all.total} />
      <StatsCard
        label="Active"
        value={all.total - banned.total}
        sub="Not banned"
      />
      <StatsCard label="Banned" value={banned.total} />
      <StatsCard
        label="Ban Rate"
        value={
          all.total > 0
            ? `${((banned.total / all.total) * 100).toFixed(1)}%`
            : "0%"
        }
      />
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function UsersPage({ searchParams }: PageProps) {
  const { userId, sessionClaims } = await auth();

  if (!userId) redirect("/sign-in");
  if ((sessionClaims?.metadata as { role?: string })?.role !== "admin") {
    redirect("/dashboard/publish");
  }

  const resolvedParams = await searchParams;
  const queryParams = buildUsersQueryParams(resolvedParams);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100/80 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <Users className="h-4.5 w-4.5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="dark:text-white text-base font-semibold text-foreground">
            User Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage accounts, roles, and access control
          </p>
        </div>
      </div>

      {/* Stats — parallel fetch */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[76px] animate-pulse rounded-lg border border-border bg-muted"
              />
            ))}
          </div>
        }
      >
        <UsersStats />
      </Suspense>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <UserSearch />
        <UserFilters />
      </div>

      {/* Table */}
      <Suspense fallback={<TableSkeleton />}>
        <UsersContent queryParams={queryParams} currentAdminId={userId} />
      </Suspense>
    </div>
  );
}
