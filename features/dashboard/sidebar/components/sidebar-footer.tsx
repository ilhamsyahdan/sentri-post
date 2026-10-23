"use client";

import Image from "next/image";
import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MoreVertical, User } from "lucide-react";

interface SidebarFooterProps {
  isCollapsed: boolean;
}

export const SidebarFooter = ({ isCollapsed }: SidebarFooterProps) => {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div className="p-3 border-t border-gray-50 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all outline-none",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {isLoaded && user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-[10px] object-cover shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded-[10px] bg-gray-100 animate-pulse shrink-0" />
              )}
              {!isCollapsed && (
                <div className="flex flex-col truncate text-left">
                  <span className="text-xs font-bold text-gray-800 truncate leading-tight">
                    {user?.fullName || "User"}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate leading-tight">
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <MoreVertical size={13} className="text-gray-300 shrink-0" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side={isCollapsed ? "right" : "top"}
          className="w-52 p-1.5 rounded-xl shadow-xl border-gray-100 mb-1"
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
            {user?.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover shrink-0"
                unoptimized
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">
                {user?.fullName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-gray-100 my-1" />

          <DropdownMenuItem
            className="cursor-pointer py-2 px-2.5 rounded-lg text-xs gap-2 text-gray-600"
            onClick={() => openUserProfile()}
          >
            <User size={13} className="text-gray-400" />
            Kelola Akun
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-100 my-1" />

          <DropdownMenuItem
            className="cursor-pointer py-2 px-2.5 rounded-lg text-xs gap-2 text-red-500 hover:!text-red-600 hover:!bg-red-50 focus:!text-red-600 focus:!bg-red-50"
            onClick={() => signOut()}
          >
            <LogOut size={13} />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
