"use server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { auth } from "@clerk/nextjs/server";

export async function getMyChannels() {
  const { userId } = await auth();
  if (!userId) return [];

  const { data, error } = await supabaseAdmin
    .from("connections")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("error fetching channels: ", error);
    return [];
  }

  return data;
}
