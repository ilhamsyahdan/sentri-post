export function normalizeMediaUrls(media: unknown): string[] {
  if (!media) return [];

  if (Array.isArray(media)) {
    return media.filter((item): item is string => typeof item === "string");
  }

  if (typeof media === "string") {
    try {
      const parsed = JSON.parse(media);

      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }

  return [];
}
