"use client";

import { Clock, Trash2 } from "lucide-react";
import type { DraftRecord } from "../../types";
import { DRAFT_PREVIEW_LENGTH } from "../../constants";

interface DraftBannerProps {
  drafts: DraftRecord[];
  isLoading: boolean;
  onResume: (draft: DraftRecord) => void;
  onDelete: (draftId: string) => void;
}

export function DraftBanner({
  drafts,
  isLoading,
  onResume,
  onDelete,
}: DraftBannerProps) {
  if (isLoading || drafts.length === 0) return null;

  return (
    <div className="mx-4 sm:mx-5 mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2">
        Draft Tersimpan
      </p>
      <div className="space-y-1.5">
        {drafts.map((draft) => (
          <DraftBannerItem
            key={draft.id}
            draft={draft}
            onResume={onResume}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

// ─── DraftBannerItem ──────────────────────────────────────────────────────────

interface DraftBannerItemProps {
  draft: DraftRecord;
  onResume: (draft: DraftRecord) => void;
  onDelete: (draftId: string) => void;
}

function DraftBannerItem({ draft, onResume, onDelete }: DraftBannerItemProps) {
  const previewText = draft.content
    ? draft.content.slice(0, DRAFT_PREVIEW_LENGTH) +
      (draft.content.length > DRAFT_PREVIEW_LENGTH ? "..." : "")
    : "Draft kosong";

  const formattedDate = new Date(draft.updated_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => onResume(draft)}
        className="flex-1 text-left flex items-center gap-2 group"
      >
        <Clock size={11} className="text-amber-400 shrink-0" />
        <span className="text-[12px] text-gray-700 font-medium truncate group-hover:text-[#4F7A28] transition-colors">
          {previewText}
        </span>
        <span className="text-[10px] text-gray-400 shrink-0">
          {formattedDate}
        </span>
      </button>

      <button
        onClick={() => onDelete(draft.id)}
        aria-label="Hapus draft"
        className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}
