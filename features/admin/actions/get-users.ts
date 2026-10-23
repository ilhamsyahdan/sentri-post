"use server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { AdminUser } from "../users/types/user-types";

export async function getUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      `
      id,
      email,
      full_name,
      avatar_url,
      role,
      created_at,
      updated_at,
      is_banned,
      banned_at,
      banned_by,
      ban_reason
    `
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data ?? [];
}
