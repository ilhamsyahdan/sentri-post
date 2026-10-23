// features/admin/users/utils/user.utils.ts

import { formatDistanceToNow } from "date-fns";

export function formatRelativeDate(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "—";
  }
}

export function buildUsersQueryParams(
  searchParams: Record<string, string | undefined>
) {
  return {
    page: Math.max(1, parseInt(searchParams.page ?? "1", 10)),
    limit: 20,
    search: searchParams.search ?? "",
    status: (searchParams.status ?? "all") as "all" | "active" | "banned",
    role: (searchParams.role ?? "all") as "all" | "admin" | "user",
    sortBy: (searchParams.sortBy ?? "created_at") as
      | "created_at"
      | "updated_at"
      | "full_name",
    sortOrder: (searchParams.sortOrder ?? "desc") as "asc" | "desc",
  };
}
