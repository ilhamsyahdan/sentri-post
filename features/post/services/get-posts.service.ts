import "server-only";

import { normalizeStatus } from "@/features/post/utils/normalize-status";
import { getPostsByUserId } from "../repositories/post.repository";
import type { ConnectionRow, FetchedPost, PostRow } from "../types/post.types";

function isConnectionActive(
  conn: ConnectionRow | ConnectionRow[] | null | undefined,
): boolean {
  if (!conn) return false;

  if (Array.isArray(conn)) {
    const item = conn[0] as
      | (ConnectionRow & { is_active?: boolean })
      | undefined;
    return Boolean(item?.is_active);
  }

  const single = conn as ConnectionRow & { is_active?: boolean };
  return Boolean(single.is_active);
}
export async function getPostsService(userId: string): Promise<FetchedPost[]> {
  const { data, error } = await getPostsByUserId(userId);

  if (error) {
    console.error("[getPostsService]", error);
    return [];
  }

  const rows = (data ?? []) as unknown as PostRow[];

  return rows.map((post) => {
    // Pilih target yang connection-nya masih aktif.
    // Ini penting karena satu post bisa punya banyak target.
    const target = post.post_targets?.find((target) =>
      isConnectionActive(target.connections),
    );

    const connection = Array.isArray(target?.connections)
      ? (target.connections[0] ?? null)
      : (target?.connections ?? null);

    const isPublished =
      target?.status === "published" || post.status === "completed";

    const actualPostedAt =
      target?.posted_at ??
      post.posted_at ??
      (isPublished ? post.created_at : null);

    return {
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      media_urls: post.media_urls ?? [],
      draft_channels: Array.isArray(post.draft_channels)
        ? post.draft_channels
        : [],
      created_at: post.created_at,
      status: normalizeStatus(post.status, target?.status),
      scheduled_at: target?.scheduled_at ?? post.scheduled_at ?? null,
      posted_at: actualPostedAt,
      platform_post_id: target?.platform_post_id ?? null,
      error_log: target?.error_log ?? null,
      likes_count: target?.likes_count ?? 0,
      comments_count: target?.comments_count ?? 0,
      shares_count: target?.shares_count ?? 0,
      views_count: target?.views_count ?? 0,
      engagement_rate: target?.engagement_rate ?? 0,
      connections: connection,
      channel_name: connection?.platform_user_name ?? null,
      channel_avatar: connection?.avatar_url ?? null,
    };
  });
}
