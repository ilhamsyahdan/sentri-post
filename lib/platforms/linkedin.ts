import type { PlatformClient, PlatformConnection } from "./index";

export class LinkedInClient implements PlatformClient {
  getAuthUrl(userId: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      scope: "openid profile email w_member_social",
      state: userId,
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }

  async handleCallback(code: string): Promise<PlatformConnection> {
    // 1. Tukar code → token
    const tokenRes = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("Gagal ambil access token");

    // 2. Ambil profil
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    // LinkedIn return expires_in dalam detik
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    return {
      platform_user_id: profile.sub,
      platform_user_name:
        profile.name ?? `${profile.given_name} ${profile.family_name}`,
      avatar_url: profile.picture ?? null,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      token_expires_at: expiresAt,
    };
  }
}
