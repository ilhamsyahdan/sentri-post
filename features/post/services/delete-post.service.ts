import "server-only";

import { deleteMedia } from "@/lib/cloudinary";
import {
  deletePostRecord,
  getPostWithTargets,
} from "../repositories/post.repository";
import { deleteLinkedInPost } from "@/features/publish/integrations/linkedin-delete.integration";
import { cancelScheduledPosts } from "@/features/scheduling/integrations/inngest/publish-events";

export type DeletePostResult =
  | { success: true }
  | { success: false; error: string };

export async function deletePostService(
  postId: string,
  userId: string,
): Promise<DeletePostResult> {
  try {
    // =========================================================
    // FETCH POST
    // =========================================================

    const post = await getPostWithTargets(postId, userId);

    if (!post) {
      return {
        success: false,
        error: "Post tidak ditemukan.",
      };
    }

    if (post.user_id !== userId) {
      return {
        success: false,
        error: "Unauthorized.",
      };
    }

    const targets = post.post_targets ?? [];

    // =========================================================
    // DELETE PLATFORM POSTS
    // =========================================================

    await Promise.allSettled(
      targets
        .filter((t) => t.status === "published" && t.platform_post_id)
        .map(async (target) => {
          const connection = Array.isArray(target.connections)
            ? target.connections[0]
            : target.connections;

          if (!connection) return;

          if (connection.platform === "linkedin") {
            await deleteLinkedInPost({
              platformPostId: target.platform_post_id!,
              accessToken: connection.access_token,
            });
          }
        }),
    );

    // =========================================================
    // DELETE MEDIA
    // =========================================================

    const mediaUrls: string[] = [
      ...(Array.isArray(post.media_urls) ? post.media_urls : []),

      ...((post.draft_channels as any[]) ?? []).flatMap(
        (ch) => ch.mediaUrls ?? [],
      ),
    ];

    const publicIds = mediaUrls
      .map(extractPublicId)
      .filter(Boolean) as string[];

    await Promise.allSettled(
      publicIds.map((publicId) => deleteMedia(publicId)),
    );

    // =========================================================
    // DELETE DB
    // =========================================================

    const queuedTargetIds = targets
      .filter((t) => t.status === "queued")
      .map((t) => t.id);
    if (queuedTargetIds.length) {
      await cancelScheduledPosts(queuedTargetIds);
    }

    await deletePostRecord(postId, userId);

    return {
      success: true,
    };
  } catch (err) {
    console.error("[deletePostService]", err);

    return {
      success: false,
      error: "Gagal menghapus post.",
    };
  }
}

// =========================================================
// HELPERS
// =========================================================

function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/v\d+\/(.+?)(?:\.[^.]+)?$/);

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
