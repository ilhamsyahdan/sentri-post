"use client";

import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { toUTC } from "../schedule-step";
import { ConfirmedSlot } from "../../types";
import { usePostState } from "../../context/post-state-context";

const PRESETS = [
  { label: "Hari ini 09.00", offset: 0, hour: 9 },
  { label: "Hari ini 12.00", offset: 0, hour: 12 },
  { label: "Besok 08.00", offset: 1, hour: 8 },
  { label: "Besok 17.00", offset: 1, hour: 17 },
];

export const ManualPanel = memo(({ channelId }: { channelId: string }) => {
  const { confirmedSlots, setSlotForChannel } = usePostState();

  const confirmedSlot = confirmedSlots[channelId];
  const onConfirm = useCallback(
    (slot: ConfirmedSlot) => setSlotForChannel(channelId, slot),
    [channelId, setSlotForChannel]
  );
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const scheduledAtLocal = confirmedSlot?.scheduledAtLocal ?? "";

  const pickPreset = useCallback(
    (offset: number, hour: number, label: string) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const pad = (n: number) => String(n).padStart(2, "0");
      const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(hour)}:00`;
      onConfirm({
        scheduledAtLocal: local,
        scheduledAtUTC: toUTC(local),
        mode: "manual",
      });
      setActivePreset(label);
    },
    [onConfirm]
  );

  const handleInput = useCallback(
    (val: string) => {
      onConfirm({
        scheduledAtLocal: val,
        scheduledAtUTC: toUTC(val),
        mode: "manual",
      });
      setActivePreset(null);
    },
    [onConfirm]
  );

  const displayDate = useMemo(() => {
    if (!scheduledAtLocal) return null;
    return new Date(scheduledAtLocal).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [scheduledAtLocal]);

  return (
    <div className="space-y-4">
      {/* Peringatan weekendWarn / Lower engagement telah dihapus dari sini */}

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
          <Sparkles size={10} className="text-emerald-700" /> Quick presets
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(({ label, offset, hour }) => (
            <button
              key={label}
              onClick={() => pickPreset(offset, hour, label)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all",
                activePreset === label
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                  : "border-gray-200 text-gray-500 hover:border-emerald-700 hover:bg-emerald-50/50 hover:text-emerald-900"
              )}
            >
              <Clock
                size={11}
                className={
                  activePreset === label ? "text-emerald-900" : "text-gray-400"
                }
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Custom date & time
        </p>
        <div className="relative">
          <Calendar
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="datetime-local"
            value={scheduledAtLocal}
            onChange={(e) => handleInput(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-emerald-700 focus:bg-white transition-all text-gray-700"
          />
        </div>
        {displayDate && (
          <p className="mt-2 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={11} /> {displayDate} WIB
          </p>
        )}
      </div>
    </div>
  );
});
ManualPanel.displayName = "ManualPanel";
