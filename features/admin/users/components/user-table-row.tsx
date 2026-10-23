// features/admin/users/components/UserTableRow.tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  UserX,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { UserStatusBadge } from "./user-status-badge";
import { UserRoleBadge } from "./user-role-badge";
import { BanUserDialog } from "./ban-user-dialog";
import { unbanUserAction, updateRoleAction } from "../actions/user-actions";
import { formatRelativeDate } from "../utils/user-utils";
import type { AdminUser } from "../types/user-types";

type Props = {
  user: AdminUser;
  currentAdminId: string;
  onMutated: () => void;
};

export function UserTableRow({ user, currentAdminId, onMutated }: Props) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSelf = user.id === currentAdminId;

  function handleUnban() {
    startTransition(async () => {
      const result = await unbanUserAction(user.id);
      if (result.success) {
        toast.success(`${user.full_name ?? user.email} has been unbanned.`);
        onMutated();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRoleToggle() {
    const newRole = user.role === "admin" ? "user" : "admin";
    const formData = new FormData();
    formData.set("userId", user.id);
    formData.set("role", newRole);

    startTransition(async () => {
      const result = await updateRoleAction(formData);
      if (result.success) {
        toast.success(`Role updated to ${newRole}.`);
        onMutated();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <TableRow className="group hover:bg-muted/40 transition-colors">
        {/* Avatar + Name */}
        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name ?? "avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium uppercase text-muted-foreground">
                  {(user.full_name ?? user.email).charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.full_name ?? "—"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </TableCell>

        {/* Role */}
        <TableCell>
          <UserRoleBadge role={user.role} />
        </TableCell>

        {/* Status */}
        <TableCell>
          <UserStatusBadge isBanned={user.is_banned} />
        </TableCell>

        {/* Ban Reason */}
        <TableCell className="max-w-[200px]">
          {user.ban_reason ? (
            <p
              className="truncate text-xs text-muted-foreground"
              title={user.ban_reason}
            >
              {user.ban_reason}
            </p>
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </TableCell>

        {/* Joined */}
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
          {formatRelativeDate(user.created_at)}
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isPending}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Role toggle */}
              <DropdownMenuItem
                onClick={handleRoleToggle}
                disabled={isSelf || isPending}
                className="gap-2 text-sm"
              >
                {user.role === "admin" ? (
                  <>
                    <ShieldOff className="h-3.5 w-3.5" />
                    Demote to User
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Promote to Admin
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Ban / Unban */}
              {user.is_banned ? (
                <DropdownMenuItem
                  onClick={handleUnban}
                  disabled={isPending}
                  className="gap-2 text-sm text-emerald-600 focus:text-emerald-600"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => setBanDialogOpen(true)}
                  disabled={isSelf || isPending}
                  className="gap-2 text-sm text-red-600 focus:text-red-600"
                >
                  <UserX className="h-3.5 w-3.5" />
                  Ban User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <BanUserDialog
        user={user}
        open={banDialogOpen}
        onClose={() => setBanDialogOpen(false)}
        onSuccess={onMutated}
      />
    </>
  );
}
