interface DeleteLinkedInPostParams {
  platformPostId: string;
  accessToken: string;
}

export async function deleteLinkedInPost({
  platformPostId,
  accessToken,
}: DeleteLinkedInPostParams): Promise<void> {
  try {
    const res = await fetch(
      `https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(
        platformPostId
      )}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },

        signal: AbortSignal.timeout(8_000),
      }
    );

    if (!res.ok && res.status !== 404) {
      console.warn(`[LinkedIn delete] status ${res.status}`);
    }
  } catch (err) {
    console.warn("[deleteLinkedInPost]", err);
  }
}
