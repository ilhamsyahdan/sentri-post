"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { memo, useCallback, useMemo, useState } from "react";
import {
  AltRow,
  formatShort,
  SlotResult,
} from "../../post/components/schedule-step";
import { ConfirmedSlot } from "../../post/types";
import { getNextSlotsFromResearch } from "../actions/get-next-slot-research";

// Fitur ini murni fetch dari RESEARCH_BASE (via tabel scheduling_slots),
// jadi pakai SlotResult apa adanya — tidak ada score/formula tambahan.
export type FindSlotState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; primary: SlotResult; alts: SlotResult[] }
  | { status: "error" };

export const BestTimeRecommendation = memo(
  ({
    channelId,
    confirmedSlot,
    onConfirm,
  }: {
    channelId: string;
    confirmedSlot?: ConfirmedSlot;
    onConfirm: (slot: ConfirmedSlot) => void;
  }) => {
    const [state, setState] = useState<FindSlotState>({ status: "idle" });
    const [showAlts, setShowAlts] = useState(false);
    const [selectedAltIdx, setSelectedAltIdx] = useState<number | null>(null);

    const activeSlot = useMemo(() => {
      if (state.status !== "found") return null;
      return selectedAltIdx !== null
        ? state.alts[selectedAltIdx]
        : state.primary;
    }, [state, selectedAltIdx]);

    const isConfirmed =
      !!confirmedSlot &&
      !!activeSlot &&
      confirmedSlot.scheduledAtUTC === activeSlot.scheduledAtUTC;

    const findSlot = useCallback(async () => {
      setState({ status: "loading" });
      setShowAlts(false);
      setSelectedAltIdx(null);
      try {
        const results = await getNextSlotsFromResearch(channelId, 4);
        if (!results || results.length === 0) {
          setState({ status: "error" });
          return;
        }
        const [primary, ...alts] = results;
        setState({ status: "found", primary, alts });
        onConfirm({
          scheduledAtLocal: primary.scheduledAtLocal,
          scheduledAtUTC: primary.scheduledAtUTC,
          skippedSlots: primary.skippedSlots,
          mode: "smart",
        });
      } catch {
        setState({ status: "error" });
      }
    }, [channelId, onConfirm]);

    const handleUse = useCallback(() => {
      if (!activeSlot) return;
      onConfirm({
        scheduledAtLocal: activeSlot.scheduledAtLocal,
        scheduledAtUTC: activeSlot.scheduledAtUTC,
        skippedSlots: activeSlot.skippedSlots,
        mode: "smart",
      });
    }, [activeSlot, onConfirm]);

    const handleAltSelect = useCallback(
      (idx: number) => {
        if (state.status !== "found") return;
        setSelectedAltIdx(idx);
        const alt = state.alts[idx];
        onConfirm({
          scheduledAtLocal: alt.scheduledAtLocal,
          scheduledAtUTC: alt.scheduledAtUTC,
          skippedSlots: alt.skippedSlots,
          mode: "smart",
        });
      },
      [state, onConfirm]
    );

    if (state.status === "idle")
      return (
        <div className="flex flex-col items-center justify-center py-7 border-2 border-dashed border-emerald-300 rounded-2xl gap-3 bg-emerald-50">
          <div className="w-9 h-9 rounded-full bg-linear-to-r from-emerald-50 via-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Sparkles size={16} className="text-emerald-800" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-semibold text-emerald-900">
              Find best posting time
            </p>
            <p className="text-[11px] text-emerald-800/70 mt-1">
              Suggests posting times based on schedule
            </p>
          </div>
          <button
            onClick={findSlot}
            className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 hover:cursor-pointer text-emerald-100 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Sparkles size={12} /> Find best slot
          </button>
        </div>
      );

    if (state.status === "loading")
      return (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 size={20} className="text-emerald-800 animate-spin" />
          <p className="text-xs text-emerald-800 font-semibold">
            Scanning available slots...
          </p>
          <p className="text-[10px] text-emerald-800/60">
            Checking availability
          </p>
        </div>
      );

    if (state.status === "error")
      return (
        <div className="flex flex-col items-center justify-center py-7 gap-3 border-2 border-dashed border-red-100 rounded-2xl bg-red-50">
          <AlertTriangle size={18} className="text-red-400" />
          <p className="text-xs text-red-500 font-semibold">
            No available slots in the next 30 days
          </p>
          <button
            onClick={findSlot}
            className="text-xs font-semibold text-emerald-800 underline"
          >
            Try again
          </button>
        </div>
      );

    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 bg-emerald-800 text-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2">
                <Sparkles size={9} /> Best time
              </span>
              <p className="text-sm font-bold text-gray-900 leading-snug">
                {formatShort(activeSlot!.scheduledAtUTC)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleUse}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                isConfirmed
                  ? "bg-emerald-900 text-emerald-200"
                  : "bg-emerald-800 hover:bg-emerald-900 text-white"
              )}
            >
              {isConfirmed ? (
                <>
                  <CheckCircle2 size={12} /> Selected
                </>
              ) : (
                <>
                  <Send size={12} /> Use this time
                </>
              )}
            </button>
            <button
              onClick={findSlot}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-emerald-800 text-xs font-semibold hover:bg-emerald-50 transition-all shrink-0"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {state.alts.length > 0 && (
            <>
              <button
                onClick={() => setShowAlts((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                {showAlts ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                {showAlts
                  ? "Hide alternatives"
                  : `${state.alts.length} alternative slots`}
              </button>
              {showAlts && (
                <div className="space-y-1.5">
                  {state.alts.map((alt, i) => (
                    <AltRow
                      key={i}
                      slot={alt}
                      selected={selectedAltIdx === i}
                      onSelect={() => handleAltSelect(i)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {(activeSlot!.skippedSlots?.length ?? 0) > 0 && (
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <CheckCircle2 size={9} />
              {activeSlot!.skippedSlots!.length} slot dilewati
            </p>
          )}
        </div>
      </div>
    );
  }
);
BestTimeRecommendation.displayName = "BestTimeRecommendation";
