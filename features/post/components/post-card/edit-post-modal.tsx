// features/post/components/edit-post-modal.tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Send,
  X,
  Loader2,
  AlertTriangle,
  FileText,
  Clock,
  Upload,
  Trash2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Post } from "@/features/post/types";
import Modal from "@/components/ui/modal";
import { updatePostAction } from "@/features/scheduling/actions/update-post";
import { useMediaUpload } from "@/features/post/hooks/use-media-upload";
import { deletePostMedia } from "@/features/post/actions/upload-media";
import { extractPublicId } from "../../utils/extract-public-id";
import Image from "next/image";

function toDatetimeLocal(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function getMinDatetime(): string {
  return new Date(Date.now() + 60_000).toISOString().slice(0, 16);
}

interface EditPostModalProps {
  post: Post;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditPostModal({
  post,
  open,
  onClose,
  onSave,
}: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [scheduledAt, setScheduledAt] = useState(
    toDatetimeLocal(post.scheduledAt)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<"draft" | "schedule" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Media Upload ──────────────────────────────────────────────────────────
  const media = useMediaUpload({
    initialUrl: post.mediaUrl ?? null,
    initialPublicId: post.mediaUrl ? extractPublicId(post.mediaUrl) : null,
  });

  // Track apakah media dihapus oleh user (bukan hanya belum ada)
  const [mediaRemoved, setMediaRemoved] = useState(false);

  const handleMediaRemove = useCallback(async () => {
    // Kalau sudah ada di Cloudinary (bukan blob), hapus dari Cloudinary
    if (media.publicId) {
      await deletePostMedia(media.publicId);
    }
    media.remove();
    setMediaRemoved(true);
  }, [media]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (media.publicId) {
        await deletePostMedia(media.publicId);
      }
      setMediaRemoved(false);
      media.upload(file);
      // Reset input supaya file yang sama bisa dipilih ulang
      e.target.value = "";
    },
    [media]
  );

  const isDraft = post.status === "draft";
  const isQueued = post.status === "queued";

  const isScheduledSoon =
    isQueued &&
    !!post.scheduledAt &&
    new Date(post.scheduledAt).getTime() - Date.now() < 5 * 60 * 1000;

  const charLimit = 2200;
  const remaining = charLimit - content.length;
  const isOver = remaining < 0;

  // ── Validasi waktu ────────────────────────────────────────────────────────
  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
  const isScheduleInPast =
    !!scheduledDate && scheduledDate.getTime() < Date.now() + 60_000;

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (asDraft: boolean) => {
    if (!content.trim() || isOver) {
      toast.error("Konten tidak boleh kosong atau melebihi batas karakter.");
      return;
    }

    if (!asDraft) {
      if (!scheduledAt) {
        toast.error("Pilih jadwal posting terlebih dahulu.");
        return;
      }
      if (isScheduleInPast) {
        toast.error("Jadwal tidak boleh di masa lalu.");
        return;
      }
    }

    if (media.isUploading) {
      toast.info("Tunggu hingga upload media selesai.");
      return;
    }

    setIsSaving(true);
    setSaveMode(asDraft ? "draft" : "schedule");

    try {
      const result = await updatePostAction({
        postId: post.id,
        userId: post.userId,
        content,
        scheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : post.scheduledAt ?? new Date().toISOString(),
        // Kalau media dihapus → null, kalau ada upload baru → pakai yang baru,
        // kalau tidak ada perubahan → pakai yang lama
        mediaUrl: mediaRemoved
          ? null
          : media.cloudinaryUrl ?? post.mediaUrl ?? null,
        asDraft,
      });

      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan.");
        return;
      }

      onSave();
      toast.success(
        asDraft
          ? "Tersimpan sebagai draft."
          : isDraft
          ? "Post berhasil dijadwalkan!"
          : "Post berhasil diperbarui."
      );
      onClose();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSaving(false);
      setSaveMode(null);
    }
  };

  // ── Derived media state ───────────────────────────────────────────────────
  const hasMedia = !mediaRemoved && !!media.previewUrl;
  const isVideo =
    media.mediaType === "video" ||
    /\.(mp4|mov|avi)(\?|$)/i.test(media.previewUrl ?? "");

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-xl">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">Edit Post</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                isDraft
                  ? "bg-gray-100 text-gray-500"
                  : "bg-blue-50 text-blue-600"
              )}
            >
              {isDraft ? "Draft" : "Terjadwal"}
            </span>
            {isScheduledSoon && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                <AlertTriangle size={10} />
                Akan dipublish dalam &lt;5 menit
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isSaving}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* ── Textarea ──────────────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Konten
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Tulis konten post kamu..."
            className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-[#4F7A28] focus:bg-white transition-all placeholder:text-gray-400 leading-relaxed"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-gray-400">
              Batas karakter paling ketat (Instagram)
            </span>
            <span
              className={cn(
                "text-[11px] font-bold tabular-nums",
                isOver
                  ? "text-red-500"
                  : remaining < 50
                  ? "text-amber-500"
                  : "text-gray-400"
              )}
            >
              {remaining}
            </span>
          </div>
        </div>

        {/* ── Schedule ──────────────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            {isDraft ? "Jadwal Posting (opsional)" : "Jadwal Posting"}
          </p>
          <div className="relative">
            <CalendarDays
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={getMinDatetime()}
              className={cn(
                "w-full text-sm bg-gray-50 border rounded-xl pl-9 pr-4 py-2.5 outline-none transition-all text-gray-700",
                isScheduleInPast && scheduledAt
                  ? "border-red-300 focus:border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-[#4F7A28] focus:bg-white"
              )}
            />
          </div>
          {isScheduleInPast && scheduledAt && (
            <p className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
              <AlertTriangle size={10} />
              Waktu sudah lewat, pilih waktu yang akan datang.
            </p>
          )}
          {isDraft && !scheduledAt && (
            <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
              <Clock size={10} />
              Kosongkan untuk simpan sebagai draft tanpa jadwal.
            </p>
          )}
        </div>

        {/* ── Media ─────────────────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Media
          </p>

          {/* Ada media — tampilkan preview + opsi ganti/hapus */}
          {hasMedia && (
            <div className="flex items-start gap-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-100">
                {/* Loading overlay */}
                {media.isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 z-10">
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span className="text-[10px] text-white font-bold">
                      {media.uploadProgress}%
                    </span>
                  </div>
                )}
                {isVideo ? (
                  <video
                    src={media.previewUrl ?? ""}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={media.previewUrl ?? ""}
                    alt="media"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500">
                  {isVideo ? "Video" : "Gambar"} terpilih
                </span>
                {/* Ganti media */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={media.isUploading || isSaving}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#4F7A28] hover:underline disabled:opacity-50"
                >
                  <Upload size={12} />
                  Ganti media
                </button>
                {/* Hapus media */}
                <button
                  onClick={handleMediaRemove}
                  disabled={media.isUploading || isSaving}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Hapus media
                </button>
              </div>
            </div>
          )}

          {/* Tidak ada media — tampilkan area upload */}
          {!hasMedia && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-[#4F7A28] hover:text-[#4F7A28] transition-all disabled:opacity-50"
            >
              <Upload size={20} />
              <span className="text-xs font-semibold">
                Upload gambar atau video
              </span>
              <span className="text-[11px]">
                JPG, PNG, GIF, MP4, MOV didukung
              </span>
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="text-sm text-gray-400 hover:text-gray-700 font-medium disabled:opacity-50 transition-colors"
        >
          Batal
        </button>

        <div className="flex gap-2">
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving || media.isUploading}
            className="h-9 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-none text-xs font-bold disabled:opacity-50 gap-1.5"
          >
            {isSaving && saveMode === "draft" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <FileText size={13} />
                Simpan Draft
              </>
            )}
          </Button>

          <Button
            onClick={() => handleSave(false)}
            disabled={
              isSaving || isOver || !content.trim() || media.isUploading
            }
            className="h-9 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white shadow-none text-xs font-bold gap-1.5 disabled:opacity-50 transition-colors"
          >
            {isSaving && saveMode === "schedule" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                <Send size={13} />
                {isQueued ? "Update" : "Jadwalkan"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
