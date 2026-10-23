export type PostTargetStatus =
  | "queued"
  | "publishing"
  | "published"
  | "failed"
  | "failed_permanent";

export type Platform =
  | "twitter"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "bluesky";

export interface OverviewStats {
  totalPublished24h: number;
  totalFailed24h: number;
  totalPermanentFailed24h: number;
  successRate24h: number;
  queuedCount: number;
  publishingCount: number;
  retryPressure: number;
  activeUsers24h: number;
  activeUsers7d: number;
  totalConnections: number;
  // failedConnections: number;
  totalPostsToday: number;
  totalPostsAllTime: number;
}

export interface ThroughputPoint {
  hour: string;
  published: number;
  failed: number;
  queued: number;
}

export interface SuccessRatePoint {
  date: string;
  successRate: number;
  total: number;
}

export interface PlatformStat {
  platform: Platform;
  published: number;
  failed: number;
  successRate: number;
}

export interface FailedJob {
  id: string;
  postId: string;
  status: "failed" | "failed_permanent";
  errorLog: string | null;
  retryCount: number;
  scheduledAt: string;
  updatedAt: string;
  postContent: string;
  userId: string;
  platform: Platform;
  platformUsername: string | null;
}

export interface QueueEntry {
  id: string;
  status: "queued" | "publishing";
  scheduledAt: string;
  retryCount: number;
  postContent: string;
  platform: Platform;
  platformUsername: string | null;
}

export interface WorkerHealth {
  lastProcessedAt: string | null;
  processingLagSeconds: number;
  queuedJobs: number;
  failedJobs: number;
  publishingJobs: number;
}

export interface ActivityEvent {
  id: string;
  status: string;
  platform: Platform;
  updatedAt: string;
  userId: string;
  postContent: string;
  userName: string;
}
