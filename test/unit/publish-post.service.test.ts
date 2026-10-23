import { describe, it, expect, vi, beforeEach } from "vitest";
import { NonRetriableError } from "inngest";

// Semua mock memakai path alias yang sama dengan impor di service
vi.mock("@/features/publish/repositories/publish-worker.repository", () => ({
  fetchTargetWithRelations: vi.fn(),
  markTargetSuccess: vi.fn(),
}));
vi.mock("@/features/publish/publishers/linkedin.publisher", () => ({
  publishToLinkedIn: vi.fn(),
}));
vi.mock("@/features/publish/publishers/instagram.publisher", () => ({
  publishToInstagram: vi.fn(),
}));
vi.mock("@/features/publish/services/sync-post-status.service", () => ({
  syncPostStatus: vi.fn(),
}));

import {
  publishToPlatform,
  finalizePublish,
} from "@/features/publish/services/publish-post.service";
import * as repo from "@/features/publish/repositories/publish-worker.repository";
import { publishToLinkedIn } from "@/features/publish/publishers/linkedin.publisher";
import { publishToInstagram } from "@/features/publish/publishers/instagram.publisher";
import { syncPostStatus } from "@/features/publish/services/sync-post-status.service";

const future = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();
const past = () => new Date(Date.now() - 1000).toISOString();

function makeTarget(platform: string, expiresAt: string = future()) {
  return {
    id: "t1",
    post_id: "p1",
    posts: { content: "Test content", media_urls: undefined },
    connections: {
      platform,
      access_token: "token_123",
      platform_user_id: "user_456",
      token_expires_at: expiresAt,
    },
  } as any;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("publishToPlatform", () => {
  it("target tidak ditemukan -> NonRetriableError", async () => {
    vi.mocked(repo.fetchTargetWithRelations).mockResolvedValue(null);
    await expect(publishToPlatform("t1")).rejects.toBeInstanceOf(
      NonRetriableError
    );
  });

  it("LinkedIn sukses -> mengembalikan hasil publisher", async () => {
    vi.mocked(repo.fetchTargetWithRelations).mockResolvedValue(
      makeTarget("linkedin")
    );
    vi.mocked(publishToLinkedIn).mockResolvedValue({ platformPostId: "li-1" });

    const result = await publishToPlatform("t1");

    expect(result).toEqual({ platformPostId: "li-1" });
    expect(publishToLinkedIn).toHaveBeenCalledWith({
      accessToken: "token_123",
      authorId: "user_456",
      content: "Test content",
      mediaUrls: undefined,
    });
  });

  it("Instagram sukses -> mengembalikan hasil publisher", async () => {
    vi.mocked(repo.fetchTargetWithRelations).mockResolvedValue(
      makeTarget("instagram")
    );
    vi.mocked(publishToInstagram).mockResolvedValue({ platformPostId: "ig-1" });

    const result = await publishToPlatform("t1");

    expect(result).toEqual({ platformPostId: "ig-1" });
    expect(publishToInstagram).toHaveBeenCalledWith(
      expect.objectContaining({ igUserId: "user_456" })
    );
  });

  it.each(["linkedin", "instagram"])(
    "token %s kedaluwarsa -> NonRetriableError, publisher tidak dipanggil",
    async (platform) => {
      vi.mocked(repo.fetchTargetWithRelations).mockResolvedValue(
        makeTarget(platform, past())
      );

      await expect(publishToPlatform("t1")).rejects.toBeInstanceOf(
        NonRetriableError
      );
      expect(publishToLinkedIn).not.toHaveBeenCalled();
      expect(publishToInstagram).not.toHaveBeenCalled();
    }
  );

  it("error sementara (429) -> dilempar ulang, BUKAN NonRetriableError", async () => {
    vi.mocked(repo.fetchTargetWithRelations).mockResolvedValue(
      makeTarget("instagram")
    );
    vi.mocked(publishToInstagram).mockRejectedValue(
      new Error("429 Too Many Requests")
    );

    const promise = publishToPlatform("t1");
    await expect(promise).rejects.toThrow("429 Too Many Requests");
    await expect(promise).rejects.not.toBeInstanceOf(NonRetriableError);
  });

  it("platform tidak didukung -> NonRetriableError", async () => {
    vi.mocked(repo.fetchTargetWithRelations).mockResolvedValue(
      makeTarget("twitter")
    );
    await expect(publishToPlatform("t1")).rejects.toBeInstanceOf(
      NonRetriableError
    );
  });
});

describe("finalizePublish", () => {
  it("mencatat sukses lalu menyinkron status post", async () => {
    await finalizePublish("t1", "p1", "plat-1");

    expect(repo.markTargetSuccess).toHaveBeenCalledWith("t1", "plat-1");
    expect(syncPostStatus).toHaveBeenCalledWith("p1");
  });
});
