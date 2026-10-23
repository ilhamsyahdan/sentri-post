import {
  getTargetStatusesByPostId,
  updatePostStatus,
} from "../repositories/publish-worker.repository";

export async function syncPostStatus(postId: string) {
  const targets = await getTargetStatusesByPostId(postId);
  if (!targets.length) return;

  const statuses = targets.map((t) => t.status);
  const isProcessing = statuses.some(
    (s) => s === "queued" || s === "publishing",
  );
  const hasFailed = statuses.some(
    (s) => s === "failed_permanent" || s === "failed",
  );

  let nextStatus: "queued" | "completed" | "failed" = "queued";

  if (isProcessing) {
    nextStatus = "queued";
  } else if (hasFailed) {
    nextStatus = "failed";
  } else {
    nextStatus = "completed";
  }

  await updatePostStatus(postId, nextStatus);
}
