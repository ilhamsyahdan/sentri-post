import { Post } from "@/features/post/types";
import { FetchedPost } from "@/features/post/types/post.types";

type DraftChannel = {
  connectionId?: string;
  mediaUrls?: string[];
  name?: string;
  avatar?: string | null;
  platform?: string;
};

export function mapToPost(p: FetchedPost): Post {
  const draftChannel =
    p.status === "draft"
      ? (p.draft_channels as DraftChannel[])?.[0]
      : undefined;

  return {
    id: p.id,
    userId: p.user_id,
    content: p.content,
    platform: (draftChannel?.platform ??
      p.connections?.platform ??
      "instagram") as Post["platform"],

    status: mapStatus(p.status, p.posted_at),

    scheduledAt: p.scheduled_at ?? undefined,
    publishedAt: p.posted_at ?? undefined,
    mediaUrl: draftChannel?.mediaUrls?.[0] ?? p.media_urls?.[0] ?? undefined,
    errorLog: p.error_log ?? undefined,
    isOptimalTime: false,
    stats:
      p.status === "published" || p.posted_at
        ? {
            likes: p.likes_count ?? 0,
            comments: p.comments_count ?? 0,
            reposts: p.shares_count ?? 0,
            impressions: p.views_count ?? 0,
          }
        : undefined,
    engagementPrediction:
      p.status !== "published" && !p.posted_at
        ? mapEngagement(p.engagement_rate)
        : undefined,
    channelId: draftChannel?.connectionId ?? p.connections?.id ?? undefined,
    channelName:
      draftChannel?.name ??
      p.connections?.platform_user_name ??
      "Disconnected Channel",
    channelAvatar:
      draftChannel?.avatar ??
      p.connections?.avatar_url ??
      "/default-avatar.png",
  };
}

function mapStatus(
  status: FetchedPost["status"],
  postedAt?: string | null
): Post["status"] {
  if (postedAt) return "published";

  const map: Record<string, Post["status"]> = {
    published: "published",
    queued: "queued",
    failed: "failed",
    draft: "draft",
  };
  return map[status] ?? "draft";
}

function mapEngagement(rate: number): Post["engagementPrediction"] {
  if (rate >= 8) return "high";
  if (rate >= 4) return "medium";
  return "low";
}
