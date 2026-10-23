import { InstagramClient } from "./instagram";
import { LinkedInClient } from "./linkedin";

export interface PlatformConnection {
  platform_user_id: string;
  platform_user_name: string;
  avatar_url: string | null;
  access_token: string;
  refresh_token?: string | null;
  token_expires_at?: Date | null;
}

export interface PlatformClient {
  getAuthUrl(userId: string): string;
  handleCallback(code: string): Promise<PlatformConnection>;
}

export const SUPPORTED_PLATFORMS = ["instagram", "linkedin"] as const;
export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

const platformClients: Record<SupportedPlatform, PlatformClient> = {
  instagram: new InstagramClient(),
  linkedin: new LinkedInClient(),
};

export function getPlatformClient(platform: string): PlatformClient {
  const client = platformClients[platform as SupportedPlatform];
  if (!client) throw new Error(`Platform "${platform}" not supported`);
  return client;
}
