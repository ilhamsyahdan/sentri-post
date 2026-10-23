import { supabaseAdmin } from "@/utils/supabase/admin";
import { clerkClient } from "@clerk/nextjs/server";

export async function syncToClerk(userId: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (!data) return;

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { role: data.role },
  });
}
