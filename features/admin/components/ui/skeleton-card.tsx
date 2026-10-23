import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-2 w-28" />
    </div>
  );
}
