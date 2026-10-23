"use server";

// ─────────────────────────────────────────────────────────────────────────────
// Queue Server Actions
// Thin adapter layer: validate input → call service → return result.
// No business logic here.
// ─────────────────────────────────────────────────────────────────────────────

import { revalidatePath } from "next/cache";
import {
  getQueuePage,
  getQueueStats,
  retryQueueItem,
} from "../services/queue-service";
import { ActionResult, QueueFilters, QueuePage } from "../types/queue-types";
import type { QueueStats } from "../services/queue-service";
import { inngest } from "@/inngest/client";

export async function fetchQueuePageAction(
  filters: QueueFilters
): Promise<ActionResult<QueuePage>> {
  try {
    const data = await getQueuePage(filters);
    return { ok: true, data };
  } catch (err) {
    console.error("[fetchQueuePageAction]", err);
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Unknown error loading queue.",
    };
  }
}

export async function fetchQueueStatsAction(): Promise<
  ActionResult<QueueStats>
> {
  try {
    const data = await getQueueStats();
    return { ok: true, data };
  } catch (err) {
    console.error("[fetchQueueStatsAction]", err);
    return { ok: false, error: "Failed to load queue stats." };
  }
}

export async function retryQueueItemAction(
  postTargetId: string
): Promise<ActionResult<{ retried: boolean; reason?: string }>> {
  if (!postTargetId || typeof postTargetId !== "string") {
    return { ok: false, error: "Invalid post target ID." };
  }

  try {
    const result = await retryQueueItem(postTargetId);

    if (result.retried) {
      await inngest.send({
        name: "post/publish.scheduled",
        data: { targetId: postTargetId },
      });

      revalidatePath("/admin/queue");
    }

    return { ok: true, data: result };
  } catch (err) {
    console.error("[retryQueueItemAction]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to retry item.",
    };
  }
}
