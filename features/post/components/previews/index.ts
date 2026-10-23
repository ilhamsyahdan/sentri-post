// post/components/previews/index.ts
export { TwitterPreview } from "./twitter-preview";
export { LinkedinPreview } from "./linkedin-preview";
export type { PreviewData } from "./types";

// Normalize dari Channel + AccountPostState (konteks compose)
import type { Channel, AccountPostState, Post } from "../../types";
import type { PreviewData } from "./types";

export function fromChannel(
  channel: Channel,
  post: AccountPostState
): PreviewData {
  return {
    authorName: channel.name,
    authorAvatar: channel.avatar,
    authorHandle: channel.name.toLowerCase().replace(/\s/g, ""),
    text: post.text,
    mediaUrl: post.previewUrl,
  };
}

// Normalize dari Post (konteks post-card)

export function fromPost(post: Post): PreviewData {
  return {
    authorName: post.channelName ?? "Unknown User",
    authorAvatar: post.channelAvatar ?? undefined,
    authorHandle:
      post.channelName?.toLowerCase().replace(/\s+/g, "") ?? undefined,

    text: post.content,

    mediaUrl: post.mediaUrl ?? null,
  };
}
