import { Suspense } from "react";

import {
  getOverviewStats,
  getThroughput24h,
  getPlatformStats,
  getFailedJobs,
  getActiveQueue,
  getWorkerHealth,
  getRecentActivity,
  getSuccessRate7d,
} from "@/features/admin/repositories/admin.repository";

import { MetricCards } from "@/features/admin/components/metric-cards";

import {
  ThroughputChart,
  PlatformBreakdown,
  SuccessRateChart,
} from "@/features/admin/components/charts";

import {
  FailedJobsTable,
  ActiveQueueTable,
  ActivityFeed,
} from "@/features/admin/components/tables";

import {
  SkeletonMetrics,
  SkeletonChart,
  SkeletonTable,
} from "@/features/admin/components/ui";
import { headers } from "next/headers";

// ======================================================
// PAGE CONFIG
// ======================================================

export const dynamic = "force-dynamic";

// ======================================================
// WORKER STATUS BAR
// ======================================================

async function WorkerBar() {
  const workerHealth = await getWorkerHealth();

  const lag =
    workerHealth.processingLagSeconds > 300
      ? "critical"
      : workerHealth.processingLagSeconds > 60
      ? "warning"
      : "healthy";

  const isHealthy = lag === "healthy";

  return (
    <>
      {!isHealthy && (
        <div
          className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3
          ${
            lag === "warning"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400"
              : "border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400"
          }`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full animate-pulse
            ${lag === "warning" ? "bg-amber-400" : "bg-red-400"}`}
          />

          <div className="flex-1 text-sm">
            <span className="font-semibold">
              {lag === "warning" ? "Worker degraded" : "Worker may be down"}
            </span>

            <span className="ml-2 opacity-70">
              Queue stuck for {workerHealth.processingLagSeconds}s
            </span>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-5 border-b border-gray-200 dark:border-zinc-800 pb-5 text-xs text-gray-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full
            ${
              isHealthy
                ? "bg-emerald-500"
                : lag === "warning"
                ? "bg-amber-400 animate-pulse"
                : "bg-red-400 animate-pulse"
            }`}
          />

          <span>
            System{" "}
            <span
              className={
                isHealthy
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : lag === "warning"
                  ? "text-amber-600 dark:text-amber-400 font-medium"
                  : "text-red-600 dark:text-red-400 font-medium"
              }
            >
              {isHealthy
                ? "operational"
                : lag === "warning"
                ? "degraded"
                : "incident"}
            </span>
          </span>
        </div>

        <span className="hidden sm:block">
          Lag{" "}
          <span className="font-mono text-gray-700 dark:text-zinc-300">
            {workerHealth.processingLagSeconds}s
          </span>
        </span>

        <span className="hidden sm:block">
          Queue{" "}
          <span className="font-mono text-gray-700 dark:text-zinc-300">
            {workerHealth.queuedJobs}
          </span>
        </span>

        <span className="hidden sm:block">
          Failed{" "}
          <span className="font-mono text-red-500 dark:text-red-400">
            {workerHealth.failedJobs}
          </span>
        </span>
      </div>
    </>
  );
}

// ======================================================
// METRICS
// ======================================================

async function MetricsSection() {
  await headers();
  const stats = await getOverviewStats();

  return <MetricCards stats={stats} />;
}

// ======================================================
// CHARTS
// ======================================================

async function ChartsSection() {
  const [throughput24h, platformStats, successRate] = await Promise.all([
    getThroughput24h(),
    getPlatformStats(),
    getSuccessRate7d(),
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ThroughputChart data={throughput24h} />
      </div>

      <PlatformBreakdown data={platformStats} />

      {/* nanti kalau sudah ada success rate */}
      <SuccessRateChart data={successRate} />
    </div>
  );
}

// ======================================================
// TABLES
// ======================================================

async function TablesSection() {
  const [failedJobs, activeQueue] = await Promise.all([
    getFailedJobs(),
    getActiveQueue(),
  ]);

  return (
    <div className="space-y-4">
      <FailedJobsTable jobs={failedJobs} />
      <ActiveQueueTable entries={activeQueue} />
    </div>
  );
}

// ======================================================
// ACTIVITY
// ======================================================

async function ActivitySection() {
  const activity = await getRecentActivity();

  return <ActivityFeed events={activity} />;
}

// ======================================================
// PAGE
// ======================================================

export default async function AdminPage() {
  return (
    <div className="w-full max-w-7xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
              Overview
            </h1>

            <span className="rounded bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
              admin
            </span>
          </div>
        </div>
      </div>

      {/* WORKER STATUS */}
      <Suspense fallback={null}>
        <WorkerBar />
      </Suspense>

      {/* METRICS */}
      <div>
        <Suspense fallback={<SkeletonMetrics />}>
          <MetricsSection />
        </Suspense>
      </div>

      {/* CHARTS */}
      <div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SkeletonChart />
              </div>

              <SkeletonChart />
            </div>
          }
        >
          <ChartsSection />
        </Suspense>
      </div>

      {/* TABLES + ACTIVITY */}
      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              <SkeletonTable />
              <SkeletonTable />
            </div>
          }
        >
          <TablesSection />
        </Suspense>

        <aside>
          <Suspense fallback={null}>
            <ActivitySection />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
