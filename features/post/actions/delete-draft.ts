"use server";

import { auth } from "@clerk/nextjs/server";
import { deleteDraftService } from "../services/delete-draft.service";

export async function deleteDraftAction(draftId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };
  await deleteDraftService(draftId, userId);
}
