import { UploadMediaResult } from "../actions/upload-media";

type SignatureData = {
  timestamp: number;
  signature: string;
  folder: string;
  apiKey: string;
  cloudName: string;
};

export async function uploadToCloudinary(
  file: File,
  sigData: SignatureData,
  onProgress: (pct: number) => void,
  signal: AbortSignal
): Promise<UploadMediaResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sigData.apiKey);
  formData.append("timestamp", String(sigData.timestamp));
  formData.append("signature", sigData.signature);
  formData.append("folder", sigData.folder);
  formData.append("resource_type", "auto");

  return new Promise<UploadMediaResult>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      onProgress(pct);
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          resolve({
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            type: data.resource_type,
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
    signal.addEventListener("abort", () => xhr.abort());

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`
    );
    xhr.send(formData);
  });
}
