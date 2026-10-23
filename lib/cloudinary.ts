import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
};

export async function uploadMedia(
  file: Buffer | string,
  options?: {
    folder?: string;
    publicId?: string;
    overwrite?: boolean;
    resourceType?: "image" | "video" | "auto";
  }
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file as string, {
    folder: options?.folder ?? "social-scheduler",
    resource_type: options?.resourceType ?? "auto",
    public_id: options?.publicId,
    overwrite: options?.overwrite,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type as "image" | "video",
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteMedia(publicId: string): Promise<void> {
  await Promise.allSettled([
    cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    }),
    cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    }),
  ]);
}
