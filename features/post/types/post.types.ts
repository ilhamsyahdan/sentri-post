export type ConnectionRow = {
  id: string;
  platform: string;
  platform_user_name: string | null;
  avatar_url: string | null;
  is_active?: boolean;
};

export type PostTargetRow = {
  id: string;
  status: string;
  scheduled_at: string | null;
  posted_at: string | null; // Tambahkan ini (tanggal terbit di level target)
  platform_post_id: string | null;
  error_log: string | null;
  likes_count: number | null;
  comments_count: number | null;
  shares_count: number | null;
  views_count: number | null;
  engagement_rate: number | null;
  connections: ConnectionRow | ConnectionRow[] | null;
};

export type PostRow = {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  status: string;
  scheduled_at: string | null; // Tambahkan ini jika ada di tabel posts
  posted_at: string | null; // Tambahkan ini (tanggal terbit utama)
  draft_channels: unknown;
  created_at: string;
  post_targets: PostTargetRow[] | null;
};

export type FetchedPost = {
  id: string;
  user_id: string;
  content: string;
  draft_channels: unknown[]; // Ubah dari string[] ke unknown[] agar match dengan PostRow
  media_urls: string[];
  created_at: string;
  status: "draft" | "queued" | "published" | "failed";
  scheduled_at: string | null;
  posted_at: string | null;
  platform_post_id: string | null;
  error_log: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  engagement_rate: number;
  connections: ConnectionRow | null;
  channel_name: string | null;
  channel_avatar: string | null;
};
