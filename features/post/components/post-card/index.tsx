// features/post/post-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Clock,
  Edit3,
  Trash2,
  MoreHorizontal,
  Zap,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  AlertCircle,
  Eye,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import {
  formatCount,
  formatDate,
  PLATFORM_CONFIG,
  Post,
  PostCardProps,
} from "@/features/post/types";
import { updatePostAction } from "@/features/scheduling/actions/update-post";
import StatusBadge from "./status-badge";
import { deletePost } from "@/features/post/actions/delete-post";
import dynamic from "next/dynamic";

const EditPostModal = dynamic(() => import("./edit-post-modal"), {
  ssr: false,
});
const PreviewModal = dynamic(() => import("./preview-modal"), { ssr: false });
const ScheduleModal = dynamic(() => import("./schedule-modal"), { ssr: false });
const DeleteModal = dynamic(() => import("./delete-modal"), { ssr: false });

// ─── Main PostCard ────────────────────────────────────────────────────────────

export default function PostCard({ post: initialPost }: PostCardProps) {
  const post = initialPost;

  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const platform = PLATFORM_CONFIG[post.platform] ?? PLATFORM_CONFIG.linkedin;
  const isLong = post.content.length > 160;
  const displayContent =
    isLong && !expanded ? post.content.slice(0, 160) + "..." : post.content;
  const canEdit = post.status === "queued" || post.status === "draft";

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePost(post.id);

    if (result.success) {
      toast.success(
        post.status === "published"
          ? post.platform === "instagram"
            ? "Dihapus dari catatan. Hapus manual di Instagram."
            : "Post berhasil dihapus dari platform."
          : "Jadwal post berhasil dibatalkan."
      );
      setShowDelete(false);
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  };

  // ── Reschedule (hanya queued, dari ScheduleModal terpisah) ────────────────
  const handleReschedule = async (updatedPost: Post) => {
    if (!updatedPost.scheduledAt) return;

    const result = await updatePostAction({
      postId: post.id,
      userId: post.userId,
      content: post.content,
      scheduledAt: updatedPost.scheduledAt,
      mediaUrl: post.mediaUrl ?? null,
      asDraft: false,
    });

    if (result.success) {
      toast.success("Jadwal berhasil diubah.");
    } else {
      toast.error(result.error ?? "Gagal mengubah jadwal.");
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-white text-[11px] font-bold",
                  platform.bg
                )}
              >
                <Image
                  src={platform.iconSrc}
                  alt={platform.label}
                  width={11}
                  height={11}
                  className="object-contain"
                />
                {platform.label}
              </div>
              <StatusBadge status={post.status} />
              {post.isOptimalTime && post.status === "queued" && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EBF5E1] border border-[#C8E6A0] text-[#3A6B14] text-[11px] font-bold">
                  <Zap size={10} strokeWidth={2.5} /> Best Time
                </div>
              )}
              {post.status === "failed" && post.errorLog && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-500 text-[11px]">
                  <AlertCircle size={10} /> {post.errorLog.slice(0, 40)}...
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <MoreHorizontal size={15} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 p-1.5 rounded-xl shadow-xl border-gray-100"
              >
                <DropdownMenuItem
                  onClick={() => setShowPreview(true)}
                  className="cursor-pointer py-2 px-3 rounded-lg text-sm gap-2"
                >
                  <Eye size={14} /> Preview
                </DropdownMenuItem>

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => setShowEdit(true)}
                    className="cursor-pointer py-2 px-3 rounded-lg text-sm gap-2"
                  >
                    <Edit3 size={14} /> Edit Konten
                  </DropdownMenuItem>
                )}

                {post.status === "queued" && (
                  <DropdownMenuItem
                    onClick={() => setShowSchedule(true)}
                    className="cursor-pointer py-2 px-3 rounded-lg text-sm gap-2 text-blue-600"
                  >
                    <CalendarDays size={14} /> Ubah Jadwal
                  </DropdownMenuItem>
                )}

                {post.status === "published" && (
                  <DropdownMenuItem
                    disabled
                    className="py-2 px-3 rounded-lg text-sm gap-2 text-gray-300 cursor-not-allowed"
                  >
                    <Edit3 size={14} /> Edit tidak tersedia
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                <DropdownMenuItem
                  onClick={() => setShowDelete(true)}
                  className="cursor-pointer py-2 px-3 rounded-lg text-sm gap-2 text-red-500 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 size={14} />
                  {post.status === "published"
                    ? `Hapus dari ${post.platform}`
                    : "Hapus"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="flex gap-3">
            {post.mediaUrl && (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                {/\.(mp4|mov|avi)(\?|$)/i.test(post.mediaUrl) ? (
                  <video
                    src={post.mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={post.mediaUrl}
                    alt="Post media"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            )}
            <p className="flex-1 text-sm text-gray-700 leading-relaxed">
              {displayContent}
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="ml-1 text-[#4F7A28] font-semibold hover:underline text-xs"
                >
                  {expanded ? "Lebih sedikit" : "Selengkapnya"}
                </button>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock size={12} strokeWidth={2} />
              <span className="text-xs font-medium">
                {post.status === "published" && post.publishedAt
                  ? `Dikirim ${formatDate(post.publishedAt)}`
                  : post.scheduledAt
                  ? `Dijadwalkan ${formatDate(post.scheduledAt)}`
                  : "Belum dijadwalkan"}
              </span>
            </div>

            {post.status === "published" && post.stats && (
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-1 text-gray-400"
                  title="likes"
                >
                  <ThumbsUp size={12} strokeWidth={1.8} />
                  <span className="text-xs font-semibold text-gray-600">
                    {formatCount(post.stats.likes)}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 text-gray-400"
                  title="comments"
                >
                  <MessageCircle size={12} strokeWidth={1.8} />
                  <span className="text-xs font-semibold text-gray-600">
                    {formatCount(post.stats.comments)}
                  </span>
                </div>
                {post.platform !== "instagram" && (
                  <div
                    className="flex items-center gap-1 text-gray-400"
                    title="reposts"
                  >
                    <Repeat2 size={12} strokeWidth={1.8} />
                    <span className="text-xs font-semibold text-gray-600">
                      {formatCount(post.stats.reposts)}
                    </span>
                  </div>
                )}
                {post.platform === "instagram" ? (
                  <div
                    className="flex items-center gap-1 text-gray-400"
                    title="reach"
                  >
                    <Eye size={12} strokeWidth={1.8} />
                    <span className="text-xs font-semibold text-gray-600">
                      {formatCount(post.stats.impressions)}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 text-gray-300"
                    title="views not available"
                  >
                    <Eye size={12} strokeWidth={1.8} />
                    <span className="text-xs font-semibold text-gray-300">
                      —
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <EditPostModal
          post={post}
          open={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={() => setShowEdit(false)}
        />
      )}
      {showPreview && (
        <PreviewModal
          post={post}
          open={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showSchedule && (
        <ScheduleModal
          post={post}
          open={showSchedule}
          onClose={() => setShowSchedule(false)}
          onSchedule={handleReschedule}
        />
      )}

      {showDelete && (
        <DeleteModal
          open={showDelete}
          post={post}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
