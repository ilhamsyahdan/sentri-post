// features/admin/repositories/admin.repository.ts

import { supabaseAdmin } from "@/utils/supabase/admin";
import {
  ActivityEvent,
  FailedJob,
  OverviewStats,
  Platform,
  PlatformStat,
  QueueEntry,
  SuccessRatePoint,
  ThroughputPoint,
  WorkerHealth,
} from "../types/admin.types";

// ======================================================
// HELPERS
// ======================================================

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

// ======================================================
// RAW ROW TYPES
// ======================================================

interface RawStatusRow {
  status: string;
  updated_at: string;
}

interface RawConnection {
  platform: string | null;
  platform_user_name?: string | null;
}

interface RawPost {
  content: string | null;
  user_id: string | null;
}

interface RawTargetFull {
  id: string;
  post_id: string;
  status: string;
  error_log: string | null;
  retry_count: number;
  scheduled_at: string;
  updated_at: string;
  posts: RawPost | RawPost[] | null;
  connections: RawConnection | RawConnection[] | null;
}

interface RawTargetPlatform {
  status: string;
  connections: RawConnection | RawConnection[] | null;
}

interface RawTargetActivity {
  id: string;
  status: string;
  updated_at: string;
  posts: RawPost | RawPost[] | null;
  connections: RawConnection | RawConnection[] | null;
}

// Supabase kadang return object, kadang array — normalize di sini
function toSingleConnection(
  c: RawConnection | RawConnection[] | null
): RawConnection | null {
  if (!c) return null;
  return Array.isArray(c) ? c[0] ?? null : c;
}

function toSinglePost(p: RawPost | RawPost[] | null): RawPost | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

// ======================================================
// OVERVIEW STATS
// ======================================================

export async function getOverviewStats(): Promise<OverviewStats> {
  const h24 = hoursAgo(24);
  const h7d = hoursAgo(24 * 7);
  const today = new Date().toISOString().split("T")[0];

  const [
    published,
    failed,
    permanentFailed,
    queued,
    publishing,
    users24h,
    users7d,
    connections,
    failedConnections,
    postsToday,
    postsAllTime,
  ] = await Promise.all([
    supabaseAdmin
      .from("post_targets")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .gte("updated_at", h24),

    supabaseAdmin
      .from("post_targets")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("updated_at", h24),

    supabaseAdmin
      .from("post_targets")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed_permanent")
      .gte("updated_at", h24),

    supabaseAdmin
      .from("post_targets")
      .select("*", { count: "exact", head: true })
      .eq("status", "queued"),

    supabaseAdmin
      .from("post_targets")
      .select("*", { count: "exact", head: true })
      .eq("status", "publishing"),

    supabaseAdmin.from("posts").select("user_id").gte("created_at", h24),

    supabaseAdmin.from("posts").select("user_id").gte("created_at", h7d),

    supabaseAdmin
      .from("connections")
      .select("*", { count: "exact", head: true }),

    supabaseAdmin // ← query failedConnections masuk sini
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),

    supabaseAdmin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today),

    supabaseAdmin.from("posts").select("*", { count: "exact", head: true }),
  ]);

  const publishedCount = published.count ?? 0;
  const failedCount = failed.count ?? 0;
  const permanentFailedCount = permanentFailed.count ?? 0;
  const total = publishedCount + failedCount + permanentFailedCount;

  const uniqueUsers24h = new Set(users24h.data?.map((u) => u.user_id));
  const uniqueUsers7d = new Set(users7d.data?.map((u) => u.user_id));

  return {
    totalPublished24h: publishedCount,
    totalFailed24h: failedCount,
    totalPermanentFailed24h: permanentFailedCount,
    successRate24h: total > 0 ? Math.round((publishedCount / total) * 100) : 0,
    queuedCount: queued.count ?? 0,
    publishingCount: publishing.count ?? 0,
    retryPressure: failedCount,
    activeUsers24h: uniqueUsers24h.size,
    activeUsers7d: uniqueUsers7d.size,
    totalConnections: connections.count ?? 0,
    totalPostsToday: postsToday.count ?? 0,
    totalPostsAllTime: postsAllTime.count ?? 0,
    // failedConnections: failedConnections.count ?? 0,
  };
}

