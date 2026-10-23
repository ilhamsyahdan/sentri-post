import "server-only";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { DraftChannel } from "../types/draft.types";

interface CreatePostParams {
  userId: string;
  content: string;
  mediaUrls: string[];
}

interface UpdatePostRecordParams {
  postId: string;
  userId: string;
  content: string;
  mediaUrl?: string | null;
  status: "draft" | "queued";
  draftChannels?: DraftChannel;
}

export async function createPost({
  userId,
  content,
  mediaUrls,
}: CreatePostParams) {
  return supabaseAdmin
    .from("posts")
    .insert({
      user_id: userId,
      content,
      media_urls: mediaUrls,
      status: "queued",
      queued_at: new Date().toISOString(),
    })
    .select()
    .single();
}

export async function deletePostById(postId: string, userId: string) {
  return supabaseAdmin
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);
}

export async function getPostById(postId: string, userId: string) {
  return supabaseAdmin
    .from("posts")
    .select("id, status, user_id, draft_channels")
    .eq("id", postId)
    .eq("user_id", userId)
    .single();
}

export async function updatePostRecord({
  postId,
  userId,
  content,
  mediaUrl,
  status,
  draftChannels,
}: UpdatePostRecordParams) {
  const result = await supabaseAdmin
    .from("posts")
    .update({
      content,
      media_urls: mediaUrl ? [mediaUrl] : [],
      status,
      draft_channels: status === "queued" ? [] : draftChannels,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("user_id", userId)
    .select();

  return result;
}

export async function getPostsByUserId(userId: string) {
  const result = await supabaseAdmin
    .from("posts")
    .select(
      `
        id,
        user_id,
        content,
        media_urls,
        status,
        draft_channels,
        created_at,

        post_targets!inner (
          id,
          status,
          scheduled_at,
          platform_post_id,
          error_log,
          likes_count,
          comments_count,
          shares_count,
          views_count,
          engagement_rate,

          connections!inner (
            id,
            platform,
            platform_user_name,
            avatar_url,
            is_active
          )
        )
      `,
    )
    .eq("user_id", userId)
    .eq("post_targets.connections.is_active", true)
    .order("created_at", { ascending: false });

  if (result.error) {
    console.error("[getPostsByUserId]", result.error);
    return { data: [], error: result.error };
  }

  // Tidak perlu lagi .filter() manual di JS
  return {
    data: result.data ?? [],
    error: null,
  };
}

export async function getPostWithTargets(postId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select(
      `
        id,
        user_id,
        status,
        media_urls,
        draft_channels,

        post_targets (
          id,
          status,
          platform_post_id,

          connections (
            platform,
            access_token
          )
        )
      `,
    )
    .eq("id", postId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("[getPostWithTargets]", error);
    return null;
  }

  return data;
}

export async function deletePostRecord(postId: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}
