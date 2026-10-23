// features/channel/actions/disconnect-channel.ts
"use server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function disconnectChannel(connectionId: string) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("connections")
      .update({
        is_active: false,
        access_token: null,
        refresh_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connectionId)
      .eq("user_id", userId);

    if (error) {
      console.error("[disconnectChannel] Supabase DB Error:", error);
      throw new Error(
        error.message || "Gagal memperbarui status koneksi di database"
      );
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[disconnectChannel] Exception:", err);
    throw err instanceof Error
      ? err
      : new Error("Terjadi kesalahan koneksi server");
  }
}
