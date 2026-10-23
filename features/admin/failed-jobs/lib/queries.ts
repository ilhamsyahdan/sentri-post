// features/admin/failed-jobs/lib/queries.ts
import { createClient } from "@/utils/supabase/server";
import type {
  FailedJob,
  FailedJobsFilters,
  FailedJobsStats,
  Platform,
} from "../types";
import { supabaseAdmin } from "@/utils/supabase/admin";

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// READ — paginated list with joins
// ---------------------------------------------------------------------------
export async function getFailedJobs(
  filters: FailedJobsFilters,
  page: number = 1
): Promise<{ data: FailedJob[]; total: number }> {
  const supabase = supabaseAdmin;

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
      created_at,
      updated_at,

      posts (
        content,
        user_id
      ),

      connections (
        platform,
        platform_user_name,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .in("status", ["failed", "failed_permanent"])
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  // =========================================================
  // FILTER STATUS
  // =========================================================

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  // =========================================================
  // FILTER PLATFORM
  // =========================================================

  if (filters.platform !== "all") {
    query = query.eq("connections.platform", filters.platform);
  }

  // =========================================================
  // SEARCH
  // =========================================================

  // sementara comment dulu untuk debugging
  /*
  if (filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;

    query = query.or(
      `posts.user_id.ilike.${term},
       posts.content.ilike.${term},
       connections.platform_user_name.ilike.${term}`
    );
  }
  */

  // =========================================================
  // RUN QUERY
  // =========================================================

  const { data, count, error } = await query;

  if (error) {
    console.error("[getFailedJobs] Supabase error:", error);
    throw new Error(error.message);
  }

  // =========================================================
  // MAP DATA
  // =========================================================

  const jobs: FailedJob[] = (data ?? []).map((row: any) => ({
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
    created_at: row.created_at,
    updated_at: row.updated_at,

    post_content: row.posts?.content ?? "",

    post_user_id: row.posts?.user_id ?? "",

    platform: row.connections?.platform as Platform,

    platform_user_name: row.connections?.platform_user_name ?? null,

    avatar_url: row.connections?.avatar_url ?? null,
  }));

  return {
    data: jobs,
    total: count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// READ — aggregate stats
// ---------------------------------------------------------------------------
export async function getFailedJobsStats(): Promise<FailedJobsStats> {
  const supabase = await createClient();

  // Single query: all failed rows with retry info and platform
  const { data, error } = await supabase
    .from("post_targets")
    .select(
      `
      id,
      status,
      retry_count,
      max_retries,
      connections ( platform ),
      posts ( user_id )
    `
    )
    .in("status", ["failed", "failed_permanent"]);

  if (error) throw new Error(error.message);

  const rows = data ?? [];

  const platformsSet = new Set<string>();
  const usersSet = new Set<string>();
  let total_failed = 0;
  let total_permanent = 0;
  let total_retryable = 0;
  let retrySum = 0;

  for (const row of rows as any[]) {
    if (row.status === "failed") total_failed++;
    if (row.status === "failed_permanent") total_permanent++;
    if (row.status === "failed" && row.retry_count < row.max_retries)
      total_retryable++;
    retrySum += row.retry_count ?? 0;
    if (row.connections?.platform) platformsSet.add(row.connections.platform);
    if (row.posts?.user_id) usersSet.add(row.posts.user_id);
  }

  return {
    total_failed,
    total_permanent,
    total_retryable,
    platforms_affected: platformsSet.size,
    users_affected: usersSet.size,
    avg_retry_count:
      rows.length > 0 ? Math.round((retrySum / rows.length) * 10) / 10 : 0,
  };
}

// ---------------------------------------------------------------------------
// READ — single job for detail / retry validation
// ---------------------------------------------------------------------------
export async function getFailedJobById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("post_targets")
    .select(
      `
      id, status, retry_count, max_retries, error_log,
      connections ( platform )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as any;
}
