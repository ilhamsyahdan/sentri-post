// features/admin/users/services/user.service.ts
// Business logic layer — validates, orchestrates, throws domain errors

import { clerkClient } from "@clerk/nextjs/server";
import {
  queryUsers,
  queryUserById,
  mutateUserBanStatus,
  mutateUserRole,
} from "../lib/user-queries";
import type {
  // AdminUser,
  BanUserPayload,
  PaginatedUsers,
  UpdateRolePayload,
  UsersQueryParams,
  UserActionResult,
} from "../types/user-types";

export async function getUsersPage(
  params: UsersQueryParams
): Promise<PaginatedUsers> {
  return queryUsers(params);
}

export async function banUser(
  payload: BanUserPayload
): Promise<UserActionResult> {
  const user = await queryUserById(payload.userId);

  if (!user) return { success: false, error: "User not found." };
  if (user.is_banned)
    return { success: false, error: "User is already banned." };
  if (user.role === "admin")
    return { success: false, error: "Cannot ban an admin user." };

  await mutateUserBanStatus(payload.userId, {
    is_banned: true,
    banned_at: new Date().toISOString(),
    banned_by: payload.bannedBy,
    ban_reason: payload.reason,
  });

  const client = await clerkClient();
  await client.users.updateUserMetadata(payload.userId, {
    publicMetadata: { is_banned: true },
  });

  const sessions = await client.sessions.getSessionList({
    userId: payload.userId,
  });

  await Promise.all(
    sessions.data.map((s) => client.sessions.revokeSession(s.id))
  );

  return { success: true, data: undefined };
}

export async function unbanUser(userId: string): Promise<UserActionResult> {
  const user = await queryUserById(userId);

  if (!user) return { success: false, error: "User not found." };
  if (!user.is_banned) return { success: false, error: "User is not banned." };

  await mutateUserBanStatus(userId, {
    is_banned: false,
    banned_at: null,
    banned_by: null,
    ban_reason: null,
  });

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { is_banned: false },
  });
  return { success: true, data: undefined };
}

export async function updateUserRole(
  payload: UpdateRolePayload
): Promise<UserActionResult> {
  const user = await queryUserById(payload.userId);

  if (!user) return { success: false, error: "User not found." };
  if (user.role === payload.role)
    return { success: false, error: `User already has role: ${payload.role}` };

  await mutateUserRole(payload.userId, payload.role);

  return { success: true, data: undefined };
}
