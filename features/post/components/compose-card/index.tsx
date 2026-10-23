import { memo, useRef } from "react";
import Image from "next/image";
import { ImageIcon, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { AccountPostState, Channel, PLATFORM_CONFIG } from "../../types";
import { PLATFORM_CHAR_LIMIT } from "../../constants";

interface ComposeCardProps {
  channel: Channel;
  post: AccountPostState;
  active: boolean;
  syncedChannelsCount?: number; // Prop baru untuk mendeteksi mode sync
  onFocus: () => void;
  onTextChange: (text: string) => void;
  onFileChange: (file: File) => void;
  onRemoveFile: () => void;
}

const ComposeCard = memo(
  ({
    channel,
    post,
    active,
    syncedChannelsCount = 1,
    onFocus,
    onTextChange,
    onFileChange,
    onRemoveFile,
  }: ComposeCardProps) => {
    const platform = PLATFORM_CONFIG[channel.platform];

    const limit = PLATFORM_CHAR_LIMIT[channel.platform];
    const remaining = limit - (post.text?.length ?? 0);

    const isOver = remaining < 0;
    const isNear = remaining < 20 && remaining >= 0;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSynced = syncedChannelsCount > 1;

    return (
      <div
        className={cn(
          "border rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-text",
          active
            ? "border-[#3D6B4F] ring-4 ring-[#3D6B4F]/10"
            : "border-gray-200 hover:border-gray-300"
        )}
        onFocus={onFocus}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg shrink-0",
                platform.bg
              )}
            >
              <Image
                src={platform.iconSrc}
                width={12}
                height={12}
                alt={platform.label}
                className="object-contain"
              />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-gray-600">
              {platform.label}
            </span>

            {/* Jika mode sync aktif, tampilkan info berapa akun disinkronkan */}
            {isSynced ? (
              <span className="text-[10px] bg-emerald-50 text-[#3D6B4F] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                {syncedChannelsCount} akun disinkronkan
              </span>
            ) : (
              <span className="text-[10px] text-gray-400">
                · {channel.name}
              </span>
            )}
          </div>

          <Button
            type="button"
            onClick={onRemoveFile}
            variant="ghost"
            className="h-auto gap-1 p-0 text-[11px] font-semibold text-gray-400 hover:text-red-500"
          >
            <Trash2 size={10} />
            Reset
          </Button>
        </div>

        {/* Textarea */}
        <textarea
          className="min-h-[100px] w-full resize-none text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-300 sm:min-h-[120px]"
          placeholder={
            isSynced
              ? `Tulis konten untuk semua akun ${platform.label}...`
              : `Tulis konten untuk ${channel.name}...`
          }
          value={post.text ?? ""}
          onChange={(e) => onTextChange(e.target.value)}
        />

        {/* Character Counter */}
        <div className="mt-1 mb-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            Limit: {limit.toLocaleString()}
          </span>

          <span
            className={cn(
              "text-[11px] font-bold tabular-nums",
              isOver
                ? "text-red-500"
                : isNear
                ? "text-amber-500"
                : "text-gray-300"
            )}
          >
            {remaining}
          </span>
        </div>

        {/* Upload Progress */}
        {post.isUploading && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Mengupload...</span>
              <span className="text-[10px] font-semibold tabular-nums text-[#3D6B4F]">
                {post.uploadProgress ?? 0}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#3D6B4F] transition-all duration-200"
                style={{ width: `${post.uploadProgress ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Media */}
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Media
          </p>

          {post.previewUrl ? (
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {/\.(mp4|mov|avi)(\?|$)/i.test(post.previewUrl) ? (
                  <video
                    src={post.previewUrl}
                    className="h-full w-full object-cover"
                    muted
                    autoPlay
                    loop
                  />
                ) : (
                  <Image
                    src={post.previewUrl}
                    fill
                    alt="Preview media"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-gray-600">
                  Gambar terpilih
                </span>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#3D6B4F] hover:text-[#27500A]"
                >
                  <ImageIcon size={13} />
                  Ganti media
                </button>

                <button
                  type="button"
                  onClick={onRemoveFile}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  <Trash2 size={13} />
                  Hapus media
                </button>
              </div>

              <input
                id={`file-${channel.id}`}
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileChange(file);
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 text-xs font-semibold text-gray-400 transition-all hover:border-[#3D6B4F] hover:text-[#3D6B4F]"
            >
              <ImageIcon size={13} />
              Tambah Foto / Video
              <input
                id={`file-${channel.id}`}
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileChange(file);
                }}
              />
            </button>
          )}
        </div>
      </div>
    );
  }
);

ComposeCard.displayName = "ComposeCard";
export default ComposeCard;
