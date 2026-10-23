export function normalizeStatus(
  postStatus?: string,
  targetStatus?: string
): "draft" | "queued" | "published" | "failed" {
  // 1. Utamakan status dari post_targets jika target ada
  if (targetStatus === "published") return "published";
  if (targetStatus === "queued") return "queued";
  if (targetStatus === "failed") return "failed";

  // 2. Jika target hilang (misal akibat disconnect), gunakan status utama dari tabel posts
  if (postStatus === "completed" || postStatus === "published")
    return "published";
  if (postStatus === "queued") return "queued";
  if (postStatus === "failed") return "failed";

  return "draft";
}
