"use server";

import { revalidatePath } from "next/cache";
import { deletePostService } from "../services/delete-post.service";
import { auth } from "@clerk/nextjs/server";

export async function deletePost(postId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = await deletePostService(postId, userId);
  if (result.success) revalidatePath("/dashboard/publish");

  return result;
}
