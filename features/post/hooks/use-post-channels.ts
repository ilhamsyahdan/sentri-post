"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getMyChannels } from "@/features/channel/actions/get-channels";
import { logger } from "@/lib/logger";
import { Channel, PLATFORM_CONFIG, PostPlatform } from "../types";

export interface UsePostChannelsReturn {
  channels: Channel[];
  channelById: Map<string, Channel>;
  isLoadingChannels: boolean;
}

/**
 * Bertanggung jawab HANYA untuk: memuat daftar channel milik user saat modal
 * dibuka, dan menyediakan lookup cepat (channelById) untuk hook lain.
 *
 * Tidak tahu apa-apa soal posts, scheduling, atau submit — supaya perubahan
 * di area itu tidak pernah perlu menyentuh file ini.
 */
export function usePostChannels(isOpen: boolean): UsePostChannelsReturn {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const load = async () => {
      setIsLoadingChannels(true);
      try {
        const data = await getMyChannels();
        if (cancelled) return;
        setChannels(
          data.map((ch) => ({
            id: ch.id,
            name: ch.platform_user_name,
            platform: ch.platform,
            avatar: ch.avatar_url || "/pp-adan.png",
            icon: PLATFORM_CONFIG[ch.platform as PostPlatform].iconSrc,
          }))
        );
      } catch (error) {
        if (!cancelled) {
          logger.error("Gagal memuat channels", error);
          toast.error("Gagal memuat channels.");
        }
      } finally {
        if (!cancelled) setIsLoadingChannels(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const channelById = useMemo(
    () => new Map(channels.map((c) => [c.id, c])),
    [channels]
  );

  return { channels, channelById, isLoadingChannels };
}
