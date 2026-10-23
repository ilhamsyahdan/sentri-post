"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { ChannelItem } from "./channel-item";
import { useSidebar } from "../context/sidebar-context";

export const SidebarChannels = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { channels, onConnectChannel, onDisconnect } = useSidebar();
  const [channelSearch, setChannelSearch] = useState("");
  const [showChannelSearch, setShowChannelSearch] = useState(false);

  const filteredChannels = channels.filter((ch) => {
    if (!channelSearch.trim()) return true;
    const q = channelSearch.toLowerCase();
    return (
      ch.name.toLowerCase().includes(q) || ch.handle.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between px-3 mb-3",
          isCollapsed && "justify-center"
        )}
      >
        {!isCollapsed && (
          <>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Channels
              {channels.length > 0 && (
                <span className="ml-1.5 text-gray-300">
                  ({channels.length})
                </span>
              )}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChannelSearch(!showChannelSearch)}
                aria-label={
                  showChannelSearch ? "Close channel search" : "Search channels"
                }
                className={cn(
                  "transition-colors",
                  showChannelSearch
                    ? "text-[#4F7A28]"
                    : "text-gray-300 hover:text-gray-600"
                )}
              >
                <Search size={13} />
              </button>
            </div>
          </>
        )}
      </div>

      {showChannelSearch && !isCollapsed && (
        <div className="px-3 mb-3">
          <input
            type="text"
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            placeholder="Cari channel..."
            autoFocus
            className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#4F7A28] focus:bg-white transition-all"
          />
        </div>
      )}

      <div className="space-y-0.5">
        {filteredChannels.length === 0 && channelSearch && (
          <p className="text-[11px] text-gray-400 text-center py-3 px-3">
            Tidak ada channel &quot;{channelSearch}&quot;
          </p>
        )}
        {filteredChannels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isCollapsed={isCollapsed}
            onDisconnect={onDisconnect}
          />
        ))}
      </div>

      <button
        onClick={onConnectChannel}
        className={cn(
          "mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 border border-dashed border-gray-200 hover:border-[#4F7A28] hover:text-[#4F7A28] transition-all",
          isCollapsed ? "justify-center" : "justify-start"
        )}
      >
        <Plus size={13} className="shrink-0" />
        {!isCollapsed && (
          <span className="text-xs font-medium">Connect Channel</span>
        )}
      </button>
    </div>
  );
};
