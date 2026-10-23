"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { schedulePost } from "../../scheduling/actions/schedule-post";
import { deleteDraftAction } from "../actions/delete-draft";
import { Channel, ConfirmedSlot } from "../types";
import { PostsState } from "../reducers/posts-reducer";

interface UsePostSubmitParams {
  userId: string | null | undefined;
  selectedIds: string[];
  posts: PostsState;
  confirmedSlots: Record<string, ConfirmedSlot>;
  channelById: Map<string, Channel>;
  getDraftIdMap: () => Record<string, string>;
  onSuccess: () => void;
}

export interface UsePostSubmitReturn {
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
}

/**
 * Bertanggung jawab HANYA untuk: validasi sebelum submit, kirim schedulePost
 * ke tiap channel terpilih, dan cleanup draft setelah sukses.
 *
 * Menerima semua data yang dibutuhkan lewat parameter (bukan lewat hook lain
 * secara langsung) -> gampang di-unit-test: tinggal panggil dengan data
 * palsu, tidak perlu mount seluruh usePostModal.
 */
export function usePostSubmit({
  userId,
  selectedIds,
  posts,
  confirmedSlots,
  channelById,
  getDraftIdMap,
  onSuccess,
}: UsePostSubmitParams): UsePostSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!userId || selectedIds.length === 0) return;

    const emptyChannels = selectedIds.filter((id) => !posts[id]?.text?.trim());
    if (emptyChannels.length > 0) {
      toast.error("Ada konten yang masih kosong.");
      return;
    }

    const missingSlots = selectedIds.filter((id) => !confirmedSlots[id]);
    if (missingSlots.length > 0) {
      toast.error("Semua channel harus memiliki jadwal.");
      return;
    }

    setIsSubmitting(true);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((channelId) => {
          const slot = confirmedSlots[channelId];
          return schedulePost({
            connectionId: channelId,
            platform: channelById.get(channelId)?.platform ?? "",
            content: posts[channelId].text,
            mediaUrls: posts[channelId].cloudinaryUrl
              ? [posts[channelId].cloudinaryUrl!]
              : [],
            scheduledAtLocal: slot.scheduledAtLocal,
          });
        })
      );

      const succeeded = results.filter(
        (r) => r.status === "fulfilled" && r.value.success
      ).length;
      const failed = results.length - succeeded;

      if (succeeded > 0) {
        const idMap = getDraftIdMap();
        const draftIds = Object.values(idMap);
        if (draftIds.length > 0) {
          await Promise.allSettled(
            draftIds.map((id) =>
              deleteDraftAction(id).catch((error) =>
                logger.warn(`Cleanup draft ${id} gagal, skip`, {
                  draftId: id,
                  error,
                })
              )
            )
          );
        }

        toast.success(`${succeeded} post berhasil dijadwalkan!`);
        onSuccess();
      }

      if (failed > 0) {
        toast.error(`${failed} post gagal dijadwalkan. Coba lagi.`);
      }
    } catch (error) {
      logger.error("Gagal submit schedule post", error, {
        userId,
        selectedIds,
      });
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    userId,
    selectedIds,
    posts,
    confirmedSlots,
    channelById,
    getDraftIdMap,
    onSuccess,
  ]);

  return { isSubmitting, handleSubmit };
}
