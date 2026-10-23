// features/post/hooks/use-post-modal.ts
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useReducer,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { DraftRecord, Step } from "../types";
import { deletePostMedia } from "../actions/upload-media";
import { useDraft } from "./use-draft";
import { buildDraftChannels } from "../utils/build-draft-channels";
import { uploadToCloudinary } from "../utils/upload-to-cloudinary";
import { logger } from "@/lib/logger";
import { postsReducer, PostsState } from "../reducers/posts-reducer";
import { usePostChannels } from "./use-post-channels";
import { usePostScheduling } from "./use-post-scheduling";
import { usePostSubmit } from "./use-post-submit";

// ── Step navigation ────────────────────────────────────────────────────────
const STEP_ORDER: Step[] = ["compose", "schedule", "review"];

export function usePostModal(
  isOpen: boolean,
  onClose: (open: boolean) => void
) {
  const { userId } = useAuth();

  // ── UI State ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("compose");
  const [rightPanel, setRightPanel] = useState<"preview" | "ai">("preview");
  const [showMobileRight, setShowMobileRight] = useState(false);

  // ── Channels (dipisah ke hooknya sendiri) ──────────────────────────────────
  const { channels, channelById, isLoadingChannels } = usePostChannels(isOpen);

  // ── Post Composition State ─────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [posts, dispatchPosts] = useReducer(postsReducer, {} as PostsState);
  const [syncPlatforms, setSyncPlatforms] = useState<Record<string, boolean>>(
    {}
  );

  const abortControllersRef = useRef<Record<string, AbortController>>({});

  // ── Scheduling (dipisah ke hooknya sendiri) ────────────────────────────────
  const {
    confirmedSlots,
    confirmedCount: countConfirmed,
    setSlotForChannel,
    removeSlotForChannel,
    resetSlots,
  } = usePostScheduling(channelById, syncPlatforms, selectedIds);

  // ── Draft ──────────────────────────────────────────────────────────────────
  const {
    isSavingDraft,
    isLoadingDrafts,
    isDirty,
    drafts,
    handleSaveDraft,
    handleDeleteDraft,
    loadDrafts,
    markDirty,
    resetDraft,
    getIdMap,
    setIdMap,
  } = useDraft({});

  useEffect(() => {
    if (isOpen && userId) loadDrafts();
  }, [isOpen, userId, loadDrafts]);

  // ── Submit (dipisah ke hooknya sendiri) ────────────────────────────────────
  const { isSubmitting, handleSubmit } = usePostSubmit({
    userId,
    selectedIds,
    posts,
    confirmedSlots,
    channelById,
    getDraftIdMap: getIdMap,
    onSuccess: () => onClose(false),
  });

  // ── Build payload draft dari state saat ini ────────────────────────────────
  const saveDraft = useCallback(() => {
    const stillUploading = selectedIds.some((id) => posts[id]?.isUploading);

    if (stillUploading) {
      toast.info("Tunggu hingga upload selesai.");
      return;
    }

    handleSaveDraft(buildDraftChannels(selectedIds, posts, channels));
  }, [selectedIds, posts, channels, handleSaveDraft]);

  // ── Resume draft ───────────────────────────────────────────────────────────
  const resumeDraft = useCallback(
    (draft: DraftRecord) => {
      if (isLoadingChannels) {
        toast.info("Tunggu channels selesai dimuat.");
        return;
      }

      setIdMap({ ...getIdMap(), [draft.connectionId]: draft.id });
      setSelectedIds((prev) =>
        prev.includes(draft.connectionId) ? prev : [...prev, draft.connectionId]
      );
      setActivePreviewId(draft.connectionId);

      dispatchPosts({
        type: "RESUME_DRAFT",
        id: draft.connectionId,
        post: {
          text: draft.content,
          file: null,
          previewUrl: draft.mediaUrls[0] ?? null,
          cloudinaryUrl: draft.mediaUrls[0] ?? null,
          publicId: draft.publicIds[0] ?? null,
          isUploading: false,
        },
      });
    },
    [isLoadingChannels, getIdMap, setIdMap]
  );

  // ── Reset saat modal tutup ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds([]);
      setActivePreviewId(null);
      dispatchPosts({ type: "RESET" });
      setStep("compose");
      resetSlots();
      setRightPanel("preview");
      setShowMobileRight(false);
      resetDraft();
    }
  }, [isOpen, resetDraft, resetSlots]);

  // ── Cleanup object URLs on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      Object.values(posts).forEach((p) => {
        if (p.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Channel selection ──────────────────────────────────────────────────────
  const toggleChannel = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          const next = prev.filter((i) => i !== id);
          setActivePreviewId(next.at(-1) ?? null);
          removeSlotForChannel(id);
          return next;
        }
        dispatchPosts({ type: "INIT_POST", id });
        setActivePreviewId(id);
        return [...prev, id];
      });
    },
    [removeSlotForChannel]
  );

  // Toggle Sync
  const toggleSyncPlatform = useCallback(
    (platform: string) => {
      setSyncPlatforms((prev) => {
        const turningOn = !prev[platform];
        const next = { ...prev, [platform]: turningOn };

        if (turningOn) {
          const idsForPlatform = selectedIds.filter(
            (id) => channelById.get(id)?.platform === platform
          );

          if (idsForPlatform.length > 1) {
            dispatchPosts({
              type: "APPLY_SYNC_FROM_MASTER",
              masterId: idsForPlatform[0],
              targetIds: idsForPlatform,
            });
            markDirty();
          }
        }
        return next;
      });
    },
    [selectedIds, channelById, markDirty]
  );

  // ── Text & file updates ────────────────────────────────────────────────────
  const updateText = useCallback(
    (id: string, text: string) => {
      const platform = channelById.get(id)?.platform;

      if (platform && syncPlatforms[platform]) {
        const idsForPlatform = selectedIds.filter(
          (sid) => channelById.get(sid)?.platform === platform
        );
        dispatchPosts({ type: "SET_TEXT_SYNCED", ids: idsForPlatform, text });
      } else {
        dispatchPosts({ type: "SET_TEXT", id, text });
      }
      markDirty();
    },
    [channelById, selectedIds, syncPlatforms, markDirty]
  );

  const updateFile = useCallback(
    async (id: string, file: File) => {
      abortControllersRef.current[id]?.abort();
      const controller = new AbortController();
      abortControllersRef.current[id] = controller;

      const localUrl = URL.createObjectURL(file);
      dispatchPosts({ type: "START_UPLOAD", id, previewUrl: localUrl, file });

      let sigData: {
        timestamp: number;
        signature: string;
        folder: string;
        apiKey: string;
        cloudName: string;
      };

      try {
        const sigRes = await fetch("/api/media-signature");
        if (!sigRes.ok) throw new Error("Gagal mendapatkan signature");
        sigData = await sigRes.json();
      } catch (error) {
        logger.error("Gagal mendapatkan signature upload", error, {
          channelId: id,
          filename: file.name,
        });
        toast.error("Gagal memulai upload.");
        URL.revokeObjectURL(localUrl);
        dispatchPosts({ type: "UPLOAD_FAILURE", id });
        return;
      }

      const result = await uploadToCloudinary(
        file,
        sigData,
        (pct) =>
          dispatchPosts({ type: "SET_UPLOAD_PROGRESS", id, progress: pct }),
        controller.signal
      );

      if (controller.signal.aborted) return;

      if (result.success) {
        URL.revokeObjectURL(localUrl);
        const platform = channelById.get(id)?.platform;
        const shouldSync = platform && syncPlatforms[platform];

        const patch = {
          isUploading: false,
          uploadProgress: 100,
          previewUrl: result.url,
          cloudinaryUrl: result.url,
          publicId: result.publicId,
          type: result.type,
        };

        if (shouldSync) {
          const syncedIds = selectedIds.filter(
            (sid) => channelById.get(sid)?.platform === platform
          );
          dispatchPosts({
            type: "UPLOAD_SUCCESS_SYNCED",
            sourceId: id,
            syncedIds,
            patch,
          });
        } else {
          dispatchPosts({ type: "UPLOAD_SUCCESS", id, patch });
        }
        markDirty();
      } else {
        toast.error(result.error);
        logger.error("Upload ke Cloudinary gagal", new Error(result.error), {
          channelId: id,
          fileName: file.name,
        });
        URL.revokeObjectURL(localUrl);
        dispatchPosts({ type: "UPLOAD_FAILURE", id });
      }
    },
    [channelById, selectedIds, syncPlatforms, markDirty]
  );

  const removeFile = useCallback(
    async (id: string) => {
      abortControllersRef.current[id]?.abort();
      delete abortControllersRef.current[id];

      const post = posts[id];
      if (post?.publicId) await deletePostMedia(post.publicId);
      if (post?.previewUrl?.startsWith("blob:"))
        URL.revokeObjectURL(post.previewUrl);

      dispatchPosts({ type: "REMOVE_FILE", id });
      markDirty();
    },
    [posts, markDirty]
  );

  // ── AI text helpers ────────────────────────────────────────────────────────
  const insertText = useCallback(
    (text: string) => {
      if (!activePreviewId) return;
      const cur = posts[activePreviewId]?.text ?? "";
      dispatchPosts({
        type: "SET_TEXT",
        id: activePreviewId,
        text: cur + (cur ? "\n\n" : "") + text,
      });
      markDirty();
    },
    [activePreviewId, posts, markDirty]
  );

  const replaceText = useCallback(
    (text: string) => {
      if (!activePreviewId) return;
      dispatchPosts({ type: "SET_TEXT", id: activePreviewId, text });
      markDirty();
    },
    [activePreviewId, markDirty]
  );

  const nextStep = useCallback(
    () =>
      setStep((s) => {
        const idx = STEP_ORDER.indexOf(s);
        return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : s;
      }),
    []
  );

  const prevStep = useCallback(
    () =>
      setStep((s) => {
        const idx = STEP_ORDER.indexOf(s);
        return idx > 0 ? STEP_ORDER[idx - 1] : s;
      }),
    []
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const platformSyncGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    selectedIds.forEach((id) => {
      const platform = channelById.get(id)?.platform;
      if (!platform) return;
      groups[platform] = [...(groups[platform] ?? []), id];
    });
    return Object.entries(groups)
      .filter(([, ids]) => ids.length > 1)
      .map(([platform, ids]) => ({ platform, ids }));
  }, [selectedIds, channelById]);

  const activeChannel = useMemo(
    () => (activePreviewId ? channelById.get(activePreviewId) ?? null : null),
    [activePreviewId, channelById]
  );

  const activePost = useMemo(
    () => (activePreviewId ? posts[activePreviewId] ?? null : null),
    [activePreviewId, posts]
  );

  const confirmedCount = countConfirmed(selectedIds);

  const canProceed =
    step === "schedule"
      ? selectedIds.length > 0 &&
        selectedIds.every((id) => !!confirmedSlots[id])
      : selectedIds.length > 0;

  const canSubmit =
    selectedIds.length > 0 &&
    selectedIds.every((id) => !!confirmedSlots[id]) &&
    !isSubmitting;

  return {
    step,
    rightPanel,
    showMobileRight,
    channels,
    isLoadingChannels,
    isSubmitting,
    selectedIds,
    activePreviewId,
    posts,
    confirmedSlots,
    confirmedCount,
    activeChannel,
    activePost,
    canProceed,
    canSubmit,
    isSavingDraft,
    isLoadingDrafts,
    isDirty,
    drafts,
    saveDraft,
    resumeDraft,
    handleDeleteDraft,
    setRightPanel,
    setShowMobileRight,
    setActivePreviewId,
    setSlotForChannel,
    toggleChannel,
    updateText,
    updateFile,
    removeFile,
    insertText,
    replaceText,
    nextStep,
    prevStep,
    handleSubmit,
    syncPlatforms,
    toggleSyncPlatform,
    platformSyncGroups,
  };
}
