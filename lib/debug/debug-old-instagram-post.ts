import { supabaseAdmin } from "@/utils/supabase/admin";

export async function debugOldInstagramPost() {
  const oldPostId = "17909043981310356";

  const { data: connection, error: connectionError } = await supabaseAdmin
    .from("connections")
    .select("id, platform_user_id, platform_user_name, access_token, is_active")
    .eq("platform", "instagram")
    .eq("platform_user_id", "27259769830308705")
    .eq("is_active", true)
    .single();

  if (connectionError) {
    throw connectionError;
  }

  if (!connection?.access_token) {
    throw new Error("Connection aktif tidak memiliki access token.");
  }

  const basicRes = await fetch(
    `https://graph.instagram.com/v25.0/${oldPostId}` +
      `?fields=id,like_count,comments_count` +
      `&access_token=${connection.access_token}`,
    {
      cache: "no-store",
    },
  );

  const basicData = await basicRes.json();

  const insightsRes = await fetch(
    `https://graph.instagram.com/v25.0/${oldPostId}/insights` +
      `?metric=reach,saved` +
      `&access_token=${connection.access_token}`,
    {
      cache: "no-store",
    },
  );

  const insightsData = await insightsRes.json();

  return {
    connectionId: connection.id,
    platformUserId: connection.platform_user_id,
    username: connection.platform_user_name,
    oldPostId,
    basicStatus: basicRes.status,
    basicData,
    insightsStatus: insightsRes.status,
    insightsData,
  };
}
