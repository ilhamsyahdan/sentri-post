// ─────────────────────────────────────────────────────────────────────────────
// Queue Service — Pure Supabase query logic. No Next.js, no UI.
// All business rules live here, NOT in server actions or components.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@/utils/supabase/server";
import {
  QueueFilters,
  QueueItem,
  QueueItemRow,
  QueuePage,
  QueueStatus,
} from "../types/queue-types";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/utils/supabase/admin";

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toViewModel(row: QueueItemRow): QueueItem {
  return {
    ...row,
    canRetry: row.status === "failed" && row.retry_count < row.max_retries,
    isTerminal: row.status === "published" || row.status === "failed_permanent",
  };
}

function clampPageSize(size?: number) {
  if (!size) return PAGE_SIZE_DEFAULT;

  return Math.min(Math.max(1, size), PAGE_SIZE_MAX);
}

// ─── Main query ───────────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of queue items.
 *
 * JOIN strategy:
 *   post_targets  ←→  posts       (post_id)
 *   post_targets  ←→  connections (connection_id)
 *
 * Search:
 *   - posts.content
 *   - connections.platform_user_name
 *
 * Search tidak menggunakan RPC.
 * Pencarian dilakukan dengan query Supabase biasa:
 *   1. Cari post yang content-nya cocok.
 *   2. Cari connection yang username-nya cocok.
 *   3. Gunakan ID hasil pencarian tersebut untuk memfilter post_targets.
 *
 * Pagination menggunakan OFFSET/LIMIT melalui range().
 */
