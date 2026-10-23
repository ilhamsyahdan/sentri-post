"use server";

import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { auth } from "@clerk/nextjs/server";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  platform: string;
  status: "queued" | "publishing" | "published" | "failed";
  connectionId: string;
  postId: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

const PLATFORM_COLORS: Record<string, { bg: string; border: string }> = {
  linkedin: { bg: "#0A66C2", border: "#084d91" },
  instagram: { bg: "#E1306C", border: "#b8245a" },
  twitter: { bg: "#000000", border: "#333333" },
  tiktok: { bg: "#010101", border: "#333333" },
  youtube: { bg: "#FF0000", border: "#cc0000" },
};

function getEventColors(
  platform: string,
  status: string
): Pick<CalendarEvent, "backgroundColor" | "borderColor" | "textColor"> {
  const colors = PLATFORM_COLORS[platform] ?? PLATFORM_COLORS.linkedin;

  switch (status) {
    case "queued":
      return {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: "#ffffff",
      };
    case "publishing":
      return {
        backgroundColor: colors.bg,
        borderColor: "#f59e0b",
        textColor: "#ffffff",
      };
    case "published":
      return {
        backgroundColor: colors.bg + "22",
        borderColor: colors.bg + "88",
        textColor: colors.bg,
      };
    case "failed":
      return {
        backgroundColor: "#fef2f2",
        borderColor: "#ef4444",
        textColor: "#dc2626",
      };
    default:
      return {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: "#ffffff",
      };
  }
}

export async function getCalendarPosts(): Promise<CalendarEvent[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select(
      `
      id,
      scheduled_at,
      updated_at,
      status,
      connection_id,
      post_id,
      posts!inner (content, user_id),
      connections (platform)
    `
    )
    .eq("posts.user_id", userId)
    .in("status", ["queued", "publishing", "published", "failed"])
    .not("scheduled_at", "is", null)
    .order("scheduled_at", { ascending: true })
    .limit(200);

  if (error) {
    logger.error(`Gagal mengambil calendar posts`, error, {
      userId,
    });
    return [];
  }

  return (data ?? []).map((target) => {
    const platform = (target.connections as any)?.platform ?? "linkedin";
    const content = (target.posts as any)?.content ?? "";
    const status = target.status as CalendarEvent["status"];

    // Jika status published, gunakan updated_at (waktu status diubah ke published)
    const eventTime =
      status === "published" && target.updated_at
        ? target.updated_at
        : target.scheduled_at;

    return {
      id: target.id,
      title: content.slice(0, 50) + (content.length > 50 ? "…" : ""),
      start: new Date(eventTime!).toISOString(),
      platform,
      status,
      connectionId: target.connection_id,
      postId: target.post_id,
      ...getEventColors(platform, status),
    };
  });
}
