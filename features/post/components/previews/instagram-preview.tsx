import Image from "next/image";
import {
  Bookmark,
  Heart,
  ImagePlus,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { PreviewData } from "./types";

const InstagramPreview = ({ data }: { data: PreviewData }) => {
  const handle =
    data.authorHandle ??
    data.authorName?.toLowerCase().replace(/\s/g, "") ??
    "account";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          {/* ✅ Avatar ring — pakai foto asli kalau ada */}
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-0.5 shrink-0">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {data.authorAvatar ? (
                <Image
                  src={data.authorAvatar}
                  alt={handle}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-white text-[10px] font-bold">
                  {(data.authorName?.[0] ?? "M").toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div>
            {/* ✅ Nama channel dari connections.platform_user_name */}
            <p className="text-xs font-bold text-gray-900 leading-none">
              {handle}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {data.authorName}
            </p>
          </div>
        </div>
        <MoreHorizontal size={16} className="text-gray-700" />
      </div>

      {/* Media */}
      <div className="relative aspect-square bg-gray-100 w-full">
        {data.mediaUrl ? (
          /\.(mp4|mov|avi)(\?|$)/i.test(data.mediaUrl) ? (
            <video
              src={data.mediaUrl}
              className="w-full h-full object-cover"
              muted
              // loop
              playsInline
              // controls
            />
          ) : (
            <Image
              src={data.mediaUrl}
              alt="media"
              fill
              className="object-cover"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 flex-col gap-2">
            <ImagePlus size={36} strokeWidth={1} />
            <span className="text-xs text-gray-300">Belum ada media</span>
          </div>
        )}
      </div>

      {/* Actions + Caption */}
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Heart size={20} strokeWidth={1.5} className="text-gray-700" />
            <MessageCircle
              size={20}
              strokeWidth={1.5}
              className="text-gray-700"
            />
            <Share2 size={20} strokeWidth={1.5} className="text-gray-700" />
          </div>
          <Bookmark size={20} strokeWidth={1.5} className="text-gray-700" />
        </div>
        {/* ✅ Handle di caption juga dari data */}
        <p className="text-xs text-gray-800 leading-relaxed line-clamp-3">
          <span className="font-bold">{handle}</span>{" "}
          {data.text || (
            <span className="text-gray-400 italic">Belum ada caption...</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default InstagramPreview;
