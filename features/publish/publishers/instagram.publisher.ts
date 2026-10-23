// instagram.publisher
import { normalizeMediaUrls } from "@/features/publish/utils/normalize-media";

interface PublishInstagramInput {
  accessToken: string;
  igUserId: string;
  content: string;
  mediaUrls: unknown;
}

export async function publishToInstagram({
  accessToken,
  igUserId,
  content,
  mediaUrls,
}: PublishInstagramInput) {
  const normalized = normalizeMediaUrls(mediaUrls);
  const mediaUrl = normalized[0];

  if (!mediaUrl) {
    throw new Error("Instagram butuh minimal 1 media.");
  }

  const isVideo = /\.(mp4|mov|avi)(\?|$)/i.test(mediaUrl);

  // ── Step 1: Create container ──────────────────────────────
  const containerBody = isVideo
    ? {
        media_type: "REELS",
        video_url: mediaUrl,
        caption: content,
        access_token: accessToken,
      }
    : {
        image_url: mediaUrl,
        caption: content,
        access_token: accessToken,
      };

  const createMediaRes = await fetch(
    `https://graph.instagram.com/v25.0/${igUserId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerBody),
    }
  );

  const mediaData = await createMediaRes.json();

  if (mediaData.error) {
    throw new Error(
      `${mediaData.error.message} (code: ${mediaData.error.code})`
    );
  }

  // ── Step 2: Polling status (image & video) ────────────────
  let statusCode = "";
  let attempts = 0;
  const maxAttempts = isVideo ? 20 : 10;

  while (statusCode !== "FINISHED") {
    if (attempts >= maxAttempts) {
      throw new Error("Media processing timeout.");
    }

    await new Promise((r) => setTimeout(r, isVideo ? 3000 : 2000));

    const statusRes = await fetch(
      `https://graph.instagram.com/v25.0/${mediaData.id}?fields=status_code&access_token=${accessToken}`
    );
    const statusData = await statusRes.json();
    statusCode = statusData.status_code;

    if (statusCode === "ERROR") {
      throw new Error("Instagram gagal memproses media.");
    }

    attempts++;
  }

  // ── Step 3: Publish ───────────────────────────────────────
  const publishRes = await fetch(
    `https://graph.instagram.com/v25.0/${igUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: mediaData.id,
        access_token: accessToken,
      }),
    }
  );

  const publishData = await publishRes.json();
  if (publishData.error)
    throw new Error(
      `${publishData.error.message} (code: ${publishData.error.code})`
    );

  return { platformPostId: publishData.id };
}
