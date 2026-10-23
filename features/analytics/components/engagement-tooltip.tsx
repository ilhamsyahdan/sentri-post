import { ChartTooltipProps } from "../types/analytics";

export function EngTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;

  if (!data) return null;

  return (
    <div className="w-[190px] rounded-xl border border-gray-700 bg-[#111827] px-3.5 py-3 shadow-2xl">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-[11px] font-bold text-white">{data.dateLabel}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">{data.time}</p>
        </div>

        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-gray-300">
          #{data.postNumber}
        </span>
      </div>

      {data.content && (
        <p className="mb-2.5 line-clamp-2 text-[9px] leading-relaxed text-gray-400">
          {data.content}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-gray-700 pt-2.5">
        <span className="text-[10px] text-gray-400">Engagement</span>
        <span className="text-sm font-black text-white">
          {Number(data.engagement).toFixed(2)}%
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[8px] text-gray-500">Reach</p>
          <p className="text-[10px] font-bold text-gray-200">
            {Number(data.reach).toLocaleString("id-ID")}
          </p>
        </div>

        <div>
          <p className="text-[8px] text-gray-500">Likes</p>
          <p className="text-[10px] font-bold text-gray-200">
            {Number(data.likes).toLocaleString("id-ID")}
          </p>
        </div>

        <div>
          <p className="text-[8px] text-gray-500">Saved</p>
          <p className="text-[10px] font-bold text-gray-200">
            {Number(data.saved).toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
}
