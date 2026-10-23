"use server";

import { auth } from "@clerk/nextjs/server";
import { getDraftsService } from "../services/get-drafts.service";

export async function getDraftsAction() {
  const { userId } = await auth();
  if (!userId) return [];
  return getDraftsService(userId);
}
