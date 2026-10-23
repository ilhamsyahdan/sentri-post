"use client";

import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";
import { usePostState } from "@/features/post/context/post-state-context";
import { ChannelScheduleCard } from "./channel-schedule-card";

export type SkippedSlot = {
  date: string;
  time: string;
  reason: "conflict" | "too_soon" | "weekend";
};

export type SlotResult = {
  scheduledAtLocal: string;
  scheduledAtUTC: string;
  skippedSlots: SkippedSlot[];
};
export type FindSlotState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; primary: SlotResult; alts: SlotResult[] }
  | { status: "error" };

export function formatShort(utcStr: string): string {
  return new Date(utcStr).toLocaleString("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isWeekend(localStr: string): boolean {
  if (!localStr) return false;
  const d = new Date(localStr).getDay();
  return d === 0 || d === 6;
}

export function toUTC(localStr: string): string {
  return new Date(localStr + ":00+07:00").toISOString();
}

export const AltRow = memo(
  ({
    slot,
    selected,
    onSelect,
  }: {
    slot: SlotResult;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all",
        selected
          ? "border-[#B7D9CB] bg-[#E6F2ED]"
          : "border-gray-100 bg-white hover:border-[#B7D9CB] hover:bg-[#F4FAF7]"
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">
          {formatShort(slot.scheduledAtUTC)}
        </p>
      </div>
    </button>
  )
);
AltRow.displayName = "AltRow";

const ScheduleStep = memo(() => {
  const { selectedIds, channels, confirmedSlots, syncPlatforms } =
    usePostState();
  const activeChannels = useMemo(
    () => channels.filter((c) => selectedIds.includes(c.id)),
    [channels, selectedIds]
  );

  const channelsToRender = useMemo(() => {
    const processedPlatforms = new Set<string>();
    return activeChannels.filter((channel) => {
      const isSynced = syncPlatforms[channel.platform];
      if (isSynced) {
        if (processedPlatforms.has(channel.platform)) return false;
        processedPlatforms.add(channel.platform);
      }
      return true;
    });
  }, [activeChannels, syncPlatforms]);
  const confirmedCount = selectedIds.filter(
    (id) => !!confirmedSlots[id]
  ).length;
  const allConfirmed = confirmedCount === selectedIds.length;

  return (
    <div className="space-y-4">
      {selectedIds.length > 1 && (
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                allConfirmed ? "bg-[#2A4B38]" : "bg-[#3D6B4F]"
              )}
              style={{
                width: `${(confirmedCount / selectedIds.length) * 100}%`,
              }}
            />
          </div>
          <span
            className={cn(
              "text-[11px] font-bold shrink-0 transition-colors",
              allConfirmed ? "text-[#2A4B38]" : "text-gray-400"
            )}
          >
            {allConfirmed
              ? "✓ Semua dijadwalkan"
              : `${confirmedCount}/${selectedIds.length} dijadwalkan`}
          </span>
        </div>
      )}

      {channelsToRender.map((ch) => (
        <ChannelScheduleCard key={ch.id} channel={ch} />
      ))}
    </div>
  );
});

ScheduleStep.displayName = "ScheduleStep";
export default ScheduleStep;
