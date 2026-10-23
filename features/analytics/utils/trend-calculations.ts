import { AnalyticsPost } from "../types/analytics";

/**
 * Menghitung persentase perubahan dari `previous` ke `current`.
 * Baseline 0 bikin persentase nggak bermakna (bisa "infinite%" atau
 * "100%" palsu) — mending disembunyikan (undefined) daripada salah baca.
 */
export function pctChange(
  current: number,
  previous: number
): number | undefined {
  if (previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

export function avgOf(arr: AnalyticsPost[], key: keyof AnalyticsPost): number {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((s, p) => s + (Number(p[key]) || 0), 0);
  return sum / arr.length;
}

export function isPublishedWithData(p: AnalyticsPost): boolean {
  return Boolean(p.analyticsUpdatedAt);
}
