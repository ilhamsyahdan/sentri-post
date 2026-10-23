// features/admin/users/components/UserStatusBadge.tsx
import { cn } from "@/lib/utils";

type Props = { isBanned: boolean; className?: string };

export function UserStatusBadge({ isBanned, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        isBanned
          ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800/60"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800/60",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isBanned
            ? "bg-red-500 dark:bg-red-400"
            : "bg-emerald-500 dark:bg-emerald-400"
        )}
      />
      {isBanned ? "Banned" : "Active"}
    </span>
  );
}
