export type ClassifiedError = {
  message: string;
  status: "failed" | "failed_permanent";
};

export function classifyPublishError(err: unknown): ClassifiedError {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  const retryableKeywords = [
    "429",
    "too many requests",
    "too many calls", // tambahan — variasi bahasa Meta
    "80002", // tambahan — kode spesifik Instagram rate limit
    "rate limit",
    "application request limit", // tambahan — frasa umum Meta
    "timeout",
    "network",
    "temporarily unavailable",
    "internal server error",
    "500",
    "502",
    "503",
    "504",
  ];

  const permanentKeywords = [
    "expired",
    "reconnect",
    "invalid access token",
    "invalid oauth",
    "permission",
    "unsupported",
    "not found",
    "404",
    "invalid image format", // <-- Dibuat lebih spesifik daripada sekadar "image"
  ];

  // 1. Cek dulu apakah termasuk retryable (paling aman untuk error HTTP status)
  if (retryableKeywords.some((k) => lower.includes(k))) {
    return {
      message,
      status: "failed",
    };
  }

  // 2. Jika bukan retryable, cek apakah ada kata kunci permanen
  if (permanentKeywords.some((k) => lower.includes(k))) {
    return {
      message,
      status: "failed_permanent",
    };
  }

  // 3. Fallback default
  return {
    message,
    status: "failed_permanent",
  };
}
