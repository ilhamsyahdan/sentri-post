// features/admin/users/components/UserRoleBadge.tsx
import { cn } from "@/lib/utils";
import type { UserRole } from "../types/user-types";

type Props = {
  role: UserRole;
  className?: string;
};

export function UserRoleBadge({ role, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1",
        role === "admin"
          ? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-800"
          : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
        className
      )}
    >
      {role === "admin" ? "Admin" : "User"}
    </span>
  );
}
