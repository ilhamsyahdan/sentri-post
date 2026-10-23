import { cn } from "@/lib/utils";
import { QueueStatus, QUEUE_STATUS_LABELS } from "../types/queue-types";

interface QueueStatusBadgeProps {
  status: QueueStatus;
  className?: string;
}

const STATUS_STYLES: Record<QueueStatus, string> = {
  queued:
    "bg-sky-500/10 text-sky-400 border border-sky-500/20 ring-1 ring-sky-500/10",
  publishing:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20 ring-1 ring-amber-500/10 animate-pulse",
  published:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ring-1 ring-emerald-500/10",
  failed:
    "bg-rose-500/10 text-rose-400 border border-rose-500/20 ring-1 ring-rose-500/10",
  failed_permanent:
    "bg-red-900/20 text-red-400 border border-red-700/30 ring-1 ring-red-700/10",
};

const STATUS_DOTS: Record<QueueStatus, string> = {
  queued: "bg-sky-400",
  publishing: "bg-amber-400 animate-ping",
  published: "bg-emerald-400",
  failed: "bg-rose-400",
  failed_permanent: "bg-red-500",
};

export function QueueStatusBadge({ status, className }: QueueStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium tabular-nums",
        STATUS_STYLES[status],
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "publishing" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              STATUS_DOTS[status]
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            status === "publishing" ? "bg-amber-400" : STATUS_DOTS[status]
          )}
        />
      </span>
      {QUEUE_STATUS_LABELS[status]}
    </span>
  );
}
