"use server";

import { deleteMedia } from "@/lib/cloudinary";

// const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
// const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
// const ALLOWED_IMAGE_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/gif",
//   "image/webp",
// ];
// const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mov", "video/avi"];

export type UploadMediaResult =
  | { success: true; url: string; publicId: string; type: "video" | "image" }
  | { success: false; error: string };

// export async function uploadPostMedia(
//   formData: FormData
// ): Promise<UploadMediaResult> {
//   try {
//     const file = formData.get("file") as File;
//     if (!file) return { success: false, error: "File Tidak Di temukan" };

//     const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
//     const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

//     if (!isImage && !isVideo) {
//       return {
//         success: false,
//         error: "Format Tidak di dukung, gunakan JPG, PNG, GIF, MP4, ATAU MOV",
//       };
//     }

//     const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

//     if (file.size > maxSize) {
//       return {
//         success: false,
//         error: `Ukuran File Terlalu Besar. Maksimal ${
//           isVideo ? "100MB" : "10MB"
//         }`,
//       };
//     }

//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

//     const result = await uploadMedia(base64, {
//       folder: "social-scheduler/posts",
//       resourceType: "auto",
//     });

//     return {
//       success: true,
//       url: result.url,
//       publicId: result.publicId,
//       type: result.resourceType,
//     };
//   } catch (error) {
//     console.error("[uploadPostMedia]: ", error);
//     return { success: false, error: "Gagal mengupload file" };
//   }
// }

export async function deletePostMedia(
  publicId: string
): Promise<{ success: boolean }> {
  try {
    await deleteMedia(publicId);
    return { success: true };
  } catch {
    return { success: false };
  }
}
