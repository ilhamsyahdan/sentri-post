// features/admin/failed-jobs/components/RetryDialog.tsx
"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Zap, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { retryFailedJob } from "../actions/retry";
import type { FailedJob } from "../types";

interface Props {
  job: FailedJob;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function RetryDialog({ job, open, onOpenChange }: Props) {
  const [forceReset, setForceReset] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isPermanent = job.status === "failed_permanent";
  const retriesExhausted = job.retry_count >= job.max_retries;
  const needsForce = isPermanent || retriesExhausted;

  function handleRetry() {
    startTransition(async () => {
      const result = await retryFailedJob(job.id, forceReset || needsForce);
      if (result.success) {
        toast.success(result.message, {
          description: `Job ${job.id.slice(0, 8)}… re-queued`,
        });
        onOpenChange(false);
      } else {
        toast.error("Retry failed", { description: result.message });
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-700 bg-slate-900 text-slate-100 sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {needsForce ? (
              <Zap className="h-4 w-4 text-amber-400" />
            ) : (
              <RefreshCw className="h-4 w-4 text-emerald-400" />
            )}
            {needsForce ? "Force Reset & Retry" : "Retry Job"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-slate-400">
            <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-left">
              <div className="mb-1 text-xs text-slate-500">Post preview</div>
              <p className="line-clamp-2 text-sm text-slate-300">
                {job.post_content}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="border-slate-600 text-xs">
                  {job.platform}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    job.status === "failed_permanent"
                      ? "border-red-700 text-red-400 text-xs"
                      : "border-amber-700 text-amber-400 text-xs"
                  }
                >
                  {job.status}
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-xs">
                  {job.retry_count}/{job.max_retries} retries
                </Badge>
              </div>
            </div>

            {needsForce && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-900/40 bg-amber-950/30 p-3 text-left">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div className="text-xs text-amber-300">
                  {isPermanent
                    ? "This job is permanently failed. Force reset will clear the terminal state and reset retry counter."
                    : "Retry limit reached. Force reset will clear the counter and re-enqueue."}
                  <strong className="mt-1 block">
                    Only proceed after resolving the root cause.
                  </strong>
                </div>
              </div>
            )}

            <p className="text-sm">
              {needsForce
                ? "The retry counter will be reset to 0 and the job re-queued. The worker will attempt publishing on the next cycle."
                : `The job will be re-queued. Current retry count: ${job.retry_count}/${job.max_retries}.`}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleRetry}
            disabled={isPending}
            className={
              needsForce
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-emerald-600 hover:bg-emerald-500"
            }
          >
            {isPending ? (
              <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : needsForce ? (
              <Zap className="mr-2 h-3.5 w-3.5" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            {isPending
              ? "Retrying…"
              : needsForce
              ? "Force Reset & Retry"
              : "Confirm Retry"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
