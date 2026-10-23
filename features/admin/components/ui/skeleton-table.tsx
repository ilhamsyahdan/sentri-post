import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800/80 dark:bg-zinc-900/60 backdrop-blur-sm">
      {/* Header Skeleton */}
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800/80">
        <Skeleton className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Row Skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0"
        >
          <Skeleton className="h-3 w-44 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-3 w-16 bg-zinc-150 dark:bg-zinc-800/60 ml-auto" />
          <Skeleton className="h-5 w-14 rounded-md bg-zinc-150 dark:bg-zinc-800/60" />
        </div>
      ))}
    </div>
  );
}
