// features/admin/users/actions/user.actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { banUser, unbanUser, updateUserRole } from "../services/user-service";
import type { UserActionResult } from "../types/user-types";

// ─── Guards ────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<string> {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if ((sessionClaims?.metadata as { role?: string })?.role !== "admin")
    throw new Error("Forbidden: admin only");
  return userId;
}

// ─── Schemas ───────────────────────────────────────────────────────────────

const BanSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

const RoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "user"]),
});

// ─── Actions ───────────────────────────────────────────────────────────────

export async function banUserAction(
  formData: FormData
): Promise<UserActionResult> {
  try {
    const adminId = await requireAdmin();

    const parsed = BanSchema.safeParse({
      userId: formData.get("userId"),
      reason: formData.get("reason"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const result = await banUser({
      userId: parsed.data.userId,
      reason: parsed.data.reason,
      bannedBy: adminId,
    });

    if (result.success) revalidatePath("/admin/users");
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return { success: false, error: message };
  }
}

export async function unbanUserAction(
  userId: string
): Promise<UserActionResult> {
  try {
    await requireAdmin();

    if (!userId) return { success: false, error: "Missing userId" };

    const result = await unbanUser(userId);
    if (result.success) revalidatePath("/admin/users");
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return { success: false, error: message };
  }
}

export async function updateRoleAction(
  formData: FormData
): Promise<UserActionResult> {
  try {
    await requireAdmin();

    const parsed = RoleSchema.safeParse({
      userId: formData.get("userId"),
      role: formData.get("role"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const result = await updateUserRole(parsed.data);
    if (result.success) revalidatePath("/admin/users");
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return { success: false, error: message };
  }
}
