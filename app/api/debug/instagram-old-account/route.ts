import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function GET() {
  try {
    // Ambil connection yang AKTIF / hasil reconnect
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from("connections")
      .select(
        "id, platform_user_id, platform_user_name, access_token, is_active"
      )
      .eq("platform", "instagram")
      .eq("platform_user_id", "27259769830308705")
      .eq("is_active", true)
      .single();

    if (connectionError) throw connectionError;

    if (!connection?.access_token) {
      throw new Error("Connection aktif tidak memiliki access token.");
    }

    // ID akun Instagram SEBELUM reconnect
    const oldPlatformUserId = "27445634971699479";

    const res = await fetch(
      `https://graph.instagram.com/v25.0/${oldPlatformUserId}` +
        `?fields=id,username,account_type` +
        `&access_token=${connection.access_token}`,
      {
        cache: "no-store",
      }
    );

    const data = await res.json();

    return NextResponse.json({
      connectionId: connection.id,
      newPlatformUserId: connection.platform_user_id,
      username: connection.platform_user_name,

      testedOldPlatformUserId: oldPlatformUserId,

      status: res.status,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
