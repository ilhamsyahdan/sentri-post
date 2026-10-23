"use client";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Step } from "../types";

interface ModalFooterProps {
  step: Step;
  isDirty: boolean;
  isSavingDraft: boolean;
  isSubmitting: boolean;
  canProceed: boolean;
  canSubmit: boolean;
  hasAnySlot: boolean;
  allSlotsConfirmed: boolean;
  confirmedCount: number;
  selectedCount: number;
  onSaveDraft: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onShowMobileAi: () => void;
}

export function ModalFooter({
  step,
  isDirty,
  isSavingDraft,
  isSubmitting,
  canProceed,
  canSubmit,
  hasAnySlot,
  allSlotsConfirmed,
  confirmedCount,
  selectedCount,
  onSaveDraft,
  onPrev,
  onNext,
  onSubmit,
  onShowMobileAi,
}: ModalFooterProps) {
  return (
    <div className="px-4 sm:px-5 py-3 border-t bg-white flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <SaveDraftButton
          isDirty={isDirty}
          isSaving={isSavingDraft}
          onClick={onSaveDraft}
        />
        <button
          className="sm:hidden flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 border border-gray-200 rounded-xl px-3 py-1.5 transition-all"
          onClick={onShowMobileAi}
        >
          <Sparkles size={12} />
          Bantuan
        </button>
      </div>

      <div className="flex items-center gap-2">
        {step !== "compose" && (
          <button
            onClick={onPrev}
            disabled={isSubmitting}
            className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <ChevronLeft size={14} />
            Kembali
          </button>
        )}

        {step !== "review" ? (
          <Button
            disabled={!canProceed}
            onClick={onNext}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 rounded-xl font-bold text-sm shadow-none disabled:opacity-50 flex items-center gap-1.5 h-9"
          >
            {step === "schedule" && !allSlotsConfirmed && selectedCount > 0 ? (
              <>
                {confirmedCount}/{selectedCount} dijadwalkan
                <ChevronRight size={14} />
              </>
            ) : (
              <>
                Lanjut <ChevronRight size={14} />
              </>
            )}
          </Button>
        ) : (
          <Button
            disabled={!canSubmit}
            onClick={onSubmit}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 rounded-xl font-bold text-sm shadow-none disabled:opacity-50 flex items-center gap-1.5 h-9"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Menjadwalkan...
              </>
            ) : (
              <>
                <Send size={13} />
                {hasAnySlot ? "Jadwalkan" : "Kirim ke Antrian"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── SaveDraftButton ──────────────────────────────────────────────────────────

interface SaveDraftButtonProps {
  isDirty: boolean;
  isSaving: boolean;
  onClick: () => void;
}

function SaveDraftButton({ isDirty, isSaving, onClick }: SaveDraftButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isSaving || !isDirty}
      className={cn(
        "text-sm font-bold transition-colors flex items-center gap-1.5",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        isDirty && !isSaving
          ? "text-gray-700 hover:text-emerald-700"
          : "text-gray-400"
      )}
    >
      {isSaving ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          <span className="hidden sm:inline">Menyimpan...</span>
        </>
      ) : (
        <>
          <FileText size={13} />
          <span className="hidden sm:inline">
            Simpan Draft
            {isDirty && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-1 align-middle" />
            )}
          </span>
        </>
      )}
    </button>
  );
}
