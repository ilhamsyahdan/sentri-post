// features/admin/users/components/UserEmptyState.tsx
import { Users } from "lucide-react";

type Props = {
  isFiltered: boolean;
};

export function UserEmptyState({ isFiltered }: Props) {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            {isFiltered ? "No users match your filters" : "No users yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
            {isFiltered
              ? "Try adjusting your search or filter criteria."
              : "Users will appear here once they sign up."}
          </p>
        </div>
      </td>
    </tr>
  );
}
