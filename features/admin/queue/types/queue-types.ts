// ─────────────────────────────────────────────
// Queue Monitoring — Type Definitions
// ─────────────────────────────────────────────

export type QueueStatus =
  | "queued"
  | "publishing"
  | "published"
  | "failed"
  | "failed_permanent";

export const QUEUE_STATUS_LABELS: Record<QueueStatus, string> = {
  queued: "Queued",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
  failed_permanent: "Failed (Permanent)",
};

export const ALL_STATUSES: QueueStatus[] = [
  "queued",
  "publishing",
  "published",
  "failed",
  "failed_permanent",
];

// ─── Raw DB row shape (joined) ───────────────
export interface QueueItemRow {
  // post_targets
  id: string;
  post_id: string;
  connection_id: string;
  scheduled_at: string;
  status: QueueStatus;
  platform_post_id: string | null;
  error_log: string | null;
  retry_count: number;
  max_retries: number;
  last_attempt_at: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  engagement_rate: number;
  saved_count: number;
  created_at: string;
  updated_at: string;

  // joined from posts
  content: string;
  media_urls: Array<{ url: string; type: "image" | "video" }>;
  // error_summary: string | null;

  // joined from connections
  platform: string;
  platform_user_name: string | null;
  avatar_url: string | null;
}

// ─── Enriched view model for UI ─────────────
export interface QueueItem extends QueueItemRow {
  canRetry?: boolean;
  isTerminal: boolean;
}

// ─── Filter / pagination params ─────────────
export interface QueueFilters {
  search?: string;
  statuses?: QueueStatus[];
  page?: number;
  pageSize?: number;
}

export interface QueuePage {
  items: QueueItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Server action result ────────────────────
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
