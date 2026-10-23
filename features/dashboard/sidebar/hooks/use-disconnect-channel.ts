import { useState, useTransition } from "react";
import { disconnectChannel } from "../../../channel/actions/disconnect-channel";
import { DisconnectTarget } from "../types";
import { toast } from "sonner";

export function useDisconnectChannel() {
  const [disconnectTarget, setDisconnectTarget] =
    useState<DisconnectTarget | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDisconnectConfirm = () => {
    if (!disconnectTarget) return;
    const channelName = disconnectTarget.name;
    startTransition(async () => {
      try {
        // 1. Hapus di DB & picu revalidatePath di server
        await disconnectChannel(disconnectTarget.id);

        toast.success(`Koneksi akun ${channelName} berhasil diputuskan`);
        // 2. Tutup modal
        setDisconnectTarget(null);
      } catch (err) {
        console.error("Gagal disconnect:", err);
      }
    });
  };

  return {
    disconnectTarget,
    isDisconnecting: isPending, // Menggunakan state manual
    setDisconnectTarget,
    handleDisconnectConfirm,
    clearDisconnectTarget: () => setDisconnectTarget(null),
  };
}
