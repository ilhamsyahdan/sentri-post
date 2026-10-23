"use server";

/**
 * reschedulePost
 *
 * Dipanggil saat user drag-and-drop event di kalender.
 *
 * Alur:
 * 1. Update scheduled_at di post_targets
 * 2. Kirim event "post/publish.cancel" → Inngest batalkan job lama
 *    (publish-post.ts harus punya cancelOn config untuk ini)
 * 3. Kirim event "post/publish.scheduled" → Inngest buat job baru
 */

import { supabaseAdmin } from "@/utils/supabase/admin";
import { inngest } from "@/inngest/client";
import { auth } from "@clerk/nextjs/server";

export type RescheduleResult =
  | { success: true }
  | { success: false; error: string };

export async function reschedulePost(
  targetId: string,
  newScheduledAt: string // ISO UTC string dari FullCalendar
): Promise<RescheduleResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const newDate = new Date(newScheduledAt);
  if (newDate <= new Date()) {
    return { success: false, error: "Waktu yang dipilih sudah lewat." };
  }

  // 1. Verifikasi target milik user ini (security check)
  const { data: target, error: fetchError } = await supabaseAdmin
    .from("post_targets")
    .select("id, post_id, status, posts!inner(user_id)")
    .eq("id", targetId)
    .eq("posts.user_id", userId)
    .single();

  if (fetchError || !target) {
    return { success: false, error: "Post tidak ditemukan." };
  }

  // Hanya post dengan status queued yang bisa direschedule
  if (target.status !== "queued") {
    return {
      success: false,
      error: `Post dengan status "${target.status}" tidak bisa dijadwalkan ulang.`,
    };
  }

  // 2. Update scheduled_at di DB
  const { error: updateError } = await supabaseAdmin
    .from("post_targets")
    .update({
      scheduled_at: newDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId);

  if (updateError) {
    console.error("[reschedulePost] updateError:", updateError);
    return { success: false, error: "Gagal memperbarui jadwal." };
  }

  // 3. Cancel Inngest job lama + trigger job baru secara paralel
  await inngest.send([
    {
      // Signal ke publish-post.ts untuk cancel (harus ada cancelOn config)
      name: "post/publish.cancel",
      data: { targetId },
    },
    {
      // Job baru dengan waktu baru
      name: "post/publish.scheduled",
      data: {
        postId: target.post_id,
        targetId,
        userId,
        scheduledAt: newDate.toISOString(),
      },
    },
  ]);

  return { success: true };
}
