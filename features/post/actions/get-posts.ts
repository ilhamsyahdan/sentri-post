import "server-only";
import { getPostsService } from "../services/get-posts.service";
import { auth } from "@clerk/nextjs/server";

export async function getPosts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return getPostsService(userId);
}
