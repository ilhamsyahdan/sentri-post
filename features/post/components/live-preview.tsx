// post/components/live-preview.tsx
import { memo } from "react";
import { AlertCircle } from "lucide-react";
import type { Channel, AccountPostState } from "../types";
import {
  // TwitterPreview,
  LinkedinPreview,
  // YoutubePreview,
  fromChannel,
} from "./previews";
import InstagramPreview from "./previews/instagram-preview";

const LivePreview = memo(
  ({
    channel,
    post,
  }: {
    channel: Channel | null;
    post: AccountPostState | null;
  }) => {
    if (!channel || !post)
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-3xl flex items-center justify-center mb-3">
            <AlertCircle className="text-gray-300" size={24} />
          </div>
          <p className="text-gray-400 text-sm">Pilih channel untuk preview</p>
        </div>
      );

    const data = fromChannel(channel, post);

    // if (channel.platform === "twitter") return <TwitterPreview data={data} />;
    if (channel.platform === "linkedin") return <LinkedinPreview data={data} />;
    if (channel.platform === "instagram")
      return <InstagramPreview data={data} />;
    return null;
  }
);
LivePreview.displayName = "LivePreview";
export default LivePreview;
