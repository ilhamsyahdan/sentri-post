import { supabaseAdmin } from "@/utils/supabase/admin";

export async function updateDraftById({
  draftId,
  userId,
  body,
}: {
  draftId: string;
  userId: string;
  body: object;
}) {
  return supabaseAdmin
    .from("posts")
    .update(body)
    .eq("id", draftId)
    .eq("user_id", userId)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();
}

export async function insertDraft(body: object) {
  return supabaseAdmin.from("posts").insert(body).select("id").single();
}

export async function getDraftsByUserId(userId: string) {
  return supabaseAdmin
    .from("posts")
    .select("id, content, draft_channels, created_at, updated_at")
    .eq("user_id", userId)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(20);
}

export async function deleteDraftById({
  draftId,
  userId,
}: {
  draftId: string;
  userId: string;
}) {
  return supabaseAdmin
    .from("posts")
    .delete()
    .eq("id", draftId)
    .eq("user_id", userId)
    .eq("status", "draft");
}
