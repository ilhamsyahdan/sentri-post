// features/admin/queue/components/queue-stats-cards.tsx

import {
  Clock,
  Loader2,
  AlertCircle,
  XOctagon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueueStats } from "../services/queue-service";

interface QueueStatsCardsProps {
  stats: QueueStats;
}

const CARDS = [
  {
    key: "queued" as keyof QueueStats,
    label: "Queued",
    icon: Clock,
    iconClass: "text-gray-400",
    valueClass: "text-gray-700 dark:text-zinc-200",
    wrapperClass:
      "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40",
  },
  {
    key: "publishing" as keyof QueueStats,
    label: "Publishing",
    icon: Loader2,
    iconClass: "text-gray-400 animate-spin",
    valueClass: "text-gray-700 dark:text-zinc-200",
    wrapperClass:
      "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40",
  },
  {
    key: "published_today" as keyof QueueStats,
    label: "Published Today",
    icon: CheckCircle2,
    iconClass: "text-[#3D6B4F]",
    valueClass: "text-[#2A4B38] dark:text-[#8FA894]",
    wrapperClass:
      "border-[#B7D9CB] bg-[#E6F2ED]/40 dark:border-[#2A4B38]/30 dark:bg-[#2A4B38]/10",
  },
  {
    key: "failed" as keyof QueueStats,
    label: "Failed",
    icon: AlertCircle,
    iconClass: "text-rose-400",
    valueClass: "text-rose-600/90 dark:text-rose-300/80",
    wrapperClass:
      "border-rose-100 bg-rose-50/40 dark:border-rose-900/20 dark:bg-rose-950/10",
  },
  {
    key: "failed_permanent" as keyof QueueStats,
    label: "Permanent Fail",
    icon: XOctagon,
    iconClass: "text-rose-500",
    valueClass: "text-rose-700/90 dark:text-rose-300",
    wrapperClass:
      "border-rose-200 bg-rose-50/60 dark:border-rose-900/30 dark:bg-rose-950/20",
  },
] as const;

export function QueueStatsCards({ stats }: QueueStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {CARDS.map(
        ({ key, label, icon: Icon, iconClass, valueClass, wrapperClass }) => (
          <div
            key={key}
            className={cn(
              "rounded-xl border p-4 flex flex-col gap-2",
              wrapperClass
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-medium
                             text-gray-500
                         dark:text-zinc-500"
              >
                {label}
              </span>
              <Icon className={cn("h-3.5 w-3.5", iconClass)} />
            </div>
            <span
              className={cn("text-2xl font-semibold tabular-nums", valueClass)}
            >
              {stats[key].toLocaleString()}
            </span>
          </div>
        )
      )}
    </div>
  );
}
