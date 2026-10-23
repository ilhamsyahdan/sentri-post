// =============================================================================
// ENUMS & LITERALS
// =============================================================================

import { SkippedSlot } from "./components/schedule-step";

// Platform mencakup semua yang ada di DUMMY_CHANNELS + PLATFORM_CONFIG
export type Platform =
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "youtube";

// Subset platform yang sudah ada di Post (dari post-card)
export type PostPlatform = "instagram" | "linkedin";

export type Step = "compose" | "schedule" | "review";
export type AiMode = "generate" | "improve" | "hashtags" | "hooks";
export type RightPanel = "preview" | "ai";
export type ViewMode = "list" | "calendar";
export type PlatformFilter = "all" | "instagram" | "linkedin";

export type PostStatus = "queued" | "draft" | "published" | "failed";

export type TargetStatus =
  | "queued"
  | "publishing"
  | "published"
  | "failed"
  | "failed_permanent";

export type EngagementPrediction = "low" | "medium" | "high";

// =============================================================================
// FILTER & UI CONFIG TYPES
// =============================================================================

export interface PlatformFilterOption {
  value: PlatformFilter;
  label: string;
  iconSrc?: string;
}

// =============================================================================
// CHANNEL
// =============================================================================

export interface Channel {
  id: string;
  name: string;
  platform: PostPlatform;
  avatar: string;
  icon: string;
}

// =============================================================================
// POST CONTENT (compose state per channel)
// Diperluas dari PostContent lama — tambah cloudinary fields dari AccountPostState
// =============================================================================

export interface PostContent {
  text: string;
  file: File | null;
  previewUrl: string | null;
  // Cloudinary fields — diisi setelah upload berhasil
  isUploading?: boolean;
  cloudinaryUrl?: string | null;
  publicId?: string | null;
}

// =============================================================================
// POST (domain model dari database / post-card)
// =============================================================================

export interface PostStats {
  likes: number;
  comments: number;
  reposts: number;
  impressions: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  status: PostStatus;
  platform: PostPlatform;
  scheduledAt?: string;
  publishedAt?: string;
  isOptimalTime?: boolean;
  mediaUrl?: string;
  engagementPrediction?: EngagementPrediction;
  stats?: PostStats;
  errorLog?: string;

  channelId?: string; // ← TAMBAH INI (dari connections.id)
  channelName?: string;
  channelAvatar?: string;
}

// =============================================================================
// POST CARD PROPS
// =============================================================================

export interface PostCardProps {
  post: Post;
  bulkMode?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (post: Post) => void;
}

// =============================================================================
// PLATFORM CONFIG (dari post-card — label, icon, warna, char limit)
// =============================================================================

export interface PlatformConfigEntry {
  label: string;
  iconSrc: string;
  bg: string;
  charLimit: number;
}

export const PLATFORM_CONFIG: Record<PostPlatform, PlatformConfigEntry> = {
  // twitter: {
  //   label: "Twitter",
  //   iconSrc: "/twitter.png",
  //   bg: "bg-black",
  //   charLimit: 280,
  // },
  instagram: {
    label: "Instagram",
    iconSrc: "/instagram.png",
    bg: "bg-pink-500",
    charLimit: 2200,
  },
  linkedin: {
    label: "LinkedIn",
    iconSrc: "/linkedin.png",
    bg: "bg-[#0A66C2]",
    charLimit: 3000,
  },
  // tiktok: {
  //   label: "TikTok",
  //   iconSrc: "/tiktok.png",
  //   bg: "bg-black",
  //   charLimit: 2200,
  // },
};

// =============================================================================
// ENGAGEMENT PREDICTION CONFIG
// =============================================================================

export interface PredictionConfigEntry {
  label: string;
  color: string;
}

export const PREDICTION_CONFIG: Record<
  EngagementPrediction,
  PredictionConfigEntry
> = {
  low: {
    label: "Low engagement",
    color: "text-red-500 bg-red-50 border-red-100",
  },
  medium: {
    label: "Medium engagement",
    color: "text-amber-600 bg-amber-50 border-amber-100",
  },
  high: {
    label: "High engagement",
    color: "text-[#4F7A28] bg-[#EBF5E1] border-[#C8E6A0]",
  },
};

// =============================================================================
// DRAFT
// DraftRecord diperluas — sebelumnya hanya punya content & channels,
// sekarang sesuai dengan struktur DB (per-connection, dengan mediaUrls)
// =============================================================================

export interface DraftChannel {
  connectionId: string;
  name: string;
  avatar: string | null;
  text: string;
  mediaUrls: string[]; // cloudinary URLs — bukan local blob
  publicIds: string[];
}

export interface SaveDraftPayload {
  draftIdMap?: Record<string, string>;
  userId: string;
  channels: DraftChannel[];
}

export interface DraftRecord {
  id: string;
  connectionId: string;
  platform: string;
  content: string;
  mediaUrls: string[];
  publicIds: string[];
  created_at: string;
  updated_at: string;
}

// =============================================================================
// SCHEDULING
// =============================================================================

export interface ConfirmedSlot {
  scheduledAtLocal: string;
  scheduledAtUTC: string;
  score?: number;
  reason?: string;
  skippedSlots?: SkippedSlot[];
  mode: "smart" | "manual";
}

export interface SchedulingSlot {
  id: string;
  connection_id: string;
  day_of_week: number; // 0 = Minggu, 6 = Sabtu
  time_slot: string;
  timezone: string;
  score: number;
  is_active: boolean;
}

// =============================================================================
// STATE MAP TYPES
// =============================================================================

export type PostsMap = Record<string, PostContent>;
export type ConfirmedSlotsMap = Record<string, ConfirmedSlot>;

// =============================================================================
// DATE / FORMAT HELPERS
// Dipindah dari types.ts lama — tetap di sini agar tidak breaking import.
// Untuk project lebih besar, pindahkan ke lib/utils/format.ts
// =============================================================================

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(
    d.getHours()
  ).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
};

export const formatCount = (n: number): string =>
  n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

export const toDatetimeLocal = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export interface AccountPostState {
  text: string;
  file: File | null;
  previewUrl: string | null;

  isUploading?: boolean;
  cloudinaryUrl?: string | null;
  publicId?: string | null;

  uploadProgress?: number; // 0–100
}
