// Build chart data: last 12 posts sorted oldest→newest

import { AnalyticsPost } from "../types/analytics";
import { fmtDateShort } from "./formatters";

// Menerima posts yang sudah difilter — tidak ada filter platform internal
export function buildChartData(posts: AnalyticsPost[]) {
  return posts
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
    .slice(-12)
    .map((p) => {
      // Batasi visualisasi chart maksimal 100% untuk mencegah visual outlier
      const cappedER = Math.min(p.engagementRate, 100);

      return {
        date: fmtDateShort(p.scheduledAt),
        likes: p.likes,
        comments: p.comments,
        reach: p.views,
        saved: p.saved,
        engagement: parseFloat(cappedER.toFixed(2)),
      };
    });
}
