// features/analytics/actions.ts
"use server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { auth } from "@clerk/nextjs/server";
import { AnalyticsPost } from "../types/analytics";

export async function getAnalyticsPosts(): Promise<AnalyticsPost[]> {
  const { userId } = await auth();
  if (!userId) return [];

  // Join posts dulu untuk filter by user_id di DB level
  // Jauh lebih efisien daripada filter di JS setelah fetch semua data
  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select(
      `
      id,
      post_id,
      scheduled_at,
      status,
      likes_count,
      comments_count,
      saved_count,
      views_count,
      engagement_rate,
      analytics_updated_at,
      shares_count,
      connections (
        platform,
        platform_user_name
      ),
      posts!inner (
        content,
        user_id
      )
    `
    )
    .eq("status", "published")
    .eq("posts.user_id", userId) // ← filter di DB, bukan di JS
    .order("scheduled_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[getAnalyticsPosts]", error);
    return [];
  }

  if (!data) return [];

  return data.map((t) => {
    const conn = Array.isArray(t.connections)
      ? t.connections[0]
      : t.connections;

    const post = Array.isArray(t.posts) ? t.posts[0] : t.posts;

    return {
      targetId: t.id,
      postId: t.post_id,
      platform: (conn?.platform ?? "instagram") as "instagram" | "linkedin",
      connectionName: conn?.platform_user_name ?? "Unknown",
      content: post?.content ?? "",
      scheduledAt: t.scheduled_at,
      likes: t.likes_count ?? 0,
      comments: t.comments_count ?? 0,
      views: t.views_count ?? 0,
      saved: t.saved_count ?? 0,
      shares: t.shares_count ?? 0,
      engagementRate: t.engagement_rate ?? 0,
      analyticsUpdatedAt: t.analytics_updated_at ?? null,
    };
  });
}
