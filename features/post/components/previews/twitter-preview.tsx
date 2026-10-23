// post/components/previews/TwitterPreview.tsx
import {
  MessageCircle,
  Repeat2,
  Heart,
  ChartNoAxesColumn,
  Share,
  Bookmark,
} from "lucide-react";
import Image from "next/image";
import type { PreviewData } from "./types";

export function TwitterPreview({ data }: { data: PreviewData }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 w-full">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative bg-gray-100">
          {data.authorAvatar ? (
            <Image
              src={data.authorAvatar}
              fill
              alt={data.authorName}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold bg-gray-800">
              {data.authorName[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-sm font-bold text-gray-900">
              {data.authorName}
            </span>
            <span className="text-xs text-gray-400">
              {data.authorHandle ? `@${data.authorHandle}` : "@sentriposts"} ·
              baru saja
            </span>
          </div>
          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
            {data.text || "Konten kamu akan muncul di sini..."}
          </p>
          {data.mediaUrl && (
            <div className="mt-2 rounded-xl overflow-hidden h-44 relative border border-gray-100">
              <Image
                src={data.mediaUrl}
                fill
                className="object-cover"
                alt="media"
              />
            </div>
          )}
          <div className="flex items-center justify-between gap-6 mt-3 text-gray-400 text-xs">
            <MessageCircle size={14} />
            <Repeat2 size={14} />
            <Heart size={14} />
            <ChartNoAxesColumn size={14} />
            <div className="flex gap-3">
              <Share size={14} />
              <Bookmark size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
