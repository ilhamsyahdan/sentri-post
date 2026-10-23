"use client";

import Modal from "@/components/ui/modal";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { ConfirmedSlot, Post, toDatetimeLocal } from "../../types";
import { useState, useCallback, useMemo, memo } from "react";
import { BestTimeRecommendation } from "@/features/scheduling/components/best-time-recommendation";

// ─── Types ────────────────────────────────────────────────────────────────────

type SmartSlot = {
  date: Date;
  score: number;
  reason: string;
};

const WIB = "Asia/Jakarta";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatReadable(date: Date): string {
  return date.toLocaleString("id-ID", {
    timeZone: WIB,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Manual panel ─────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Hari ini 09.00", offset: 0, hour: 9 },
  { label: "Hari ini 12.00", offset: 0, hour: 12 },
  { label: "Besok 08.00", offset: 1, hour: 8 },
  { label: "Besok 17.00", offset: 1, hour: 17 },
];

const ManualPanel = memo(
  ({
    scheduledAt,
    onChange,
  }: {
    scheduledAt: string;
    onChange: (v: string) => void;
  }) => {
    const [activePreset, setActivePreset] = useState<string | null>(null);

    const pickPreset = useCallback(
      (offset: number, hour: number, label: string) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        d.setHours(hour, 0, 0, 0);
        const pad = (n: number) => String(n).padStart(2, "0");
        onChange(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
            d.getDate()
          )}T${pad(hour)}:00`
        );
        setActivePreset(label);
      },
      [onChange]
    );

    const displayDate = useMemo(
      () => (scheduledAt ? formatReadable(new Date(scheduledAt)) : null),
      [scheduledAt]
    );

    return (
      <div className="space-y-4">
        {/* Peringatan weekendWarn / Lower engagement telah dihapus dari sini */}

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
            <Zap size={10} className="text-[#4F7A28]" /> Quick presets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(({ label, offset, hour }) => (
              <button
                key={label}
                onClick={() => pickPreset(offset, hour, label)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  activePreset === label
                    ? "border-[#3B6D11] bg-[#EAF3DE] text-[#27500A]"
                    : "border-gray-200 text-gray-500 hover:border-[#3B6D11] hover:bg-[#F5FBF0] hover:text-[#27500A]"
                }`}
              >
                <Clock
                  size={11}
                  className={
                    activePreset === label ? "text-[#27500A]" : "text-gray-400"
                  }
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Custom
          </p>
          <div className="relative">
            <Calendar
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => {
                onChange(e.target.value);
                setActivePreset(null);
              }}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[#3B6D11] focus:bg-white transition-all text-gray-700"
            />
          </div>
          {displayDate && (
            <p className="mt-2 text-[11px] text-[#3B6D11] font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={11} /> {displayDate} WIB
            </p>
          )}
        </div>
      </div>
    );
  }
);
ManualPanel.displayName = "ManualPanel";

// ─── Main ScheduleModal ───────────────────────────────────────────────────────

const ScheduleModal = ({
  post,
  open,
  onClose,
  onSchedule,
}: {
  post: Post;
  open: boolean;
  onClose: () => void;
  onSchedule: (updated: Post) => void;
}) => {
  const [mode, setMode] = useState<"smart" | "manual">("smart");
  const [scheduledAt, setScheduledAt] = useState(
    toDatetimeLocal(post.scheduledAt)
  );

  const [confirmedSlot, setConfirmedSlot] = useState<
    ConfirmedSlot | undefined
  >();

  const handleConfirmSlot = useCallback((slot: ConfirmedSlot) => {
    setConfirmedSlot(slot);
    setScheduledAt(toDatetimeLocal(slot.scheduledAtUTC));
  }, []);

  const handleSchedule = useCallback(() => {
    if (!scheduledAt) return;
    onSchedule({
      ...post,
      status: "queued",
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
    onClose();
  }, [scheduledAt, post, onSchedule, onClose]);

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">Schedule post</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode("smart")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              mode === "smart"
                ? "bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-emerald-50/50"
            }`}
          >
            <Sparkles size={11} /> Best Time
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              mode === "manual"
                ? "bg-white text-gray-700 border border-gray-200 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar size={11} /> Manual
          </button>
        </div>

        {mode === "smart" ? (
          <BestTimeRecommendation
            channelId={post.channelId ?? ""}
            confirmedSlot={confirmedSlot}
            onConfirm={handleConfirmSlot}
          />
        ) : (
          <ManualPanel scheduledAt={scheduledAt} onChange={setScheduledAt} />
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSchedule}
          disabled={!scheduledAt}
          className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-[#173404] text-[#EAF3DE] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
        >
          <Send size={13} /> {scheduledAt ? "Schedule" : "Pick a time"}
        </button>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