// ======================================================
// THROUGHPUT 24H
// ======================================================

export async function getThroughput24h(): Promise<ThroughputPoint[]> {
  const h24 = hoursAgo(24);

  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select("status, updated_at")
    .gte("updated_at", h24)
    .order("updated_at", { ascending: true });

  if (error) throw error;

  const buckets: Record<string, ThroughputPoint> = {};

  for (const row of (data ?? []) as RawStatusRow[]) {
    const date = new Date(row.updated_at);
    const hour = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours()
    ).toISOString();

    if (!buckets[hour]) {
      buckets[hour] = { hour, published: 0, failed: 0, queued: 0 };
    }

    if (row.status === "published") buckets[hour].published++;
    if (row.status === "failed" || row.status === "failed_permanent")
      buckets[hour].failed++;
    if (row.status === "queued") buckets[hour].queued++;
  }

  return Object.values(buckets);
}

// ======================================================
// PLATFORM STATS
// ======================================================

export async function getPlatformStats(): Promise<PlatformStat[]> {
  const { data, error } = await supabaseAdmin.from("post_targets").select(`
      status,
      connections (
        platform
      )
    `);

  if (error) throw error;

  const grouped: Record<string, { published: number; failed: number }> = {};

  for (const row of (data ?? []) as unknown as RawTargetPlatform[]) {
    const conn = toSingleConnection(row.connections);
    const platform = conn?.platform ?? "unknown";

    if (!grouped[platform]) {
      grouped[platform] = { published: 0, failed: 0 };
    }

    if (row.status === "published") grouped[platform].published++;
    if (row.status === "failed" || row.status === "failed_permanent")
      grouped[platform].failed++;
  }

  return Object.entries(grouped).map(([platform, stats]) => {
    const total = stats.published + stats.failed;
    return {
      platform: platform as Platform,
      published: stats.published,
      failed: stats.failed,
      successRate:
        total > 0 ? Math.round((stats.published / total) * 100) : 100,
    };
  });
}

// ======================================================
// FAILED JOBS
// ======================================================

export async function getFailedJobs(): Promise<FailedJob[]> {
  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select(
      `
      id,
      post_id,
      status,
      error_log,
      retry_count,
      scheduled_at,
      updated_at,
      posts (
        content,
        user_id
      ),
      connections (
        platform,
        platform_user_name
      )
    `
    )
    .in("status", ["failed", "failed_permanent"])
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as RawTargetFull;
    const conn = toSingleConnection(r.connections);
    const post = toSinglePost(r.posts);

    return {
      id: r.id,
      postId: r.post_id,
      status: r.status as "failed" | "failed_permanent",
      errorLog: r.error_log,
      retryCount: r.retry_count,
      scheduledAt: r.scheduled_at,
      updatedAt: r.updated_at,
      postContent: post?.content ?? "",
      userId: post?.user_id ?? "",
      platform: (conn?.platform ?? "") as Platform,
      platformUsername: conn?.platform_user_name ?? null,
    };
  });
}

// ======================================================
// ACTIVE QUEUE
// ======================================================

export async function getActiveQueue(): Promise<QueueEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select(
      `
      id,
      status,
      scheduled_at,
      retry_count,
      posts (
        content
      ),
      connections (
        platform,
        platform_user_name
      )
    `
    )
    .in("status", ["queued", "publishing"])
    .order("scheduled_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as RawTargetFull;
    const conn = toSingleConnection(r.connections);
    const post = toSinglePost(r.posts);

    return {
      id: r.id,
      status: r.status as "queued" | "publishing",
      scheduledAt: r.scheduled_at,
      retryCount: r.retry_count,
      postContent: post?.content ?? "",
      platform: (conn?.platform ?? "") as Platform,
      platformUsername: conn?.platform_user_name ?? null,
    };
  });
}

