// features/admin/users/lib/user.queries.ts
// Pure DB query layer — no business logic, no side effects

import { supabaseAdmin } from "@/utils/supabase/admin";
import type {
  AdminUser,
  PaginatedUsers,
  UsersQueryParams,
} from "../types/user-types";

export async function queryUsers(
  params: UsersQueryParams
): Promise<PaginatedUsers> {
  const { page, limit, search, status, role, sortBy, sortOrder } = params;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin.from("users").select("*", { count: "exact" });

  // Search across email and full_name
  if (search.trim()) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  // Status filter
  if (status === "active") {
    query = query.eq("is_banned", false);
  } else if (status === "banned") {
    query = query.eq("is_banned", true);
  }

  // Role filter
  if (role !== "all") {
    query = query.eq("role", role);
  }

  // Sorting + pagination
  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(`[queryUsers] ${error.message}`);

  return {
    data: (data ?? []) as AdminUser[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function queryUserById(userId: string): Promise<AdminUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`[queryUserById] ${error.message}`);
  }

  return data as AdminUser;
}

export async function mutateUserBanStatus(
  userId: string,
  payload: {
    is_banned: boolean;
    banned_at: string | null;
    banned_by: string | null;
    ban_reason: string | null;
  }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw new Error(`[mutateUserBanStatus] ${error.message}`);
}

export async function mutateUserRole(
  userId: string,
  role: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw new Error(`[mutateUserRole] ${error.message}`);
}
