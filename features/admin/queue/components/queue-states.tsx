// features/admin/queue/components/queue-states.tsx

import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export function QueueTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div
      className="rounded-xl border overflow-hidden
                    bg-white      border-gray-200
                dark:bg-zinc-900/50 dark:border-zinc-800"
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-4 py-2.5 border-b
                      border-gray-200
                  dark:border-zinc-800"
      >
        {[40, 20, 16, 12, 8, 12, 20, 6].map((w, i) => (
          <Skeleton
            key={i}
            className="h-3 bg-gray-100 dark:bg-zinc-800"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-4 px-4 py-4 border-b",
            "border-gray-100 dark:border-zinc-800/60",
            i % 2 === 1
              ? "bg-gray-50/60 dark:bg-zinc-900/20"
              : "bg-white dark:bg-transparent"
          )}
        >
          <div className="flex flex-col gap-1.5" style={{ width: "40%" }}>
            <Skeleton className="h-3 w-full bg-gray-100 dark:bg-zinc-800" />
            <Skeleton className="h-3 w-2/3 bg-gray-100/70 dark:bg-zinc-800/60" />
          </div>
          <Skeleton className="h-5 w-[10%] rounded bg-gray-100 dark:bg-zinc-800" />
          <div className="flex flex-col gap-1.5" style={{ width: "16%" }}>
            <Skeleton className="h-3 w-full bg-gray-100 dark:bg-zinc-800" />
            <Skeleton className="h-2.5 w-3/4 bg-gray-100/70 dark:bg-zinc-800/60" />
          </div>
          <Skeleton className="h-5 w-[12%] rounded-md bg-gray-100 dark:bg-zinc-800" />
          <Skeleton className="h-3 w-[8%] bg-gray-100 dark:bg-zinc-800" />
          <Skeleton className="h-3 w-[12%] bg-gray-100 dark:bg-zinc-800" />
          <Skeleton className="h-3 w-[20%] bg-gray-100 dark:bg-zinc-800" />
          <Skeleton className="h-7 w-7 rounded-md ml-auto bg-gray-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

// ─── Stats Card Skeleton ──────────────────────────────────────────────────────
export function QueueStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border p-4 space-y-2
                     bg-white      border-gray-200
                 dark:bg-zinc-900/50 dark:border-zinc-800"
        >
          <Skeleton className="h-3 w-16 bg-gray-100 dark:bg-zinc-800" />
          <Skeleton className="h-6 w-10 bg-gray-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function QueueEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-xl border
                    bg-white      border-gray-200
                dark:bg-zinc-900/50 dark:border-zinc-800"
    >
      <div
        className="rounded-full p-4 mb-4
                      bg-gray-100
                  dark:bg-zinc-800/80"
      >
        <Inbox className="h-8 w-8 text-gray-400 dark:text-zinc-600" />
      </div>
      <h3
        className="text-sm font-medium mb-1
                     text-gray-700
                 dark:text-zinc-300"
      >
        {hasFilters ? "No results found" : "Queue is empty"}
      </h3>
      <p
        className="text-xs text-center max-w-xs
                    text-gray-400
                dark:text-zinc-600"
      >
        {hasFilters
          ? "Try adjusting your filters or search term."
          : "No post targets in the queue right now. New posts will appear here when scheduled."}
      </p>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────
export function QueueErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 rounded-xl border
                    bg-rose-50/50   border-rose-200
                dark:bg-rose-950/10 dark:border-rose-900/40"
    >
      <div
        className="rounded-full p-4 mb-4
                      bg-rose-100
                  dark:bg-rose-900/20"
      >
        <AlertCircle className="h-8 w-8 text-rose-500" />
      </div>
      <h3
        className="text-sm font-medium mb-1
                     text-rose-700
                 dark:text-rose-300"
      >
        Failed to load queue
      </h3>
      <p
        className="text-xs text-center max-w-xs mb-4
                    text-rose-500
                dark:text-rose-500/70"
      >
        {message ?? "An unexpected error occurred. Please try again."}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2
                     border-rose-300      text-rose-600      hover:bg-rose-50
                 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
