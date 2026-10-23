// features/admin/users/types/user.types.ts

export type UserRole = "admin" | "user";

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_banned: boolean;
  banned_at: string | null;
  banned_by: string | null;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
  total_posts?: number;
  total_connections?: number;
};

export type UserFilterStatus = "all" | "active" | "banned";
export type UserFilterRole = "all" | "admin" | "user";

export type UsersQueryParams = {
  page: number;
  limit: number;
  search: string;
  status: UserFilterStatus;
  role: UserFilterRole;
  sortBy: "created_at" | "updated_at" | "full_name";
  sortOrder: "asc" | "desc";
};

export type PaginatedUsers = {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BanUserPayload = {
  userId: string;
  reason: string;
  bannedBy: string;
};

export type UpdateRolePayload = {
  userId: string;
  role: UserRole;
};

export type UserActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
