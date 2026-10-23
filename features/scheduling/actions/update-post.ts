"use server";

import { revalidatePath } from "next/cache";
import {
  UpdatePostPayload,
  updatePostService,
} from "../services/update-post.service";

export async function updatePostAction(payload: UpdatePostPayload) {
  const result = await updatePostService(payload);
  if (result.success) {
    revalidatePath("/dashboard/publish");
  }
  return result;
}