export async function getQueuePage(filters: QueueFilters): Promise<QueuePage> {
  const supabase = supabaseAdmin;

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = clampPageSize(filters.pageSize);
  const offset = (page - 1) * pageSize;

  const statuses: QueueStatus[] =
    filters.statuses && filters.statuses.length > 0
      ? filters.statuses
      : ["queued", "publishing", "published", "failed", "failed_permanent"];

  const search = filters.search?.trim() ?? "";

  // ───────────────────────────────────────────────────────────────────────────
  // Search
  // ───────────────────────────────────────────────────────────────────────────

  let matchingPostIds: string[] = [];
  let matchingConnectionIds: string[] = [];

  if (search.length > 0) {
    const searchPattern = `%${search}%`;

    const [postsResult, connectionsResult] = await Promise.all([
      supabase.from("posts").select("id").ilike("content", searchPattern),

      supabase
        .from("connections")
        .select("id")
        .ilike("platform_user_name", searchPattern),
    ]);

    if (postsResult.error) {
      throw new Error(
        `[QueueService] search posts: ${postsResult.error.message}`
      );
    }

    if (connectionsResult.error) {
      throw new Error(
        `[QueueService] search connections: ${connectionsResult.error.message}`
      );
    }

    matchingPostIds = (postsResult.data ?? []).map((post) => post.id);

    matchingConnectionIds = (connectionsResult.data ?? []).map(
      (connection) => connection.id
    );

    // Kalau tidak ada content maupun account yang cocok,
    // langsung kembalikan halaman kosong.
    if (matchingPostIds.length === 0 && matchingConnectionIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Base queue query
  // ───────────────────────────────────────────────────────────────────────────

  let query = supabase
    .from("post_targets")
    .select(
      `
        id,
        post_id,
        connection_id,
        scheduled_at,
        status,
        platform_post_id,
        error_log,
        retry_count,
        max_retries,
        last_attempt_at,
        likes_count,
        comments_count,
        shares_count,
        views_count,
        engagement_rate,
        saved_count,
        created_at,
        updated_at,

        posts (
          content,
          media_urls
        ),

        connections (
          platform,
          platform_user_name,
          avatar_url
        )
      `,
      { count: "exact" }
    )
    .in("status", statuses);

  // ───────────────────────────────────────────────────────────────────────────
  // Apply search
  // ───────────────────────────────────────────────────────────────────────────

  if (search.length > 0) {
    const conditions: string[] = [];

    if (matchingPostIds.length > 0) {
      conditions.push(`post_id.in.(${matchingPostIds.join(",")})`);
    }

    if (matchingConnectionIds.length > 0) {
      conditions.push(`connection_id.in.(${matchingConnectionIds.join(",")})`);
    }

    query = query.or(conditions.join(","));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Pagination + ordering
  // ───────────────────────────────────────────────────────────────────────────

  const { data, error, count } = await query
    .order("scheduled_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    throw new Error(`[QueueService] getQueuePage: ${error.message}`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Flatten joined shape
  // ───────────────────────────────────────────────────────────────────────────

  const rows = (data ?? []).map(
    (row: any): QueueItemRow => ({
      id: row.id,
      post_id: row.post_id,
      connection_id: row.connection_id,
      scheduled_at: row.scheduled_at,
      status: row.status,
      platform_post_id: row.platform_post_id,
      error_log: row.error_log,
      retry_count: row.retry_count,
      max_retries: row.max_retries,
      last_attempt_at: row.last_attempt_at,

      likes_count: row.likes_count ?? 0,
      comments_count: row.comments_count ?? 0,
      shares_count: row.shares_count ?? 0,
      views_count: row.views_count ?? 0,
      engagement_rate: row.engagement_rate ?? 0,
      saved_count: row.saved_count ?? 0,

      created_at: row.created_at,
      updated_at: row.updated_at,

      content: row.posts?.content ?? "",
      media_urls: row.posts?.media_urls ?? [],

      platform: row.connections?.platform ?? "",
      platform_user_name: row.connections?.platform_user_name ?? null,
      avatar_url: row.connections?.avatar_url ?? null,
    })
  );

  const total = count ?? 0;

  return {
    items: rows.map(toViewModel),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Retry a single post_target ───────────────────────────────────────────────

/**
 * RACE CONDITION PREVENTION:
 * We use a conditional UPDATE — only succeeds when status is still 'failed'.
 *
 * Pattern:
 *   optimistic locking via WHERE status = 'failed'
 *
 * DO NOT just SET status = 'queued' blindly.
 */
export async function retryQueueItem(
  postTargetId: string
): Promise<{ retried: boolean; reason?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("post_targets")
    .update({
      status: "queued",
      error_log: null,
      last_attempt_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postTargetId)
    .eq("status", "failed")
    .select("id")
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw new Error(`[QueueService] retryQueueItem: ${error.message}`);
  }

  if (!data) {
    return {
      retried: false,
      reason:
        "Item is no longer in a failed state — it may have been retried already.",
    };
  }

  return {
    retried: true,
  };
}

// ─── Get a single item (for detail panel / polling) ───────────────────────────

export async function getQueueItemById(
  postTargetId: string
): Promise<QueueItem | null> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("post_targets")
    .select(
      `
        *,
        posts (
          content,
          media_urls,
          error_summary
        ),
        connections (
          platform,
          platform_user_name,
          avatar_url
        )
      `
    )
    .eq("id", postTargetId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(`[QueueService] getQueueItemById: ${error.message}`);
  }

  const row: QueueItemRow = {
    ...data,

    content: data.posts?.content ?? "",
    media_urls: data.posts?.media_urls ?? [],
    error_summary: data.posts?.error_summary ?? null,

    platform: data.connections?.platform ?? "",
    platform_user_name: data.connections?.platform_user_name ?? null,
    avatar_url: data.connections?.avatar_url ?? null,
  };

  return toViewModel(row);
}

// ─── Stats for header cards ───────────────────────────────────────────────────

export interface QueueStats {
  queued: number;
  publishing: number;
  failed: number;
  failed_permanent: number;
  published_today: number;
}

export async function getQueueStats(): Promise<QueueStats> {
  await headers();

  const supabase = supabaseAdmin;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [queued, publishing, failed, failedPerm, publishedToday] =
    await Promise.all([
      supabase
        .from("post_targets")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "queued"),

      supabase
        .from("post_targets")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "publishing"),

      supabase
        .from("post_targets")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "failed"),

      supabase
        .from("post_targets")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "failed_permanent"),

      supabase
        .from("post_targets")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "published")
        .gte("updated_at", todayStart.toISOString()),
    ]);

  return {
    queued: queued.count ?? 0,
    publishing: publishing.count ?? 0,
    failed: failed.count ?? 0,
    failed_permanent: failedPerm.count ?? 0,
    published_today: publishedToday.count ?? 0,
  };
}
