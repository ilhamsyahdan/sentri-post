"use client";

import { useCallback, useState } from "react";
import { Channel, ConfirmedSlot } from "../types";

export interface UsePostSchedulingReturn {
  confirmedSlots: Record<string, ConfirmedSlot>;
  confirmedCount: (selectedIds: string[]) => number;
  setSlotForChannel: (channelId: string, slot: ConfirmedSlot) => void;
  removeSlotForChannel: (channelId: string) => void;
  resetSlots: () => void;
}

/**
 * Bertanggung jawab HANYA untuk: menyimpan jadwal (slot) yang sudah
 * dikonfirmasi per channel, termasuk penerapan slot yang sama ke semua
 * channel dalam 1 platform saat sync menyala.
 *
 * Butuh channelById & syncPlatforms sebagai input (bukan "milik" hook ini),
 * makanya keduanya di-terima sebagai parameter saat dipanggil, bukan di-import
 * dari hook lain -> hook ini tidak punya ketergantungan tersembunyi.
 */
export function usePostScheduling(
  channelById: Map<string, Channel>,
  syncPlatforms: Record<string, boolean>,
  selectedIds: string[]
): UsePostSchedulingReturn {
  const [confirmedSlots, setConfirmedSlots] = useState<
    Record<string, ConfirmedSlot>
  >({});

  const setSlotForChannel = useCallback(
    (channelId: string, slot: ConfirmedSlot) => {
      const channel = channelById.get(channelId);
      if (!channel) return;

      const isSynced = syncPlatforms[channel.platform];

      setConfirmedSlots((prev) => {
        const next = { ...prev };

        if (isSynced) {
          selectedIds.forEach((id) => {
            const target = channelById.get(id);
            if (target && target.platform === channel.platform) {
              next[id] = slot;
            }
          });
        } else {
          next[channelId] = slot;
        }

        return next;
      });
    },
    [channelById, syncPlatforms, selectedIds]
  );

  const removeSlotForChannel = useCallback((channelId: string) => {
    setConfirmedSlots((prev) => {
      const next = { ...prev };
      delete next[channelId];
      return next;
    });
  }, []);

  const resetSlots = useCallback(() => setConfirmedSlots({}), []);

  const confirmedCount = useCallback(
    (ids: string[]) => ids.filter((id) => !!confirmedSlots[id]).length,
    [confirmedSlots]
  );

  return {
    confirmedSlots,
    confirmedCount,
    setSlotForChannel,
    removeSlotForChannel,
    resetSlots,
  };
}
