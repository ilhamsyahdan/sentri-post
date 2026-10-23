import type { PlatformClient, PlatformConnection } from "./index";
import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IGShortLivedTokenResponse {
  access_token?: string;
  user_id?: number;
  error_type?: string;
  error_message?: string;
}

interface IGLongLivedTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message: string; type: string; code: number };
}

interface IGProfile {
  id?: string;
  username?: string;
  profile_picture_url?: string;
  account_type?: string;
  error?: { message: string };
}

// ─── Client ───────────────────────────────────────────────────────────────────

export class InstagramClient implements PlatformClient {
  getAuthUrl(userId: string): string {
    const state = `${userId}__${crypto.randomBytes(8).toString("hex")}`;

    // Scope yang valid untuk Instagram Login (bukan Facebook Login)
    // Catatan: public_profile & business_management TIDAK ada di Instagram OAuth
    const scopes = [
      "business_basic",
      "business_content_publish",
      "business_manage_comments",
      "instagram_business_manage_insights",
    ].join(",");

    const url = new URL("https://www.instagram.com/oauth/authorize");
    url.searchParams.set("client_id", process.env.INSTAGRAM_CLIENT_ID!);
    url.searchParams.set("redirect_uri", process.env.INSTAGRAM_REDIRECT_URI!);
    url.searchParams.set("scope", scopes);
    url.searchParams.set("state", state);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("force_reauthorization", "true");

    return url.toString();
  }

  async handleCallback(code: string): Promise<PlatformConnection> {
    // ── disini Tukar code jadi short-lived token ────────────────────────────────
    const shortLivedToken = await this.exchangeCodeForToken(code);

    // ── disini Tukar short-lived jadi long-lived token (60 hari) ───────────────
    const { accessToken, expiresAt } =
      await this.exchangeForLongLivedToken(shortLivedToken);

    // disini Ambil profil Instagram via graph.instagram.com
    const profile = await this.fetchProfile(accessToken);

    if (!profile.id) {
      throw new Error("Failed to retrieve Instagram profile ID");
    }

    return {
      platform_user_id: profile.id,
      platform_user_name: profile.username ?? "",
      avatar_url: profile.profile_picture_url ?? null,
      access_token: accessToken,
      token_expires_at: expiresAt,
    };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private async exchangeCodeForToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
      grant_type: "authorization_code",
      code,
    });

    const res = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: params,
    });

    const data: IGShortLivedTokenResponse = await res.json();

    if (data.error_type) {
      throw new Error(
        data.error_message ?? "Failed to exchange code for token",
      );
    }
    if (!data.access_token) {
      throw new Error("No short-lived access token returned");
    }

    return data.access_token;
  }

  private async exchangeForLongLivedToken(
    shortLivedToken: string,
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    const params = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
      access_token: shortLivedToken,
    });

    const res = await fetch(
      `https://graph.instagram.com/access_token?${params}`,
    );
    const data: IGLongLivedTokenResponse = await res.json();

    if (data.error) {
      throw new Error(data.error.message ?? "Failed to get long-lived token");
    }
    if (!data.access_token) {
      throw new Error("No long-lived access token returned");
    }

    // expires_in dalam detik, default 60 hari jika tidak ada
    const secondsUntilExpiry = data.expires_in ?? 60 * 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + secondsUntilExpiry * 1000);

    return { accessToken: data.access_token, expiresAt };
  }

  private async fetchProfile(accessToken: string): Promise<IGProfile> {
    // Pakai graph.instagram.com (bukan graph.facebook.com) untuk Instagram Login
    const res = await fetch(
      `https://graph.instagram.com/v25.0/me?` +
        new URLSearchParams({
          fields: "id,username,profile_picture_url,account_type",
          access_token: accessToken,
        }),
    );

    const profile: IGProfile = await res.json();

    if (profile.error) {
      throw new Error(`Profile fetch failed: ${profile.error.message}`);
    }

    return profile;
  }
}
