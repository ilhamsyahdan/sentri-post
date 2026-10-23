// features/admin/failed-jobs/types/index.ts

export type FailedJobStatus = "failed" | "failed_permanent";

export type Platform =
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "youtube";

export interface FailedJob {
  id: string;
  post_id: string;
  connection_id: string;
  scheduled_at: string;
  status: FailedJobStatus;
  platform_post_id: string | null;
  error_log: string | null;
  retry_count: number;
  max_retries: number;
  last_attempt_at: string | null;
  created_at: string;
  updated_at: string;

  // joined from posts
  post_content: string;
  post_user_id: string;

  // joined from connections
  platform: Platform;
  platform_user_name: string | null;
  avatar_url: string | null;
}

export interface FailedJobsFilters {
  platform: Platform | "all";
  status: FailedJobStatus | "all";
  search: string;
}

export interface FailedJobsPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface FailedJobsStats {
  total_failed: number;
  total_permanent: number;
  total_retryable: number;
  platforms_affected: number;
  users_affected: number;
  avg_retry_count: number;
}

export interface RetryResult {
  success: boolean;
  message: string;
  new_status?: string;
  retry_count?: number;
}

export interface BulkRetryResult {
  succeeded: number;
  skipped: number;
  errors: string[];
}
