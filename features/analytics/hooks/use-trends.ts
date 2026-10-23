import { useMemo } from "react";
import { AnalyticsPost } from "../types/analytics";
import { MIN_PUBLISHED_FOR_TREND } from "../constants/thresholds";
import {
  avgOf,
  isPublishedWithData,
  pctChange,
} from "../utils/trend-calculations";

export interface Trends {
  engagement: number | undefined;
  views: number | undefined;
  likes: number | undefined;
  saved: number | undefined;
}

/**
 * Membandingkan rata-rata metrik pada separuh post terbaru vs separuh
 * sebelumnya (diurutkan berdasarkan scheduledAt). Butuh minimal
 * MIN_PUBLISHED_FOR_TREND post published supaya perbandingan cukup
 * reliable dan tidak noisy.
 */
export function useTrends(filteredPosts: AnalyticsPost[]): Trends {
  return useMemo(() => {
    const published = filteredPosts
      .filter(isPublishedWithData)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );

    if (published.length < MIN_PUBLISHED_FOR_TREND) {
      return {
        engagement: undefined,
        views: undefined,
        likes: undefined,
        saved: undefined,
      };
    }

    const mid = Math.floor(published.length / 2);
    const prevHalf = published.slice(0, mid);
    const recentHalf = published.slice(mid);

    return {
      engagement: pctChange(
        avgOf(recentHalf, "engagementRate"),
        avgOf(prevHalf, "engagementRate")
      ),
      views: pctChange(avgOf(recentHalf, "views"), avgOf(prevHalf, "views")),
      likes: pctChange(avgOf(recentHalf, "likes"), avgOf(prevHalf, "likes")),
      saved: pctChange(avgOf(recentHalf, "saved"), avgOf(prevHalf, "saved")),
    };
  }, [filteredPosts]);
}
