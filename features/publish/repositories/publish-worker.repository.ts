import { supabaseAdmin } from "@/utils/supabase/admin";

export async function markTargetPublishing(targetId: string) {
  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .update({
      status: "publishing",
      last_attempt_at: new Date().toISOString(),
    })
    .eq("id", targetId)
    .eq("status", "queued")
    .select("id");
  if (error) throw error;

  return data.length > 0;
}

export async function getTargetStatusesByPostId(postId: string) {
  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select("status")
    .eq("post_id", postId);
  if (error) throw error;

  return data;
}

export async function updatePostStatus(postId: string, status: string) {
  const { error } = await supabaseAdmin
    .from("posts")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);
  if (error) throw error;
}

// BARU: ringkasan ringan untuk step fetch-target
export async function fetchTargetSummary(targetId: string) {
  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select("id, status, scheduled_at, post_id")
    .eq("id", targetId)
    .maybeSingle();

  if (error) throw error;
  return data; // null kalau target sudah dihapus
}

// UBAH: .single() jadi .maybeSingle()
export async function fetchTargetWithRelations(targetId: string) {
  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select(`*, posts (*), connections (*)`)
    .eq("id", targetId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// markTargetPublishing: tidak berubah

// UBAH: ada guard status dan cek error
export async function markTargetSuccess(
  targetId: string,
  platformPostId: string,
) {
  const { error } = await supabaseAdmin
    .from("post_targets")
    .update({
      status: "published",
      platform_post_id: platformPostId,
      error_log: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId)
    .eq("status", "publishing");

  if (error) throw error;
}

// UBAH: hanya untuk gagal final, tanpa retryCount
export async function markTargetFailed(targetId: string, errorLog: string) {
  const { error } = await supabaseAdmin
    .from("post_targets")
    .update({
      status: "failed_permanent",
      error_log: errorLog,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId)
    .in("status", ["queued", "publishing"]); // jangan pernah menimpa "published"

  if (error) throw error;
}
