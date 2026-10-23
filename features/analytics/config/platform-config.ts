import { Platform, PlatformConfig } from "../types/analytics";

export type SortKey = "date" | "engagement" | "likes" | "comments" | "reach";

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  instagram: {
    label: "Instagram",
    icon: "/instagram.png",
    color: "#E1306C",
    iconBg: "#fce4ec",
    metrics: { hasViews: true, hasSaved: true, hasShares: false },
    gradient: { from: "#E1306C", to: "#405DE6" },
    supportsAnalytics: true,
  },
  linkedin: {
    label: "LinkedIn",
    icon: "/linkedin.png",
    color: "#0A66C2",
    iconBg: "#E8F0FE",
    metrics: { hasViews: false, hasSaved: false, hasShares: true },
    gradient: { from: "#0A66C2", to: "#004182" },
    supportsAnalytics: false,
  },
};
