// app/api/connections/[platform]/callback/route.ts

import { NextResponse } from "next/server";
import { getPlatformClient, SUPPORTED_PLATFORMS } from "@/lib/platforms";
import type { SupportedPlatform } from "@/lib/platforms";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { seedDefaultSlots } from "@/lib/db/seed-default-slots";

// ─── Helper ───────────────────────────────────────────────────────────────────

import { uploadMedia } from "@/lib/cloudinary"; // ← import ini

async function storeAvatar(
  avatarUrl: string,
  platform: string,
  platformUserId: string
): Promise<string> {
  const res = await fetch(avatarUrl, {
    headers: { Referer: `https://www.${platform}.com/` },
  });

  if (!res.ok) throw new Error(`Fetch avatar failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;

  const result = await uploadMedia(dataUri, {
    // ← kirim dataUri, bukan buffer
    folder: "social-scheduler/avatars",
    resourceType: "image",
    publicId: `${platform}_${platformUserId}`,
    overwrite: true,
  });

  return result.url;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { searchParams } = new URL(req.url);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error)
    return NextResponse.redirect(`${baseUrl}/dashboard?error=auth_denied`);
  if (!code) return NextResponse.redirect(`${baseUrl}/dashboard?error=no_code`);

  const userId = state?.split("__")[0];
  if (!userId?.startsWith("user_")) {
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_state`);
  }

  if (!SUPPORTED_PLATFORMS.includes(platform as SupportedPlatform)) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=unsupported_platform`
    );
  }

  try {
    // 1. Ambil data profil dari client platform OAuth
    const client = getPlatformClient(platform);
    const connection = await client.handleCallback(code);

    if (connection.avatar_url && connection.platform_user_id) {
      connection.avatar_url = await storeAvatar(
        connection.avatar_url,
        platform,
        connection.platform_user_id
      );
    }

    // 2. Cek apakah koneksi dengan platform & platform_user_id ini SUDAH ADA di database (baik active maupun inactive)
    const { data: existingConnection } = await supabaseAdmin
      .from("connections")
      .select("id, user_id, is_active")
      .eq("platform", platform)
      .eq("platform_user_id", connection.platform_user_id)
      .maybeSingle();

    // Jika sudah pernah terhubung tapi oleh user_id Clerk yang berbeda
    if (existingConnection && existingConnection.user_id !== userId) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard?error=account_already_connected`
      );
    }

    let connectionId: string;

    if (existingConnection) {
      // 3A. RE-CONNECT: Jika baris SUDAH ADA, lakukan UPDATE secara eksplisit ke ID baris tersebut
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("connections")
        .update({
          user_id: userId,
          ...connection,
          is_active: true, // Hidupkan kembali channel
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConnection.id)
        .select("id")
        .single();

      if (updateError) throw updateError;
      connectionId = updated.id;
    } else {
      // 3B. FIRST CONNECT: Jika BENAR-BENAR BARU, lakukan INSERT
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("connections")
        .insert({
          user_id: userId,
          platform,
          ...connection,
          is_active: true,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      connectionId = inserted.id;

      // Seed slot default HANYA jika ini koneksi yang baru pertama kali dibuat
      await seedDefaultSlots(connectionId, platform);
    }

    return NextResponse.redirect(
      `${baseUrl}/dashboard?success=${platform}_connected`
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : JSON.stringify(err) ?? "unknown_error";
    console.error(`[${platform}] Callback Error:`, message);
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=${encodeURIComponent(message)}`
    );
  }
}
