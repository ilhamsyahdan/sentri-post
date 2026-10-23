import { supabaseAdmin } from "@/utils/supabase/admin";

export async function getQueuedTargets(postId: string) {
  return supabaseAdmin
    .from("post_targets")
    .select("id, connection_id")
    .eq("post_id", postId)
    .eq("status", "queued");
}

export async function deleteQueuedTargets(postId: string) {
  return supabaseAdmin
    .from("post_targets")
    .delete()
    .eq("post_id", postId)
    .eq("status", "queued");
}

interface CreatePostTargetParams {
  postId: string;
  connectionId: string;
  scheduledAt: string;
  status?: string;
}

export async function createPostTarget({
  postId,
  connectionId,
  scheduledAt,
  status = "queued",
}: CreatePostTargetParams) {
  return supabaseAdmin
    .from("post_targets")
    .insert({
      post_id: postId,
      connection_id: connectionId,
      scheduled_at: scheduledAt,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
}

export async function updateQueuedTargets(postId: string, scheduledAt: string) {
  return supabaseAdmin
    .from("post_targets")
    .update({
      scheduled_at: scheduledAt,
      updated_at: new Date().toISOString(),
    })
    .eq("post_id", postId)
    .eq("status", "queued");
}
