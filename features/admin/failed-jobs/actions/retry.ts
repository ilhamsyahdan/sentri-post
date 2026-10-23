// features/admin/failed-jobs/actions/retry.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getFailedJobById } from "../lib/queries";
import type { RetryResult, BulkRetryResult } from "../types";

// ---------------------------------------------------------------------------
// RETRY STRATEGY
// ---------------------------------------------------------------------------
// 1. Guard: skip if already failed_permanent or retry_count >= max_retries
// 2. Reset status → "queued" so the worker picks it up again
// 3. Increment retry_count so the worker's next failure eventually hits
//    max_retries and promotes to failed_permanent automatically
// 4. Clear error_log so the next attempt writes a fresh log
// 5. The WORKER (not this action) owns the actual publish call — this action
//    only re-enqueues the job, keeping concerns separated
//
// INFINITE RETRY PREVENTION
// - max_retries is enforced here (pre-flight guard) AND in the worker
// - failed_permanent is a terminal state — cannot be retried from UI
// - Admin "force retry" bypasses the guard BUT explicitly resets retry_count
//   to 0, giving a clean slate (intentional, logged)
// ---------------------------------------------------------------------------

const ADMIN_RETRY_PATH = "/admin/failed-jobs";

// ---------------------------------------------------------------------------
// Single retry
// ---------------------------------------------------------------------------
export async function retryFailedJob(
  id: string,
  forceReset: boolean = false
): Promise<RetryResult> {
  const supabase = await createClient();

  // 1. Fetch current state
  let job: any;
  try {
    job = await getFailedJobById(id);
  } catch (e: any) {
    return { success: false, message: `Job not found: ${e.message}` };
  }

  // 2. Terminal state guard
  if (job.status === "failed_permanent" && !forceReset) {
    return {
      success: false,
      message:
        "Job is permanently failed. Use Force Reset if you've resolved the underlying issue.",
    };
  }

  // 3. Retries exhausted guard
  if (!forceReset && job.retry_count >= job.max_retries) {
    return {
      success: false,
      message: `Retry limit reached (${job.retry_count}/${job.max_retries}). Use Force Reset to override.`,
    };
  }

  // 4. Build update payload
  const updatePayload: Record<string, any> = {
    status: "queued",
    error_log: null,
    last_attempt_at: null,
    updated_at: new Date().toISOString(),
  };

  if (forceReset) {
    // Intentionally reset counter — admin has acknowledged the root cause
    updatePayload.retry_count = 0;
    // Also reset to normal max_retries in case it was exhausted
    updatePayload.max_retries = job.max_retries;
  }

  // 5. Persist
  const { error } = await supabase
    .from("post_targets")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("[retryFailedJob] DB error:", error);
    return { success: false, message: `Database error: ${error.message}` };
  }

  // 6. Observability — write to an audit log table if it exists
  // (fire-and-forget, non-blocking)
  supabase
    .from("admin_audit_log")
    .insert({
      action: forceReset ? "force_retry_job" : "retry_job",
      entity_type: "post_target",
      entity_id: id,
      meta: {
        previous_status: job.status,
        previous_retry_count: job.retry_count,
        force_reset: forceReset,
      },
    })
    .then(() => {});

  revalidatePath(ADMIN_RETRY_PATH);

  return {
    success: true,
    message: forceReset
      ? "Job force-reset and re-queued. Retry counter cleared."
      : "Job re-queued. Worker will attempt publishing shortly.",
    new_status: "queued",
    retry_count: forceReset ? 0 : job.retry_count,
  };
}

// ---------------------------------------------------------------------------
// Bulk retry — retryable jobs only (status=failed, count < max)
// ---------------------------------------------------------------------------
export async function bulkRetryFailedJobs(
  ids: string[]
): Promise<BulkRetryResult> {
  if (!ids.length) {
    return { succeeded: 0, skipped: 0, errors: [] };
  }

  // Deduplicate
  const uniqueIds = [...new Set(ids)];

  const results = await Promise.allSettled(
    uniqueIds.map((id) => retryFailedJob(id, false))
  );

  let succeeded = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      if (result.value.success) succeeded++;
      else {
        skipped++;
        errors.push(result.value.message);
      }
    } else {
      skipped++;
      errors.push(result.reason?.message ?? "Unknown error");
    }
  }

  revalidatePath(ADMIN_RETRY_PATH);

  return { succeeded, skipped, errors };
}

// ---------------------------------------------------------------------------
// Mark as permanently failed (admin investigates → decides no recovery)
// ---------------------------------------------------------------------------
export async function markAsPermanentlyFailed(
  id: string,
  reason: string
): Promise<RetryResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("post_targets")
    .update({
      status: "failed_permanent",
      error_log: `[Admin decision] ${reason}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(ADMIN_RETRY_PATH);
  return { success: true, message: "Marked as permanently failed." };
}
