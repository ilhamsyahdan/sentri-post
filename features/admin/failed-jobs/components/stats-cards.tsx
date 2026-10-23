// features/admin/failed-jobs/components/StatsCards.tsx
import {
  AlertTriangle,
  XCircle,
  RefreshCw,
  Globe,
  Users,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FailedJobsStats } from "../types";

interface Props {
  stats: FailedJobsStats;
}

const cards = [
  {
    key: "total_failed" as keyof FailedJobsStats,
    label: "Transient Failures",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description: "status = failed, will retry",
  },
  {
    key: "total_permanent" as keyof FailedJobsStats,
    label: "Permanent Failures",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    description: "Terminal — needs investigation",
  },
  {
    key: "total_retryable" as keyof FailedJobsStats,
    label: "Retryable Now",
    icon: RefreshCw,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    description: "retry_count < max_retries",
  },
  {
    key: "platforms_affected" as keyof FailedJobsStats,
    label: "Platforms Affected",
    icon: Globe,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description: "Distinct platforms with failures",
  },
  {
    key: "users_affected" as keyof FailedJobsStats,
    label: "Users Affected",
    icon: Users,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    description: "Distinct users impacted",
  },
  {
    key: "avg_retry_count" as keyof FailedJobsStats,
    label: "Avg Retries",
    icon: Activity,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    description: "Per failed job",
  },
];

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(
        ({ key, label, icon: Icon, color, bg, border, description }) => (
          <Card
            key={key}
            className={`border ${border} bg-transparent transition-all hover:scale-[1.02]`}
          >
            <CardContent className="p-4">
              <div className={`mb-3 inline-flex rounded-lg p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="text-2xl font-bold tabular-nums text-white">
                {stats[key]}
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-300">
                {label}
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                {description}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
