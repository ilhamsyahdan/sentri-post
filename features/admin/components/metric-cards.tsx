import type { OverviewStats } from "@/features/admin/types/admin.types";
import { fmt, fmtPct, healthOf } from "../utils/formatters";

function Card({
  label,
  value,
  status = "neutral",
  description,
}: {
  label: string;
  value: string | number;
  status?: "healthy" | "warning" | "critical" | "neutral";
  description?: string;
}) {
  // Hanya tampilkan garis top Accent jika status BUKAN neutral
  const topLine = {
    healthy: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
    neutral: "hidden", // Sembunyikan garis tipis jika status netral
  }[status];

  const badge = {
    healthy:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border dark:border-emerald-800/50",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 dark:border dark:border-amber-800/50",
    critical:
      "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 dark:border dark:border-red-800/50",
    neutral: "",
  }[status];

  const dot = {
    healthy: "bg-emerald-500",
    warning: "bg-amber-500 animate-pulse",
    critical: "bg-red-500 animate-pulse",
    neutral: "",
  }[status];

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700">
      {/* Accent line tipis di bagian atas khusus untuk status aktif */}
      {status !== "neutral" && (
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${topLine}`} />
      )}

      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-zinc-400">
          {label}
        </span>
        {status !== "neutral" && (
          <span
            className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-md ${badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {status}
          </span>
        )}
      </div>

      <span className="text-3xl font-semibold tracking-tight text-gray-900 tabular-nums dark:text-zinc-100">
        {value}
      </span>

      {description && (
        <p className="text-xs text-gray-400 leading-relaxed dark:text-zinc-500">
          {description}
        </p>
      )}
    </div>
  );
}

export function MetricCards({ stats }: { stats: OverviewStats }) {
  const h = healthOf(stats.successRate24h);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card
        label="Success Rate (24h)"
        value={fmtPct(stats.successRate24h)}
        status={h}
        description={`${fmt(stats.totalPublished24h)} published / ${fmt(
          stats.totalPublished24h +
            stats.totalFailed24h +
            stats.totalPermanentFailed24h
        )} attempted`}
      />
      <Card
        label="Published (24h)"
        value={fmt(stats.totalPublished24h)}
        description="Successfully delivered"
      />
      <Card
        label="Failed Jobs"
        value={fmt(stats.totalFailed24h)}
        status={
          stats.totalFailed24h > 50
            ? "critical"
            : stats.totalFailed24h > 10
            ? "warning"
            : "neutral"
        }
        description={`${stats.totalPermanentFailed24h} permanent`}
      />
      <Card
        label="Retry Pressure"
        value={fmt(stats.retryPressure)}
        status={
          stats.retryPressure > 100
            ? "critical"
            : stats.retryPressure > 20
            ? "warning"
            : "neutral"
        }
        description="Retryable failures in queue"
      />
      <Card
        label="Queue Depth"
        value={fmt(stats.queuedCount)}
        status={stats.queuedCount > 500 ? "warning" : "neutral"}
        description={`${fmt(stats.publishingCount)} currently publishing`}
      />
      <Card
        label="Active Users (24h)"
        value={fmt(stats.activeUsers24h)}
        description={`${fmt(stats.activeUsers7d)} this week`}
      />
      <Card
        label="Connections"
        value={fmt(stats.totalConnections)}
        description={`${fmt(stats.totalConnections)} Total connect`}
      />
      <Card
        label="Posts Today"
        value={fmt(stats.totalPostsToday)}
        description={`${fmt(stats.totalPostsAllTime)} all-time`}
      />
    </div>
  );
}
