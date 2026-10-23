import { AccountPostState, Channel } from "../types";

export function buildDraftChannels(
  selectedIds: string[],
  posts: Record<string, AccountPostState>,
  channels: Channel[]
) {
  return selectedIds
    .map((id) => {
      const channel = channels.find((c) => c.id === id);
      return {
        connectionId: id,
        platform: channel?.platform ?? "linkedin",
        name: channel?.name ?? "Unknown User",
        avatar: channel?.avatar ?? null,
        text: posts[id]?.text ?? "",
        mediaUrls: posts[id]?.cloudinaryUrl ? [posts[id].cloudinaryUrl!] : [],
        publicIds: posts[id]?.publicId ? [posts[id].publicId!] : [],
      };
    })
    .filter((ch) => !!ch.connectionId);
}
