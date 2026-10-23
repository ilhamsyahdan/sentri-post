export function getPlatformColor(platform: string) {
  switch (platform) {
    case "linkedin":
      return "#0A66C2";
    case "instagram":
      return "#E1306C";
    case "twitter":
      return "#000000";
    case "youtube":
      return "#FF0000";
    case "tiktok":
      return "#111111";
    default:
      return "#999999";
  }
}
