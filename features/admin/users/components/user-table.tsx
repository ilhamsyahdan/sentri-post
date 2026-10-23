// features/admin/users/components/UserTable.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserTableRow } from "./user-table-row";
import { UserEmptyState } from "./user-empty-state";
import type { AdminUser } from "../types/user-types";

type Props = {
  users: AdminUser[];
  currentAdminId: string;
  isFiltered: boolean;
};

export function UserTable({ users, currentAdminId, isFiltered }: Props) {
  const router = useRouter();

  function handleMutated() {
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="py-3 pl-4 text-xs font-medium text-muted-foreground">
              User
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Role
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Ban Reason
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              Joined
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right pr-4">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <UserEmptyState isFiltered={isFiltered} />
          ) : (
            users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                currentAdminId={currentAdminId}
                onMutated={handleMutated}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
