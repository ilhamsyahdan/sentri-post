import { insertDraft, updateDraftById } from "../repositories/draft.repository";
import { SaveDraftPayload } from "../types/draft.types";

export async function saveDraftService(
  payload: SaveDraftPayload
): Promise<Record<string, string>> {
  const { draftIdMap = {}, userId, channels } = payload;

  const results = await Promise.allSettled(
    channels.map(async (channel) => {
      const existingId = draftIdMap[channel.connectionId];

      const body = {
        user_id: userId,
        content: channel.text,
        draft_channels: [channel],
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      // =====================================================
      // UPDATE EXISTING DRAFT
      // =====================================================

      if (existingId) {
        const { data, error } = await updateDraftById({
          draftId: existingId,
          userId,
          body,
        });

        if (error) {
          throw new Error(error.message);
        }

        // =====================================================
        // FALLBACK INSERT
        // kalau draft sudah berubah jadi queued/deleted
        // =====================================================

        if (!data) {
          const { data: inserted, error: insertError } = await insertDraft(
            body
          );

          if (insertError) {
            throw new Error(insertError.message);
          }

          return {
            connectionId: channel.connectionId,
            postId: inserted.id,
          };
        }

        return {
          connectionId: channel.connectionId,
          postId: data.id,
        };
      }

      // =====================================================
      // INSERT NEW DRAFT
      // =====================================================

      const { data, error } = await insertDraft(body);

      if (error) {
        throw new Error(error.message);
      }

      return {
        connectionId: channel.connectionId,
        postId: data.id,
      };
    })
  );

  // =====================================================
  // BUILD RESULT MAP
  // =====================================================

  const idMap: Record<string, string> = {};

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      idMap[result.value.connectionId] = result.value.postId;
    }
  });

  return idMap;
}
