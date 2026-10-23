// features/admin/failed-jobs/components/FailedJobsTable.tsx
"use client";

import { useState, useTransition } from "react";
import {
  RefreshCw,
  Zap,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { RetryDialog } from "./retry-dialog";
import { ErrorLogCell } from "./error-log-cell";
import { bulkRetryFailedJobs } from "../actions/retry";
import type { FailedJob } from "../types";

// Platform color map
const PLATFORM_COLORS: Record<string, string> = {
  instagram: "border-pink-700 text-pink-400",
  linkedin: "border-blue-700 text-blue-400",
  tiktok: "border-slate-600 text-slate-300",
  twitter: "border-sky-700 text-sky-400",
  facebook: "border-indigo-700 text-indigo-400",
  youtube: "border-red-700 text-red-400",
};

interface Props {
  jobs: FailedJob[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

export function FailedJobsTable({
  jobs,
  total,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [retryJob, setRetryJob] = useState<FailedJob | null>(null);
  const [isBulkPending, startBulkTransition] = useTransition();

  const totalPages = Math.ceil(total / pageSize);

  // Checkbox logic
  function toggleAll() {
    if (selectedIds.size === jobs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(jobs.map((j) => j.id)));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Bulk retry
  function handleBulkRetry() {
    const retryable = jobs
      .filter(
        (j) =>
          selectedIds.has(j.id) &&
          j.status === "failed" &&
          j.retry_count < j.max_retries
      )
      .map((j) => j.id);

    if (!retryable.length) {
      toast.warning("No retryable jobs selected", {
        description:
          "Only jobs with status=failed and remaining retries can be bulk retried.",
      });
      return;
    }

    startBulkTransition(async () => {
      const result = await bulkRetryFailedJobs(retryable);
      if (result.succeeded > 0) {
        toast.success(`${result.succeeded} job(s) re-queued`, {
          description:
            result.skipped > 0
              ? `${result.skipped} skipped (exhausted or permanent)`
              : undefined,
        });
      } else {
        toast.error("Bulk retry failed", {
          description: result.errors[0] ?? "Unknown error",
        });
      }
      setSelectedIds(new Set());
    });
  }

  if (!jobs.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-16 text-center">
        <div className="mb-3 rounded-full bg-emerald-500/10 p-4">
          <CheckSquare className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-sm font-medium text-slate-300">No failed jobs</p>
        <p className="mt-1 text-xs text-slate-600">
          Queue is healthy with the current filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2">
          <span className="text-sm text-slate-300">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkRetry}
            disabled={isBulkPending}
            className="h-7 border-emerald-700 text-emerald-400 hover:bg-emerald-900/30"
          >
            {isBulkPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3 w-3" />
            )}
            Retry Selected
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            className="h-7 text-slate-500 hover:text-slate-300"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={selectedIds.size === jobs.length && jobs.length > 0}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className="border-slate-600"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">
                User / Platform
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">
                Post
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">
                Error
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">
                Retries
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">
                Last attempt
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {jobs.map((job) => {
              const isRetryable =
                job.status === "failed" && job.retry_count < job.max_retries;
              const isPermanent = job.status === "failed_permanent";

              return (
                <tr
                  key={job.id}
                  className="group transition-colors hover:bg-slate-800/40"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(job.id)}
                      onCheckedChange={() => toggleOne(job.id)}
                      className="border-slate-600"
                    />
                  </td>

                  {/* User / Platform */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs text-slate-300">
                        {job.post_user_id.slice(0, 12)}…
                      </span>
                      <Badge
                        variant="outline"
                        className={`w-fit text-[10px] ${
                          PLATFORM_COLORS[job.platform] ??
                          "border-slate-600 text-slate-400"
                        }`}
                      >
                        {job.platform}
                      </Badge>
                      {job.platform_user_name && (
                        <span className="text-[10px] text-slate-600">
                          @{job.platform_user_name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Post content */}
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="line-clamp-2 text-xs text-slate-400">
                      {job.post_content}
                    </p>
                    <span className="mt-1 block font-mono text-[10px] text-slate-700">
                      {job.post_id.slice(0, 8)}…
                    </span>
                  </td>

                  {/* Error log */}
                  <td className="max-w-[260px] px-4 py-3">
                    <ErrorLogCell log={job.error_log} />
                  </td>

                  {/* Retries */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800"
                        title={`${job.retry_count}/${job.max_retries}`}
                      >
                        <div
                          className={`h-full rounded-full transition-all ${
                            job.retry_count >= job.max_retries
                              ? "bg-red-500"
                              : "bg-amber-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (job.retry_count / job.max_retries) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="tabular-nums text-xs text-slate-400">
                        {job.retry_count}/{job.max_retries}
                      </span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    {isPermanent ? (
                      <Badge className="bg-red-950 text-red-400 border border-red-800 text-[10px]">
                        permanent
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px]">
                        failed
                      </Badge>
                    )}
                  </td>

                  {/* Last attempt */}
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {job.last_attempt_at ? (
                      <span
                        title={format(new Date(job.last_attempt_at), "PPpp")}
                      >
                        {formatDistanceToNow(new Date(job.last_attempt_at), {
                          addSuffix: true,
                        })}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRetryJob(job)}
                      className={`h-7 gap-1 text-xs ${
                        isPermanent || !isRetryable
                          ? "text-amber-500 hover:bg-amber-900/30"
                          : "text-emerald-500 hover:bg-emerald-900/30"
                      }`}
                    >
                      {isPermanent || !isRetryable ? (
                        <Zap className="h-3 w-3" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      {isPermanent ? "Force" : !isRetryable ? "Force" : "Retry"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-600">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
          of {total} jobs
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-7 text-slate-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs tabular-nums text-slate-400">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-7 text-slate-400 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Retry dialog */}
      {retryJob && (
        <RetryDialog
          job={retryJob}
          open={!!retryJob}
          onOpenChange={(v) => !v && setRetryJob(null)}
        />
      )}
    </div>
  );
}
