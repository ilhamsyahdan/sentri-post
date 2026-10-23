// features/calendar/hooks/use-edit-post.ts
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { updatePostAction } from "../../scheduling/actions/update-post";
import { Post } from "../types";
import {
  checkPostEditableService,
  UpdatePostPayload,
} from "@/features/scheduling/services/update-post.service";

interface UseEditPostOptions {
  onSuccess: (updated: Post) => void;
}

export function useEditPost({ onSuccess }: UseEditPostOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Dipanggil saat user klik tombol Edit di calendar/list
  // → cek dulu apakah bisa diedit sebelum buka modal
  const checkEditable = useCallback(
    async (postId: string, userId: string): Promise<boolean> => {
      setIsChecking(true);
      try {
        const { canEdit, reason } = await checkPostEditableService(
          postId,
          userId
        );
        if (!canEdit) {
          toast.error(reason ?? "Post tidak bisa diedit.");
          return false;
        }
        return true;
      } catch {
        toast.error("Gagal memeriksa status post.");
        return false;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  // Dipanggil saat user klik Save di dalam modal
  const save = useCallback(
    async (
      post: Post,
      payload: Omit<UpdatePostPayload, "postId" | "userId">,
      asDraft = false
    ) => {
      setIsSaving(true);
      try {
        const result = await updatePostAction({
          postId: post.id,
          userId: post.userId,
          ...payload,
          asDraft,
        });

        if (!result.success) {
          toast.error(result.error ?? "Gagal menyimpan.");
          return false;
        }

        const updatedPost: Post = {
          ...post,
          content: payload.content,
          scheduledAt: payload.scheduledAt,
          status: asDraft
            ? "draft"
            : post.status === "draft"
            ? "queued"
            : post.status,
        };

        onSuccess(updatedPost);
        toast.success(
          asDraft ? "Disimpan sebagai draft." : "Post berhasil diupdate."
        );
        return true;
      } catch {
        toast.error("Terjadi kesalahan. Coba lagi.");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [onSuccess]
  );

  return {
    isSaving,
    isChecking,
    checkEditable,
    save,
  };
}
