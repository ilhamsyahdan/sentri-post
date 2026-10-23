// linkedin.publisher.ts
import { normalizeMediaUrls } from "@/features/publish/utils/normalize-media";

interface PublishLinkedInInput {
  accessToken: string;
  authorId: string;
  content: string;
  mediaUrls: unknown;
}

export async function publishToLinkedIn({
  accessToken,
  authorId,
  content,
  mediaUrls,
}: PublishLinkedInInput) {
  const author = `urn:li:person:${authorId}`;
  const normalized = normalizeMediaUrls(mediaUrls);

  const imageUrl = normalized[0];

  if (!imageUrl) {
    throw new Error("LinkedIn butuh minimal 1 gambar.");
  }

  // =========================================================
  // REGISTER UPLOAD
  // =========================================================

  const register = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          owner: author,
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    }
  );

  const registerData = await register.json();

  const uploadUrl =
    registerData.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;

  const asset = registerData.value.asset;

  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

  const imageRes = await fetch(imageUrl);

  const imageBuffer = await imageRes.arrayBuffer();

  await fetch(uploadUrl, {
    method: "PUT",
    body: imageBuffer,
  });

  // =========================================================
  // CREATE POST
  // =========================================================

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author,
      lifecycleState: "PUBLISHED",

      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content,
          },

          shareMediaCategory: "IMAGE",

          media: [
            {
              status: "READY",
              media: asset,
            },
          ],
        },
      },

      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();

    throw new Error(errorText);
  }

  return {
    platformPostId: res.headers.get("x-restli-id"),
  };
}
