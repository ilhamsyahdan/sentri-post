// app/admin/queue/page.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import { Activity } from "lucide-react";

import {
  getQueuePage,
  getQueueStats,
} from "@/features/admin/queue/services/queue-service";
import { QueueView } from "@/features/admin/queue/components/queue-view";
import { QueueStatsCards } from "@/features/admin/queue/components/queue-stats-cards";
import {
  QueueStatsSkeleton,
  QueueTableSkeleton,
} from "@/features/admin/queue/components/queue-states";
import type { QueueStatus } from "@/features/admin/queue/types/queue-types";

export const metadata: Metadata = {
  title: "Queue Monitor · Sentripost Admin",
  description: "Monitor and manage the post publishing queue.",
};

interface PageProps {
  searchParams: Promise<{ search?: string; statuses?: string; page?: string }>;
}

function parseStatuses(raw?: string): QueueStatus[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean) as QueueStatus[];
}

export default async function QueuePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = {
    search: params.search || undefined,
    statuses: parseStatuses(params.statuses),
    page: Number(params.page ?? "1"),
    pageSize: 20,
  };

  const [initialData, stats] = await Promise.all([
    getQueuePage(filters),
    getQueueStats(),
  ]);

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* Icon container */}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700">
                <Activity className="h-4 w-4 text-gray-500 dark:text-zinc-300" />
              </div>

              {/* Page title */}
              <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                Queue Monitor
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm ml-9 text-gray-500 dark:text-zinc-500">
              Real-time view of all post targets and their publish status.
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-[#E6F2ED] border border-[#B7D9CB] dark:bg-zinc-900 dark:border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D6B4F] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3D6B4F]" />
            </span>
            <span className="text-xs text-[#2A4B38] dark:text-zinc-400">
              Live
            </span>
          </div>
        </div>

        {/* ── Stats Cards ────────────────────────────────────────────────── */}
        <Suspense fallback={<QueueStatsSkeleton />}>
          <QueueStatsCards stats={stats} />
        </Suspense>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div className="h-px bg-gray-200 dark:bg-zinc-800/60" />

        {/* ── Queue Table ────────────────────────────────────────────────── */}
        <Suspense fallback={<QueueTableSkeleton />}>
          <QueueView initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}
