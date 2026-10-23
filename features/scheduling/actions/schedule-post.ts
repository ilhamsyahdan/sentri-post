"use server";

import { revalidatePath } from "next/cache";
import {
  schedulePostService,
  SchedulePostInput,
} from "../services/schedule-post.service";
import { auth } from "@clerk/nextjs/server";

export async function schedulePost(input: Omit<SchedulePostInput, "userId">) {
  const { userId } = await auth();

  if (!userId) return { success: false, error: "Unauthorized" };

  const result = await schedulePostService({ ...input, userId });

  if (result.success) {
    revalidatePath("/dashboard/publish");
  }

  return result;
}
