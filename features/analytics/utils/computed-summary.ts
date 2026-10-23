import { AnalyticsPost } from "../types/analytics";

// Standar ambang batas minimum sampel data yang valid
const MIN_RELIABLE_REACH = 10;

export function computeSummary(posts: AnalyticsPost[]) {
  // 1. Filter: Hanya hitung postingan yang data tayangannya (views) sudah reliable (>= 10)
  const validPosts = posts.filter((p) => p.views >= MIN_RELIABLE_REACH);

  // 2. Total akumulasi statistik tetap menghitung seluruh postingan
  const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
  const totalComments = posts.reduce((s, p) => s + p.comments, 0);
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalSaved = posts.reduce((s, p) => s + (p.saved || 0), 0);

  // 3. Murni menerapkan Persamaan (2.4) skripsi: Sum(ERR_i) / n
  //    dengan n = jumlah postingan yang valid
  const avgEngagement =
    validPosts.length > 0
      ? validPosts.reduce((s, p) => s + p.engagementRate, 0) / validPosts.length
      : 0;

  return {
    totalLikes,
    totalComments,
    totalViews,
    totalSaved,
    avgEngagement,
    publishedCount: validPosts.length, // Menampilkan jumlah post yang masuk sampel valid
  };
}
