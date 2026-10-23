// features/scheduling/services/schedule-post.service.ts
import { fromZonedTime } from "date-fns-tz";
import {
  createPost,
  deletePostById,
} from "@/features/post/repositories/post.repository";
import { createPostTarget } from "@/features/scheduling/repositories/post-target.repository";
import { getConnectionById } from "@/features/post/repositories/connection.repository";
import { triggerScheduledPost } from "../integrations/inngest/publish-events";

const WIB = "Asia/Jakarta";

export type SchedulePostInput = {
  userId: string;
  connectionId: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  scheduledAtLocal: string;
};

export type SchedulePostResult =
  | {
      success: true;
      postId: string;
      targetId: string;
      scheduledAt: string;
    }
  | {
      success: false;
      error: string;
    };

function sanitizeMediaUrls(media: unknown): string[] {
  if (!media) return [];

  if (Array.isArray(media)) {
    return media.filter((url) => typeof url === "string");
  }

  if (typeof media === "string") {
    try {
      const parsed = JSON.parse(media);

      if (Array.isArray(parsed)) {
        return parsed.filter((url) => typeof url === "string");
      }
    } catch {
      return [];
    }
  }

  return [];
}

export async function schedulePostService(
  input: SchedulePostInput,
): Promise<SchedulePostResult> {
  try {
    // ─────────────────────────────────────────
    // VALIDATE DATE
    // ─────────────────────────────────────────

    const utcDate = fromZonedTime(input.scheduledAtLocal, WIB);

    if (utcDate <= new Date()) {
      return {
        success: false,
        error: "Waktu yang dipilih sudah lewat.",
      };
    }

    // ─────────────────────────────────────────
    // SANITIZE MEDIA
    // ─────────────────────────────────────────

    const safeMediaUrls = sanitizeMediaUrls(input.mediaUrls);

    // ─────────────────────────────────────────
    // CREATE POST
    // ─────────────────────────────────────────

    const { data: connection } = await getConnectionById(input.connectionId);
    if (!connection) {
      return {
        success: false,
        error: "connection tidak di temukan",
      };
    }

    if (connection.platform !== input.platform) {
      return {
        success: false,
        error: "platform tidak sesuai",
      };
    }

    const { data: post, error: postError } = await createPost({
      userId: input.userId,
      content: input.content,
      mediaUrls: safeMediaUrls,
    });

    if (postError || !post) {
      console.error("[schedulePost] postError:", postError);

      return {
        success: false,
        error: "Gagal menyimpan post.",
      };
    }

    // ─────────────────────────────────────────
    // CREATE TARGET
    // ─────────────────────────────────────────

    const { data: target, error: targetError } = await createPostTarget({
      postId: post.id,
      connectionId: input.connectionId,
      scheduledAt: utcDate.toISOString(),
    });

    if (targetError || !target) {
      console.error("[schedulePost] targetError:", targetError);

      await deletePostById(post.id, input.userId);

      return {
        success: false,
        error: "Gagal menyimpan jadwal.",
      };
    }

    // ─────────────────────────────────────────
    // TRIGGER INNGEST
    // ─────────────────────────────────────────

    await triggerScheduledPost({
      postId: post.id,
      targetId: target.id,
      userId: input.userId,
      scheduledAt: utcDate.toISOString(),
    });

    return {
      success: true,
      postId: post.id,
      targetId: target.id,
      scheduledAt: utcDate.toISOString(),
    };
  } catch (err) {
    console.error("[schedulePostService]", err);

    return {
      success: false,
      error: "Terjadi kesalahan internal.",
    };
  }
}
