import {
  getPostById,
  updatePostRecord,
} from "@/features/post/repositories/post.repository";

import {
  getQueuedTargets,
  deleteQueuedTargets,
  createPostTarget,
  updateQueuedTargets,
} from "@/features/scheduling/repositories/post-target.repository";

import {
  cancelScheduledPosts,
  triggerScheduledPosts,
} from "@/features/scheduling/integrations/inngest/publish-events";
import { Channel } from "@/features/post/types";

export interface UpdatePostPayload {
  postId: string;
  userId: string;
  content: string;
  scheduledAt: string;
  mediaUrl?: string | null;
  asDraft?: boolean;
}

export interface UpdatePostResult {
  success: boolean;
  error?: string;
}

export async function checkPostEditableService(postId: string, userId: string) {
  const { data: post, error } = await getPostById(postId, userId);

  if (error || !post) return { canEdit: false, reason: "Post tidak ditemukan" };
  if (post.status === "completed")
    return { canEdit: false, reason: "Post sudah selesai di publish" };

  return { canEdit: true };
}

export async function updatePostService(
  payload: UpdatePostPayload
): Promise<UpdatePostResult> {
  const { postId, userId, content, scheduledAt, mediaUrl, asDraft } = payload;

  // ─────────────────────────────────────────
  // FETCH EXISTING POST
  // ─────────────────────────────────────────

  const { data: existing, error: fetchError } = await getPostById(
    postId,
    userId
  );

  if (fetchError || !existing) {
    return {
      success: false,
      error: "Post tidak ditemukan.",
    };
  }

  // ─────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────

  if (existing.status === "completed") {
    return {
      success: false,
      error: "Post sudah selesai dipublish.",
    };
  }

  const wasDraft = existing.status === "draft";
  const newStatus = asDraft ? "draft" : "queued";

  // ─────────────────────────────────────────
  // UPDATE POST
  // ─────────────────────────────────────────

  let updatedDraftChannels = existing.draft_channels;

  if (newStatus === "draft" && updatedDraftChannels) {
    updatedDraftChannels = updatedDraftChannels.map((channel: Channel) => ({
      ...channel,
      text: content,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
    }));
  }
  const { error: updateError } = await updatePostRecord({
    postId,
    userId,
    content,
    mediaUrl,
    status: newStatus,
    draftChannels: updatedDraftChannels,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  // ─────────────────────────────────────────
  // SAVE AS DRAFT
  // ─────────────────────────────────────────

  if (asDraft) {
    if (!wasDraft) {
      const { data: targets } = await getQueuedTargets(postId);

      const targetIds = targets?.map((t) => t.id) ?? [];

      if (targetIds.length) {
        await cancelScheduledPosts(targetIds);
        await deleteQueuedTargets(postId);
      }
    }

    return { success: true };
  }
  // ─────────────────────────────────────────
  // DRAFT → QUEUED
  // ─────────────────────────────────────────

  if (wasDraft) {
    const channels = existing.draft_channels as Array<{
      connectionId: string;
    }> | null;

    const connectionId = channels?.[0]?.connectionId;

    if (!connectionId) {
      return {
        success: false,
        error: "Connection tidak ditemukan di draft.",
      };
    }

    const { data: newTarget, error: insertError } = await createPostTarget({
      postId,
      connectionId,
      scheduledAt,
    });

    if (insertError || !newTarget) {
      return {
        success: false,
        error: "Gagal membuat jadwal post.",
      };
    }

    await triggerScheduledPosts([newTarget.id]);

    return { success: true };
  }
  // ─────────────────────────────────────────
  // QUEUED → RESCHEDULE
  // ─────────────────────────────────────────

  const { data: existingTargets } = await getQueuedTargets(postId);

  const targetIds = existingTargets?.map((t) => t.id) ?? [];

  if (targetIds.length) {
    await cancelScheduledPosts(targetIds);

    const { error: targetError } = await updateQueuedTargets(
      postId,
      scheduledAt
    );

    if (targetError) {
      return {
        success: false,
        error: targetError.message,
      };
    }

    await triggerScheduledPosts(targetIds);
  }

  return { success: true };
}
