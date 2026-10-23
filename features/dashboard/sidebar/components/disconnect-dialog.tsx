import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Unplug } from "lucide-react";
import { DisconnectTarget } from "../types";

interface DisconnectDialogProps {
  target: DisconnectTarget | null;
  isDisconnecting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DisconnectDialog = ({
  target,
  isDisconnecting,
  onConfirm,
  onClose,
}: DisconnectDialogProps) => (
  <AlertDialog open={!!target} onOpenChange={(open) => !open && onClose()}>
    <AlertDialogContent className="rounded-2xl max-w-sm">
      <AlertDialogHeader>
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-2">
          <Unplug size={18} className="text-red-500" />
        </div>
        <AlertDialogTitle className="text-base font-bold text-gray-900">
          Putuskan Koneksi?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm text-gray-500">
          Channel{" "}
          <span className="font-semibold text-gray-700">{target?.name}</span>{" "}
          <span className="text-gray-400">({target?.handle})</span> akan
          dilepas. Post yang sudah terjadwal ke channel ini tidak akan terkirim.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2 sm:gap-2">
        <AlertDialogCancel
          className="rounded-xl border-gray-200 text-gray-600 font-semibold text-sm"
          disabled={isDisconnecting}
        >
          Batal
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={isDisconnecting}
          className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-none"
        >
          {isDisconnecting ? "Memutuskan..." : "Ya, Putuskan"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
