import { inngest } from "../client";
import {
  publishToPlatform,
  finalizePublish,
} from "@/features/publish/services/publish-post.service";
import { syncPostStatus } from "@/features/publish/services/sync-post-status.service";
import {
  fetchTargetSummary,
  markTargetPublishing,
  markTargetFailed,
} from "@/features/publish/repositories/publish-worker.repository";

// Bentuk minimal `step` yang kita pakai. Dengan ini, test bisa
// menyuntikkan step palsu tanpa butuh engine Inngest.
export type StepLike = {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<T>;
  sleepUntil: (id: string, date: Date) => Promise<void>;
};

type HandlerArgs = {
  event: { data: { targetId: string } };
  step: StepLike;
};

// =========================================================
// LOGIKA UTAMA: fungsi biasa, mudah dipanggil dari test
// =========================================================
export async function publishPostHandler({ event, step }: HandlerArgs) {
  const { targetId } = event.data;

  // 1. Cek awal: target masih ada dan masih antre?
  const target = await step.run("fetch-target", () =>
    fetchTargetSummary(targetId)
  );
  if (!target || target.status !== "queued") return { skipped: true };

  // 2. Tunggu sampai jadwal publikasi
  await step.sleepUntil("wait-until-scheduled", new Date(target.scheduled_at));

  // 3. Ambil kunci (queued -> publishing).
  //    Hasilnya disimpan Inngest, jadi tidak diulang saat step lain di-retry.
  const acquired = await step.run("acquire", () =>
    markTargetPublishing(targetId)
  );
  if (!acquired) return { skipped: true };

  // 4. Publish ke platform. Hanya step ini yang di-retry kalau gagal.
  const result = await step.run("publish", () => publishToPlatform(targetId));

  // 5. Catat hasil. Kalau gagal di sini, step publish TIDAK diulang.
  await step.run("finalize", () =>
    finalizePublish(targetId, target.post_id, result.platformPostId)
  );

  return { success: true };
}

// =========================================================
// PEMBUNGKUS INNGEST: hanya konfigurasi
// =========================================================
export const publishPost = inngest.createFunction(
  {
    id: "publish-post",
    retries: 3,
    triggers: [{ event: "post/publish.scheduled" }],
    cancelOn: [{ event: "post/publish.cancel", match: "data.targetId" }],

    // Jalan kalau semua retry habis atau ada NonRetriableError
    onFailure: async ({ event, error }) => {
      const { targetId } = event.data.event.data as { targetId: string };
      const target = await fetchTargetSummary(targetId);
      if (!target) return;

      await markTargetFailed(targetId, error.message);
      await syncPostStatus(target.post_id);
    },
  },

  async (ctx) =>
    publishPostHandler({
      event: ctx.event as unknown as HandlerArgs["event"],
      step: ctx.step as unknown as StepLike,
    })
);
