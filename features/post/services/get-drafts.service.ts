import { DraftRecord } from "@/features/post/types";

import { getDraftsByUserId } from "../repositories/draft.repository";

export async function getDraftsService(userId: string): Promise<DraftRecord[]> {
  const { data, error } = await getDraftsByUserId(userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter(
      (row) =>
        Array.isArray(row.draft_channels) && row.draft_channels.length > 0
    )
    .map((row) => {
      const ch = row.draft_channels[0];

      return {
        id: row.id,
        connectionId: ch.connectionId,
        platform: ch.platform ?? "",
        content: row.content ?? ch.text ?? "",
        mediaUrls: ch.mediaUrls ?? [],
        publicIds: ch.publicIds ?? [],
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as DraftRecord;
    });
}
