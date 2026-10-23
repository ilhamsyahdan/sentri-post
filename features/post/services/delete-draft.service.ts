import { deleteDraftById } from "../repositories/draft.repository";

export async function deleteDraftService(
  draftId: string,
  userId: string
): Promise<void> {
  const { error } = await deleteDraftById({
    draftId,
    userId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
