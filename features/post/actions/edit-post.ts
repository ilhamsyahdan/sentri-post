// features/post/actions/edit-post.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { fromZonedTime } from "date-fns-tz";

const WIB = "Asia/Jakarta";

export type EditPostInput = {
  postId: string;
  userId: string;
  content?: string;
  scheduledAtLocal?: string; // kalau mau reschedule
  mediaUrls?: string[];
};

export type EditPostResult =
  | { success: true }
  | { success: false; error: string };

export async function editQueuedPost(
  input: EditPostInput
): Promise<EditPostResult> {
  try {
    const supabase = await createClient();

    // Validasi post masih queued
    const { data: post } = await supabase
      .from("posts")
      .select("id, status")
      .eq("id", input.postId)
      .eq("user_id", input.userId)
      .single();

    if (!post) return { success: false, error: "Post tidak ditemukan." };
    if (post.status !== "queued") {
      return {
        success: false,
        error:
          "Hanya post queued yang bisa diedit. Post yang sudah published tidak bisa diubah.",
      };
    }

    // Build update payload — hanya field yang dikirim
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.content !== undefined) {
      updatePayload.content = input.content;
    }

    if (input.scheduledAtLocal !== undefined) {
      const utcDate = fromZonedTime(new Date(input.scheduledAtLocal), WIB);

      if (utcDate <= new Date()) {
        return { success: false, error: "Waktu yang dipilih sudah lewat." };
      }

      updatePayload.scheduled_at = utcDate.toISOString();
      // Inngest akan otomatis pakai scheduled_at terbaru
      // karena di publishPost kita fetch ulang dari DB
    }

    if (input.mediaUrls !== undefined) {
      updatePayload.media_urls = input.mediaUrls;
    }

    const { error } = await supabase
      .from("posts")
      .update(updatePayload)
      .eq("id", input.postId)
      .eq("user_id", input.userId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error("[editQueuedPost]", err);
    return { success: false, error: "Gagal mengedit post." };
  }
}
