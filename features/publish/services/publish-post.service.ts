import { NonRetriableError } from "inngest";
import { classifyPublishError } from "@/features/publish/utils/classify-error";
import {
  fetchTargetWithRelations,
  markTargetSuccess,
} from "../repositories/publish-worker.repository";
import { publishToLinkedIn } from "@/features/publish/publishers/linkedin.publisher";
import { publishToInstagram } from "@/features/publish/publishers/instagram.publisher";
import { syncPostStatus } from "./sync-post-status.service";

// Hanya memanggil platform. Satu-satunya bagian yang boleh di-retry.
export async function publishToPlatform(targetId: string) {
  const target = await fetchTargetWithRelations(targetId);
  if (!target) throw new NonRetriableError("Target tidak ditemukan");

  const conn = target.connections;

  try {
    if (
      conn.token_expires_at &&
      new Date(conn.token_expires_at) <= new Date()
    ) {
      throw new Error(
        `${conn.platform} connection expired, please reconnect your account.`
      );
    }

    if (conn.platform === "linkedin") {
      return await publishToLinkedIn({
        accessToken: conn.access_token,
        authorId: conn.platform_user_id,
        content: target.posts.content,
        mediaUrls: target.posts.media_urls,
      });
    }

    if (conn.platform === "instagram") {
      return await publishToInstagram({
        accessToken: conn.access_token,
        igUserId: conn.platform_user_id,
        content: target.posts.content,
        mediaUrls: target.posts.media_urls,
      });
    }

    throw new Error("Platform tidak didukung");
  } catch (err) {
    const classified = classifyPublishError(err);
    if (classified.status === "failed") throw err; // sementara: Inngest yang retry
    throw new NonRetriableError(classified.message); // permanen: berhenti
  }
}

// Mencatat hasil. Dipisah supaya gagal di sini tidak mengulang publish.
export async function finalizePublish(
  targetId: string,
  postId: string,
  platformPostId: string
) {
  await markTargetSuccess(targetId, platformPostId);
  await syncPostStatus(postId);
}
