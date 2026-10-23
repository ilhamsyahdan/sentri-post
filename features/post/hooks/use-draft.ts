// features/post/hooks/use-draft.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveDraftAction } from "@/features/post/actions/save-draft";
import { DraftChannel, DraftRecord } from "@/features/post/types";
import { deletePostMedia } from "../actions/upload-media";
import { getDraftsAction } from "../actions/get-drafts";
import { deleteDraftAction } from "../actions/delete-draft";

interface UseDraftOptions {
  autoSaveMs?: number;
}

export interface UseDraftReturn {
  isSavingDraft: boolean;
  isLoadingDrafts: boolean;
  isDirty: boolean;
  drafts: DraftRecord[];
  handleSaveDraft: (channels: DraftChannel[]) => Promise<void>;
  handleDeleteDraft: (draftId: string) => Promise<void>;
  loadDrafts: () => Promise<void>;
  markDirty: () => void;
  resetDraft: () => void;
  getIdMap: () => Record<string, string>;
  setIdMap: (map: Record<string, string>) => void;
}

export function useDraft({ autoSaveMs = 0 }: UseDraftOptions): UseDraftReturn {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);

  const draftIdMapRef = useRef<Record<string, string>>({});
  const pendingChannelsRef = useRef<DraftChannel[]>([]);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load drafts ───────────────────────────────────────────────────────────

  const loadDrafts = useCallback(async () => {
    setIsLoadingDrafts(true);
    try {
      const data = await getDraftsAction();
      setDrafts(data);
    } catch (err) {
      console.error("[useDraft] loadDrafts:", err);
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSaveDraft = useCallback(
    async (channels: DraftChannel[]) => {
      const hasContent = channels.some(
        (ch) => ch.text.trim().length > 0 || ch.mediaUrls.length > 0
      );
      if (!hasContent) {
        toast.info("Belum ada konten untuk disimpan.");
        return;
      }

      setIsSavingDraft(true);
      try {
        const newIdMap = await saveDraftAction({
          draftIdMap: draftIdMapRef.current,
          channels,
        });

        draftIdMapRef.current = { ...draftIdMapRef.current, ...newIdMap };
        setIsDirty(false);
        await loadDrafts();
        toast.success("Draft tersimpan", {
          description: "Lanjutkan kapan saja.",
          duration: 2500,
        });
      } catch (err) {
        console.error("[useDraft] save:", err);
        toast.error("Gagal menyimpan draft.", {
          description: "Periksa koneksi dan coba lagi.",
        });
      } finally {
        setIsSavingDraft(false);
      }
    },
    [loadDrafts]
  );

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDeleteDraft = useCallback(
    async (draftId: string) => {
      try {
        const draft = drafts.find((d) => d.id === draftId);
        await deleteDraftAction(draftId);

        if (draft?.publicIds?.length) {
          await Promise.allSettled(
            draft.publicIds.map((id) => deletePostMedia(id))
          );
        }

        // Hapus entry dari map kalau connectionId-nya cocok
        const entry = Object.entries(draftIdMapRef.current).find(
          ([, postId]) => postId === draftId
        );
        if (entry) {
          const newMap = { ...draftIdMapRef.current };
          delete newMap[entry[0]];
          draftIdMapRef.current = newMap;
        }

        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
        toast.success("Draft dihapus.");
      } catch (err) {
        console.error("[useDraft] delete:", err);
        toast.error("Gagal menghapus draft.");
      }
    },
    [drafts]
  );

  // ── Auto-save (opsional) ──────────────────────────────────────────────────

  const scheduleAutoSave = useCallback(
    (channels: DraftChannel[]) => {
      if (autoSaveMs <= 0) return;
      pendingChannelsRef.current = channels;
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        handleSaveDraft(pendingChannelsRef.current);
      }, autoSaveMs);
    },
    [autoSaveMs, handleSaveDraft]
  );

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const markDirty = useCallback(() => setIsDirty(true), []);

  const resetDraft = useCallback(() => {
    draftIdMapRef.current = {};
    setIsDirty(false);
  }, []);

  const getIdMap = useCallback(() => draftIdMapRef.current, []);
  const setIdMap = useCallback((map: Record<string, string>) => {
    draftIdMapRef.current = map;
  }, []);

  return {
    isSavingDraft,
    isLoadingDrafts,
    isDirty,
    drafts,
    handleSaveDraft,
    handleDeleteDraft,
    loadDrafts,
    markDirty,
    resetDraft,
    getIdMap,
    setIdMap,
  };
}
