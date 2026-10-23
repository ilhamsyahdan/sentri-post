import { memo } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Channel, PLATFORM_CONFIG } from "../../types";

const ChannelAvatar = memo(
  ({
    channel,
    selected,
    active,
    onClick,
  }: {
    channel: Channel;
    selected: boolean;
    active: boolean;
    onClick: () => void;
  }) => {
    const platform = PLATFORM_CONFIG[channel.platform];

    return (
      <button
        onClick={onClick}
        title={`${channel.name} · ${platform.label}`}
        className={cn(
          "relative p-1 rounded-2xl border-2 transition-all duration-200 shrink-0",
          selected && active
            ? "border-[#4F7A28] bg-[#F5FBF0] scale-105 shadow-md"
            : selected
            ? "border-[#4F7A28]/40 bg-[#F5FBF0]/50"
            : "border-gray-100 hover:border-gray-300"
        )}
      >
        {/* Avatar */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={channel.avatar}
            fill
            sizes="56px"
            alt={channel.name}
            className="object-cover"
          />
        </div>

        {/* Platform Badge */}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full p-[3px] shadow-md",
            platform.bg
          )}
        >
          <Image
            src={platform.iconSrc}
            width={13}
            height={13}
            alt={platform.label}
            className="object-contain"
          />
        </div>

        {/* Selected Indicator */}
        {selected && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#4F7A28]">
            <CheckCircle2 size={9} className="text-white" strokeWidth={3} />
          </div>
        )}
      </button>
    );
  }
);

ChannelAvatar.displayName = "ChannelAvatar";
export default ChannelAvatar;
