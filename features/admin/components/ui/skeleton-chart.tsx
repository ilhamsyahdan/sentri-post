import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonChart() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm">
      {/* Chart Title / Header Skeleton */}
      <Skeleton className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 mb-5" />

      {/* Chart Canvas Area Skeleton */}
      <Skeleton className="h-48 w-full rounded-lg bg-zinc-150 dark:bg-zinc-800/50" />
    </div>
  );
}