// ======================================================
// WORKER HEALTH
// ======================================================

export async function getWorkerHealth(): Promise<WorkerHealth> {
  const [latestPublished, queued, failed, publishing] = await Promise.all([
    supabaseAdmin
      .from("post_targets")
      .select("updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single(),

    supabaseAdmin
      .from("post_targets")
      .select("*", { count: "exact", head: true })
      .eq("status", "queued"),

    supabaseAdmin
      .from("post_targets")
      .select("*", { count: "exact", head: true })
      .in("status", ["failed", "failed_permanent"]),

    supabaseAdmin
      .from("post_targets")
      .select("*", { count: "exact", head: true })
      .eq("status", "publishing"),
  ]);

  const lastProcessedAt = latestPublished.data?.updated_at ?? null;
  const queuedCount = queued.count ?? 0;

  let lagSeconds = 0;
  if (lagSeconds > 0) {
    lagSeconds = lastProcessedAt
      ? Math.floor((Date.now() - new Date(lastProcessedAt).getTime()) / 1000)
      : 9999;
  }
  return {
    lastProcessedAt,
    processingLagSeconds: lagSeconds,
    queuedJobs: queuedCount,
    failedJobs: failed.count ?? 0,
    publishingJobs: publishing.count ?? 0,
  };
}

// ======================================================
// ACTIVITY FEED
// ======================================================

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select(
      `
      id,
      status,
      updated_at,
      posts (
        user_id,
        content
      ),
      connections (
        platform
      )
    `
    )
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  const userIds = (data ?? []).map((row) => {
    const r = row as unknown as RawTargetActivity;
    const post = toSinglePost(r.posts);

    return post?.user_id;
  });

  const uniqueUserIds = [...new Set(userIds.filter(Boolean))] as string[];

  const { data: users, error: usersError } = await supabaseAdmin
    .from("users")
    .select("id, full_name, email")
    .in("id", uniqueUserIds);

  if (usersError) throw usersError;

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  return (data ?? []).map((row) => {
    const r = row as unknown as RawTargetActivity;
    const conn = toSingleConnection(r.connections);
    const post = toSinglePost(r.posts);
    const user = userMap.get(post?.user_id ?? "");

    return {
      id: r.id,
      status: r.status,
      platform: (conn?.platform ?? "") as Platform,
      updatedAt: r.updated_at,
      userId: post?.user_id ?? "",
      postContent: post?.content ?? "",
      userName: user?.full_name ?? "",
      userEmail: user?.email ?? "",
    };
  });
}

// ======================================================
// SUCCESS RATE 7D
// ======================================================

export async function getSuccessRate7d(): Promise<SuccessRatePoint[]> {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 7);

  const { data, error } = await supabaseAdmin
    .from("post_targets")
    .select("status, updated_at")
    .gte("updated_at", daysAgo.toISOString())
    .order("updated_at", { ascending: true });

  if (error) throw error;

  const grouped: Record<string, { published: number; failed: number }> = {};

  for (const row of (data ?? []) as RawStatusRow[]) {
    const date = new Date(row.updated_at).toISOString().split("T")[0];

    if (!grouped[date]) {
      grouped[date] = { published: 0, failed: 0 };
    }

    if (row.status === "published") grouped[date].published++;
    if (row.status === "failed" || row.status === "failed_permanent")
      grouped[date].failed++;
  }

  return Object.entries(grouped).map(([date, stats]) => {
    const total = stats.published + stats.failed;
    return {
      date,
      total,
      successRate: total > 0 ? Math.round((stats.published / total) * 100) : 0,
    };
  });
}
