// post/components/previews/LinkedinPreview.tsx
import Image from "next/image";
import { ThumbsUp, MessageCircle, Repeat2, Share2 } from "lucide-react";
import type { PreviewData } from "./types";

export function LinkedinPreview({ data }: { data: PreviewData }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden w-full">
      <div className="flex items-start gap-3 p-4">
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 relative bg-blue-700">
          {data.authorAvatar ? (
            <Image
              src={data.authorAvatar}
              fill
              alt={data.authorName}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
              {data.authorName[0]}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {data.authorName}
          </p>
          <p className="text-[11px] text-gray-500">Digital Marketing · 1st</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Baru saja · 🌐</p>
        </div>
      </div>
      <p className="px-4 pb-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word line-clamp-6 overflow-y-auto">
        {data.text || "Konten kamu akan muncul di sini..."}
      </p>
      {data.mediaUrl && (
        <div className="aspect-square relative border-t border-gray-100">
          <Image
            src={data.mediaUrl}
            fill
            className="object-cover"
            alt="media"
          />
        </div>
      )}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 text-gray-500 text-xs font-semibold">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Komentar" },
          { icon: Repeat2, label: "Repost" },
          { icon: Share2, label: "Kirim" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <Icon size={13} strokeWidth={1.5} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
