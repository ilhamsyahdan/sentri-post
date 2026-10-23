// app/admin/failed-jobs/page.tsx
import { Suspense } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { StatsCards } from "@/features/admin/failed-jobs/components/stats-cards";
import { FiltersBar } from "@/features/admin/failed-jobs/components/filters-bar";
import { FailedJobsClient } from "@/features/admin/failed-jobs/components/failed-jobs-client";
import {
  getFailedJobs,
  getFailedJobsStats,
} from "@/features/admin/failed-jobs/lib/queries";
import type {
  FailedJobsFilters,
  Platform,
} from "@/features/admin/failed-jobs/types";

// export const dynamic = "force-dynamic"; // always fresh
// export const revalidate = 0;

const PAGE_SIZE = 20;

interface SearchParams {
  platform?: string;
  status?: string;
  search?: string;
  page?: string;
}

export default async function FailedJobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const filters: FailedJobsFilters = {
    platform: (params.platform as Platform) ?? "all",
    status: (params.status as FailedJobsFilters["status"]) ?? "all",
    search: params.search ?? "",
  };

  // Parallel data fetch — stats + paginated list
  const [stats, { data: jobs, total }] = await Promise.all([
    getFailedJobsStats(),
    getFailedJobs(filters, page),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-red-500" />
              <h1 className="text-xl font-semibold tracking-tight">
                Failed Jobs Monitor
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Inspect, diagnose, and recover failed publishing jobs across all
              platforms.
            </p>
          </div>

          {/* Hint: auto-refresh button (client-side) */}
          <form action="/admin/failed-jobs" method="get">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-500 hover:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </form>
        </div>

        {/* ── Stats ── */}
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards stats={stats} />
        </Suspense>

        {/* ── Filters ── */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <FiltersBar filters={filters} />
        </div>

        {/* ── Table ── */}
        <FailedJobsClient
          jobs={jobs}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-lg border border-slate-800 bg-slate-900/60"
        />
      ))}
    </div>
  );
}
