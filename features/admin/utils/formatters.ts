export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

export function fmtMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

export function fmtRelative(iso: string | null): string {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

// features/admin/utils/formatters.ts

export function fmtHour(isoOrHour: string | number): string {
  if (isoOrHour === undefined || isoOrHour === null) return "";

  // 1. Jika input berupa angka jam tunggal (misal: "16", "0", 16)
  const numericHour = Number(isoOrHour);
  if (!isNaN(numericHour) && numericHour >= 0 && numericHour <= 23) {
    return `${String(numericHour).padStart(2, "0")}:00`;
  }

  // 2. Jika input berupa ISO Date string lengkap
  const date = new Date(isoOrHour);
  if (isNaN(date.getTime())) {
    return String(isoOrHour); // fallback aman jika tetap invalid
  }

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    hour12: false,
  }).format(date);
}

export function fmtDate(s: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(s));
}

export function platformLabel(p: string): string {
  const m: Record<string, string> = {
    twitter: "X / Twitter",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    bluesky: "Bluesky",
  };
  return m[p] ?? p;
}

export function statusBadgeCls(s: string): string {
  const m: Record<string, string> = {
    published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    queued: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    publishing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    failed_permanent: "bg-red-900/20 text-red-500 border-red-700/30",
  };
  return m[s] ?? "bg-zinc-800 text-zinc-400 border-zinc-700";
}

export function statusDotCls(s: string): string {
  const m: Record<string, string> = {
    published: "bg-emerald-400",
    queued: "bg-sky-400",
    publishing: "bg-amber-400 animate-pulse",
    failed: "bg-red-400",
    failed_permanent: "bg-red-600",
  };
  return m[s] ?? "bg-zinc-600";
}

export function healthOf(rate: number): "healthy" | "warning" | "critical" {
  if (rate >= 95) return "healthy";
  if (rate >= 80) return "warning";
  return "healthy";
}

export function lagHealth(s: number): "healthy" | "warning" | "critical" {
  if (s < 60) return "healthy";
  if (s < 300) return "warning";
  return "critical";
}
