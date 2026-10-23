import { AnalyticsPost } from "../types/analytics";
import { PLATFORM_CONFIG } from "../config/platform-config";
import { MIN_RELIABLE_REACH } from "../constants/thresholds";

/**
 * Memilih post dengan engagement rate tertinggi.
 *
 * Prioritas:
 * 1. Post dengan reach yang reliabel (>= MIN_RELIABLE_REACH), kalau platform
 *    punya metrik reach.
 * 2. Kalau tidak ada post yang reliabel, fallback ke ER tertinggi dari
 *    seluruh filteredPosts.
 *
 * BUG LAMA: reduce() dipanggil tanpa initial value pada filteredPosts yang
 * bisa kosong -> throw "Reduce of empty array with no initial value".
 * Diperbaiki dengan early return + initial value eksplisit di setiap reduce.
 */
export function getTopPost(
  filteredPosts: AnalyticsPost[]
): AnalyticsPost | null {
  if (filteredPosts.length === 0) return null;

  const reliablePosts = filteredPosts.filter((post) => {
    const config = PLATFORM_CONFIG[post.platform] ?? PLATFORM_CONFIG.instagram;
    if (config.metrics.hasViews) {
      return post.views >= MIN_RELIABLE_REACH;
    }
    return true;
  });

  const pool = reliablePosts.length > 0 ? reliablePosts : filteredPosts;

  return pool.reduce(
    (best, post) => (post.engagementRate > best.engagementRate ? post : best),
    pool[0]
  );
}
