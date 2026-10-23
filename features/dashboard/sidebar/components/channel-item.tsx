"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarChart2, ExternalLink, MoreHorizontal, Unplug } from "lucide-react";
import { PlatformAvatarUrl } from "./platform-avatar";
import { Channel, DisconnectTarget } from "../types";

interface ChannelItemProps {
  channel: Channel;
  isCollapsed: boolean;
  onDisconnect: (channel: DisconnectTarget) => void;
}

const getProfileUrl = (platform: string, handle: string, name?: string) => {
  if (platform === "instagram") {
    return `https://instagram.com/${handle.replace("@", "")}`;
  }
  if (platform === "linkedin" && name) {
    const query = encodeURIComponent(name);
    return `https://www.linkedin.com/search/results/people/?keywords=${query}`;
  }
  return null;
};

export const ChannelItem = ({
  channel,
  isCollapsed,
  onDisconnect,
}: ChannelItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarContent = (
    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
      <PlatformAvatarUrl avatarUrl={channel.avatar} size={28} />
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label={`${channel.name} ${channel.handle}`}
            className="w-full flex justify-center py-1.5 rounded-xl hover:bg-gray-50 transition-all"
          >
            {avatarContent}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {channel.name} · {channel.handle}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <div
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-gray-50 group",
          menuOpen && "bg-gray-50"
        )}
      >
        {avatarContent}

        <div className="flex flex-col items-start truncate flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-700 truncate w-full text-left leading-tight">
            {channel.name}
          </span>
          <span className="text-[10px] text-gray-400 truncate w-full text-left leading-tight">
            {channel.handle}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <DropdownMenuTrigger asChild>
            <button
              aria-label={`More options for ${channel.name}`}
              className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all",
                "opacity-0 group-hover:opacity-100",
                menuOpen && "opacity-100 text-gray-500 bg-gray-100"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={12} />
            </button>
          </DropdownMenuTrigger>
        </div>
      </div>

      <DropdownMenuContent
        align="end"
        side="right"
        className="w-48 p-1.5 rounded-xl shadow-xl border-gray-100"
      >
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
            <PlatformAvatarUrl avatarUrl={channel.avatar} size={32} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">
              {channel.name}
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              {channel.handle}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-100 my-1" />

        <DropdownMenuItem
          className="cursor-pointer py-2 px-2.5 rounded-lg text-xs gap-2 text-gray-600"
          onClick={() => {
            // TODO: navigate to channel analytics
          }}
        >
          <BarChart2 size={13} className="text-gray-400" />
          Lihat Analitik
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer py-2 px-2.5 rounded-lg text-xs gap-2 text-gray-600"
          onClick={() => {
            const url = getProfileUrl(
              channel.platform,
              channel.handle,
              channel.name
            );
            if (url) window.open(url, "_blank");
          }}
        >
          <ExternalLink size={13} className="text-gray-400" />
          Buka Profil
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-100 my-1" />

        <DropdownMenuItem
          className="cursor-pointer py-2 px-2.5 rounded-lg text-xs gap-2 text-red-500 hover:text-red-600! hover:bg-red-50! focus:text-red-600! focus:bg-red-50!"
          onClick={() =>
            onDisconnect({
              id: channel.id,
              name: channel.name,
              handle: channel.handle,
            })
          }
        >
          <Unplug size={13} />
          Putuskan Koneksi
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
