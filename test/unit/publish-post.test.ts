// test/publish-post.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/publish/repositories/publish-worker.repository", () => ({
  fetchTargetSummary: vi.fn(),
  markTargetPublishing: vi.fn(),
  markTargetFailed: vi.fn(),
}));
vi.mock("@/features/publish/services/publish-post.service", () => ({
  publishToPlatform: vi.fn(),
  finalizePublish: vi.fn(),
}));
vi.mock("@/features/publish/services/sync-post-status.service", () => ({
  syncPostStatus: vi.fn(),
}));

import { publishPostHandler } from "@/inngest/functions/publish-post";
import * as repo from "@/features/publish/repositories/publish-worker.repository";
import * as service from "@/features/publish/services/publish-post.service";
import { runWithRetries } from "../helpers/fake-step";

const event = { data: { targetId: "t1" } };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(repo.fetchTargetSummary).mockResolvedValue({
    id: "t1",
    status: "queued",
    scheduled_at: new Date().toISOString(),
    post_id: "p1",
  } as any);
  vi.mocked(repo.markTargetPublishing).mockResolvedValue(true);
  vi.mocked(service.publishToPlatform).mockResolvedValue({
    platformPostId: "plat-1",
  } as any);
});

describe("publishPostHandler", () => {
  it("finalize gagal sekali -> publisher tetap dipanggil tepat sekali", async () => {
    vi.mocked(service.finalizePublish)
      .mockRejectedValueOnce(new Error("DB timeout"))
      .mockResolvedValueOnce(undefined);

    const result = await runWithRetries(publishPostHandler, event);

    expect(result).toEqual({ success: true });
    expect(service.finalizePublish).toHaveBeenCalledTimes(2); // diulang
    expect(service.publishToPlatform).toHaveBeenCalledTimes(1); // TIDAK diulang
  });

  it("publish gagal sementara lalu berhasil -> acquire tetap sekali", async () => {
    vi.mocked(service.publishToPlatform)
      .mockRejectedValueOnce(new Error("503"))
      .mockResolvedValueOnce({ platformPostId: "plat-1" } as any);

    await runWithRetries(publishPostHandler, event);

    expect(service.publishToPlatform).toHaveBeenCalledTimes(2);
    expect(repo.markTargetPublishing).toHaveBeenCalledTimes(1); // kunci tidak diambil ulang
  });

  it("gagal acquire (worker lain sudah mengambil) -> tidak publish", async () => {
    vi.mocked(repo.markTargetPublishing).mockResolvedValue(false);

    const result = await runWithRetries(publishPostHandler, event);

    expect(result).toEqual({ skipped: true });
    expect(service.publishToPlatform).not.toHaveBeenCalled();
  });
});
