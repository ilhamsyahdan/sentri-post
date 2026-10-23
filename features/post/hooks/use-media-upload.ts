// features/post/hooks/use-media-upload.ts
"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export type MediaType = "image" | "video" | "raw";

export type UploadState = {
  previewUrl: string | null;
  cloudinaryUrl: string | null;
  publicId: string | null;
  mediaType: MediaType | null;
  isUploading: boolean;
  uploadProgress: number;
};

const INITIAL_STATE: UploadState = {
  previewUrl: null,
  cloudinaryUrl: null,
  publicId: null,
  mediaType: null,
  isUploading: false,
  uploadProgress: 0,
};

type UseMediaUploadOptions = {
  // URL media awal (kalau post sudah punya media sebelumnya)
  initialUrl?: string | null;
  initialPublicId?: string | null;
};

export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const [state, setState] = useState<UploadState>({
    ...INITIAL_STATE,
    previewUrl: options.initialUrl ?? null,
    cloudinaryUrl: options.initialUrl ?? null,
    publicId: options.initialPublicId ?? null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // ── Upload ────────────────────────────────────────────────────────────────
  const upload = useCallback(async (file: File) => {
    // Batalkan upload sebelumnya kalau masih jalan
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Validasi tipe file — hanya image dan video
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Hanya file gambar atau video yang diizinkan.");
      return;
    }

    // Preview lokal dulu supaya UI tidak terasa lambat
    const localUrl = URL.createObjectURL(file);
    setState({
      previewUrl: localUrl,
      cloudinaryUrl: null,
      publicId: null,
      mediaType: null,
      isUploading: true,
      uploadProgress: 0,
    });

    // ── STEP 1: Minta signature dari server ──────────────────────────────────
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
    } catch {
      toast.error("Gagal memulai upload.");
      URL.revokeObjectURL(localUrl);
      setState(INITIAL_STATE);
      return;
    }

    // ── STEP 2: Upload langsung ke Cloudinary via XHR ────────────────────────
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigData.apiKey);
    formData.append("timestamp", String(sigData.timestamp));
    formData.append("signature", sigData.signature);
    formData.append("folder", sigData.folder);
    formData.append("resource_type", "auto"); // auto detect image/video

    type UploadResult =
      | { success: true; url: string; publicId: string; type: MediaType }
      | { success: false; error: string };

    const result = await new Promise<UploadResult>((resolve) => {
      const xhr = new XMLHttpRequest();

      // Progress
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const pct = Math.round((e.loaded / e.total) * 100);
        setState((prev) => ({ ...prev, uploadProgress: pct }));
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status === 200) {
            resolve({
              success: true,
              url: data.secure_url,
              publicId: data.public_id,
              type: data.resource_type as MediaType,
            });
          } else {
            resolve({
              success: false,
              error: data.error?.message ?? "Upload gagal",
            });
          }
        } catch {
          resolve({ success: false, error: "Response tidak valid" });
        }
      };

      xhr.onerror = () => resolve({ success: false, error: "Network error" });
      controller.signal.addEventListener("abort", () => xhr.abort());

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`
      );
      xhr.send(formData);
    });

    // ── STEP 3: Update state ─────────────────────────────────────────────────
    if (controller.signal.aborted) return;

    if (result.success) {
      URL.revokeObjectURL(localUrl);
      setState({
        previewUrl: result.url,
        cloudinaryUrl: result.url,
        publicId: result.publicId,
        mediaType: result.type,
        isUploading: false,
        uploadProgress: 100,
      });
    } else {
      toast.error(result.error);
      URL.revokeObjectURL(localUrl);
      setState(INITIAL_STATE);
    }
  }, []);

  // ── Remove ────────────────────────────────────────────────────────────────
  const remove = useCallback(() => {
    abortControllerRef.current?.abort();
    if (state.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState(INITIAL_STATE);
  }, [state.previewUrl]);

  // ── Cleanup blob URL on unmount ───────────────────────────────────────────
  // Tidak pakai useEffect di sini — caller yang bertanggung jawab
  // memanggil remove() saat komponen unmount kalau diperlukan

  return {
    ...state,
    upload,
    remove,
  };
}
