import { supabaseAdmin } from "@/utils/supabase/admin";

export async function getConnectionById(id: string) {
  return supabaseAdmin.from("connections").select("*").eq("id", id).single();
}
