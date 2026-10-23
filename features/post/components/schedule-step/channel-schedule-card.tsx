"use client";

import { memo, useState } from "react";
import { Channel } from "../../types";
import { usePostState } from "../../context/post-state-context";
import { cn } from "@/lib/utils";
import { PLATFORM_COLOR } from "../../constants";
import Image from "next/image";
import { Calendar, CheckCircle2, Sparkles } from "lucide-react";
import { ManualPanel } from "./manual-panel";
import { BestTimeRecommendation } from "@/features/scheduling/components/best-time-recommendation";

interface ChannelScheduleCardProps {
  channel: Channel;
  syncedChannelsCount?: number; // Prop baru untuk indikator sync
}

export const ChannelScheduleCard = memo(
  ({ channel, syncedChannelsCount = 1 }: ChannelScheduleCardProps) => {
    const { confirmedSlots, setSlotForChannel } = usePostState();
    const confirmedSlot = confirmedSlots[channel.id];

    const [mode, setMode] = useState<"smart" | "manual">("smart");
    const isSynced = syncedChannelsCount > 1;

    return (
      <div
        className={cn(
          "border rounded-2xl overflow-hidden transition-all",
          confirmedSlot ? "border-[#B7D9CB]" : "border-gray-200"
        )}
      >
        {/* Channel header */}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3",
            confirmedSlot
              ? "bg-linear-to-r from-[#E6F2ED] via-[#EFF7F3] to-[#E6F2ED]"
              : "bg-gray-50"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                PLATFORM_COLOR[channel.platform] ?? "bg-gray-400"
              )}
            >
              <Image
                src={channel.icon}
                width={14}
                height={14}
                alt={channel.platform}
              />
            </div>
            <div>
              {isSynced ? (
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-gray-800 capitalize">
                    {channel.platform}
                  </p>
                  <span className="text-[10px] bg-emerald-50 text-[#3D6B4F] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    {syncedChannelsCount} akun disinkronkan
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-gray-800">
                    {channel.name}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {channel.platform}
                  </p>
                </>
              )}
            </div>
          </div>

          {confirmedSlot ? (
            <div className="flex items-center gap-1.5 bg-[#E6F2ED] border border-[#B7D9CB] rounded-xl px-2.5 py-1">
              <CheckCircle2 size={10} className="text-[#3D6B4F]" />
              <span className="text-[10px] font-bold text-[#2A4B38]">
                {new Date(confirmedSlot.scheduledAtUTC).toLocaleString(
                  "id-ID",
                  {
                    timeZone: "Asia/Jakarta",
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5">
              Belum dijadwalkan
            </span>
          )}
        </div>

        {/* Mode toggle + panel */}
        <div className="p-4 space-y-3 border-t border-gray-100 bg-white">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setMode("smart")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
                mode === "smart"
                  ? "bg-[#E6F2ED] text-[#2A4B38] border border-[#B7D9CB]"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Sparkles size={11} /> Best Time
            </button>
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
                mode === "manual"
                  ? "bg-white text-gray-700 border border-gray-200 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Calendar size={11} /> Manual
            </button>
          </div>

          {mode === "smart" ? (
            <BestTimeRecommendation
              channelId={channel.id}
              confirmedSlot={confirmedSlot}
              onConfirm={(slot) => setSlotForChannel(channel.id, slot)}
            />
          ) : (
            <ManualPanel channelId={channel.id} />
          )}
        </div>
      </div>
    );
  }
);
ChannelScheduleCard.displayName = "ChannelScheduleCard";
