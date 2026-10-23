"use server";

import { auth } from "@clerk/nextjs/server";
import { saveDraftService } from "../services/save-draft.service";
import { SaveDraftPayload } from "../types/draft.types";
import { revalidatePath } from "next/cache";

export async function saveDraftAction(
  payload: Omit<SaveDraftPayload, "userId">
) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");
  const result = await saveDraftService({ ...payload, userId });
  revalidatePath("/dashboard/publish");
  return result;
}
