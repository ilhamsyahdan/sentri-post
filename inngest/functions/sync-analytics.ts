// inngest/functions/sync-analytics.ts

import { supabaseAdmin } from "@/utils/supabase/admin";
import { inngest } from "../client";

// attempt 99 = manual trigger dari user (tidak chain lagi)
const NEXT_DELAYS: Record<number, string> = {
  1: "5m",
  2: "1h",
  3: "24h",
};

export const syncAnalytics = inngest.createFunction(
  {
    id: "sync-post-analytics",
    retries: 2,
    triggers: [{ event: "post/analytics.sync" }],
  },
  async ({ event, step }) => {
    const { targetId, attempt = 1 } = event.data as {
      targetId: string;
      attempt?: number;
    };

    // ── 1. Fetch target ───────────────────────────────────────────────────────
    const target = await step.run("fetch-target", async () => {
      const { data } = await supabaseAdmin
        .from("post_targets")
        .select(
          `
          id,
          platform_post_id,
          scheduled_at,
          connection_id,
          connections (platform, access_token)
        `
        )
        .eq("id", targetId)
        .single();

      return data;
    });

    if (!target?.platform_post_id) return { skipped: true };

    const connection = Array.isArray(target.connections)
      ? target.connections[0]
      : target.connections;

    if (!connection) return { skipped: true };

    // ── 2. Fetch + update analytics ───────────────────────────────────────────
    const analytics = await step.run("fetch-and-update-analytics", async () => {
      const result = await getPlatformAnalytics(
        connection.platform,
        target.platform_post_id!,
        connection.access_token
      );

      if (!result) return null;

      // Instagram: (likes + comments + saved) / reach * 100
      // LinkedIn:  tidak ada reach — simpan likes + comments sebagai proxy
      const totalEngagement =
        result.likes + result.comments + result.saved + result.shares;

      const engagementRate =
        result.views > 0
          ? Number(((totalEngagement / result.views) * 100).toFixed(2))
          : 0;

      await supabaseAdmin
        .from("post_targets")
        .update({
          likes_count: result.likes,
          comments_count: result.comments,
          views_count: result.views,
          saved_count: result.saved,
          shares_count: result.shares,
          engagement_rate: engagementRate,
          analytics_updated_at: new Date().toISOString(),
        })
        .eq("id", targetId);

      return result;
    });

    // ── 3. Chain ke attempt berikutnya ────────────────────────────────────────
    // attempt 99 = manual trigger — tidak perlu chain
    const nextDelay = attempt < 99 ? NEXT_DELAYS[attempt] : undefined;

    if (nextDelay) {
      await step.sleep(`wait-before-attempt-${attempt + 1}`, nextDelay);

      await step.sendEvent(`trigger-sync-attempt-${attempt + 1}`, {
        name: "post/analytics.sync",
        data: {
          targetId,
          attempt: attempt + 1,
        },
      });
    }

    return {
      attempt,
      platform: connection.platform,
      hasAnalytics: !!analytics,
      nextSync: nextDelay ?? "done",
    };
  }
);

// ─── Platform Fetchers ────────────────────────────────────────────────────────

async function getPlatformAnalytics(
  platform: string,
  postId: string,
  accessToken: string
) {
  try {
    if (platform === "instagram") {
      // ── 1. Basic metrics ─────────────────────
      const basicRes = await fetch(
        `https://graph.instagram.com/v25.0/${postId}` +
          `?fields=like_count,comments_count` +
          `&access_token=${accessToken}`
      );

      const basicData = await basicRes.json();

      if (basicData.error) {
        console.error("[Instagram basic metrics]", basicData.error);
        return null;
      }

      // ── 2. Insights metrics ──────────────────
      const insightsRes = await fetch(
        `https://graph.instagram.com/v25.0/${postId}/insights` +
          `?metric=reach,saved` +
          `&access_token=${accessToken}`
      );

      const insightsData = await insightsRes.json();

      let reach = 0;
      let saved = 0;

      if (!insightsData.error && Array.isArray(insightsData.data)) {
        reach =
          insightsData.data.find((m: { name: string }) => m.name === "reach")
            ?.values?.[0]?.value ?? 0;

        saved =
          insightsData.data.find((m: { name: string }) => m.name === "saved")
            ?.values?.[0]?.value ?? 0;
      }

      return {
        likes: basicData.like_count ?? 0,
        comments: basicData.comments_count ?? 0,
        shares: 0,
        views: reach,
        saved,
      };
    }

    if (platform === "linkedin") {
      return null;
    }

    return null;
  } catch (err) {
    console.error("[getPlatformAnalytics]", err);
    return null;
  }
}
