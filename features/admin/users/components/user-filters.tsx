// features/admin/users/components/UserFilters.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserFilterRole, UserFilterStatus } from "../types/user-types";

export function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") ?? "all") as UserFilterStatus;
  const role = (searchParams.get("role") ?? "all") as UserFilterRole;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      params.set("page", "1"); // reset to page 1 on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(v) => updateParam("status", v)}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Status
          </SelectItem>
          <SelectItem value="active" className="text-xs">
            Active
          </SelectItem>
          <SelectItem value="banned" className="text-xs">
            Banned
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={(v) => updateParam("role", v)}>
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Roles
          </SelectItem>
          <SelectItem value="admin" className="text-xs">
            Admin
          </SelectItem>
          <SelectItem value="user" className="text-xs">
            User
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
