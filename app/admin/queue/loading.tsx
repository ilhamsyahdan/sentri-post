// app/admin/queue/loading.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Streaming skeleton shown during server-side data fetch (Next.js App Router)
// ─────────────────────────────────────────────────────────────────────────────

import {
  QueueStatsSkeleton,
  QueueTableSkeleton,
} from "@/features/admin/queue/components/queue-states";
import { Skeleton } from "@/components/ui/skeleton";

export default function QueueLoading() {
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg bg-gray-200 dark:bg-zinc-800" />
              <Skeleton className="h-5 w-36 bg-gray-200 dark:bg-zinc-800" />
            </div>
            <Skeleton className="h-4 w-64 ml-9 bg-gray-100 dark:bg-zinc-800/60" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full bg-gray-200 dark:bg-zinc-800" />
        </div>

        <QueueStatsSkeleton />

        <div className="h-px bg-gray-200 dark:bg-zinc-800/60" />

        {/* Filter bar skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-zinc-800" />
          <div className="flex gap-2">
            {[80, 72, 76, 64, 100].map((w, i) => (
              <Skeleton
                key={i}
                className="h-7 rounded-md bg-gray-200 dark:bg-zinc-800"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>

        <QueueTableSkeleton rows={10} />
      </div>
    </div>
  );
}
