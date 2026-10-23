"use server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { syncToClerk } from "@/lib/sync-role";
import { UserRole } from "../users/types/user-types";

export async function updateUserRole(userId: string, role: UserRole) {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) throw error;

  await syncToClerk(userId);
}
