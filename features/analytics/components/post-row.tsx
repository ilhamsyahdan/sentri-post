import Image from "next/image";
import {
  Calendar,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Zap,
} from "lucide-react";
import { AnalyticsPost } from "../types/analytics";
import { PLATFORM_CONFIG } from "../config/platform-config";
import { fmtDate, fmtUpdated } from "../utils/formatters";
import { MIN_RELIABLE_REACH } from "../constants/thresholds";
import { Metric } from "./metric";

export function PostRow({ post, rank }: { post: AnalyticsPost; rank: number }) {
  const config = PLATFORM_CONFIG[post.platform] ?? PLATFORM_CONFIG.instagram;
  const hasReach = config.metrics.hasViews;
  const lowSample = hasReach && post.views < MIN_RELIABLE_REACH;

  const engColor = lowSample
    ? "text-gray-400 bg-gray-50"
    : post.engagementRate >= 3
    ? "text-emerald-600 bg-emerald-50"
    : post.engagementRate >= 1
    ? "text-amber-600 bg-amber-50"
    : "text-gray-400 bg-gray-50";

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
      <span className="w-6 text-center text-sm font-black text-gray-200 shrink-0 mt-0.5">
        {rank}
      </span>

      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: config.iconBg }}
      >
        <Image
          src={config.icon}
          width={16}
          height={16}
          alt={config.label}
          className="object-contain"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-[160px]"
            style={{ color: config.color, backgroundColor: config.iconBg }}
          >
            @{post.connectionName}
          </span>
        </div>
        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed font-medium">
          {post.content}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Calendar size={9} />
            {fmtDate(post.scheduledAt)}
          </span>
          {post.analyticsUpdatedAt && (
            <span className="text-[10px] text-gray-300">
              · Diperbarui {fmtUpdated(post.analyticsUpdatedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-5 shrink-0">
        <Metric icon={Heart} value={post.likes} color="#E1306C" />
        <Metric icon={MessageCircle} value={post.comments} color="#833AB4" />
        {config.metrics.hasViews && (
          <Metric icon={Eye} value={post.views} color="#F77737" />
        )}
        {config.metrics.hasSaved && (
          <Metric icon={Bookmark} value={post.saved} color="#405DE6" />
        )}
      </div>

      <div
        className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${engColor}`}
        title={
          lowSample
            ? `Reach masih ${post.views} — terlalu kecil untuk jadi sinyal performa`
            : undefined
        }
      >
        <Zap size={10} />
        {post.engagementRate.toFixed(2)}%
        {lowSample && <span className="font-normal opacity-70">·kecil</span>}
      </div>
    </div>
  );
}
