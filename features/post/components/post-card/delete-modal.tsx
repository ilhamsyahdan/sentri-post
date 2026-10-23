import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Post } from "@/features/post/types";

export default function DeleteModal({
  open,
  post,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  post: Post;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  if (!open) return null;

  const isPublished = post.status === "published";
  const isInstagram = post.platform === "instagram";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl">
        <div className="p-5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            {isPublished
              ? `Hapus post dari ${post.platform}?`
              : "Batalkan jadwal post?"}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {isPublished && isInstagram
              ? "Post ini akan dihapus dari catatan kamu. Catatan: Instagram tidak mengizinkan hapus post via API — kamu perlu hapus manual dari aplikasi Instagram."
              : isPublished
              ? "Post ini akan dihapus permanen dari platform dan tidak bisa dikembalikan."
              : "Post ini akan dihapus dari antrian dan tidak akan dikirim ke platform."}
          </p>
          {isPublished && isInstagram && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
                <AlertCircle size={11} />
                Perlu hapus manual di aplikasi Instagram
              </p>
            </div>
          )}
          <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">{post.content}</p>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={12} />{" "}
                {isPublished ? "Hapus dari catatan" : "Batalkan"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
