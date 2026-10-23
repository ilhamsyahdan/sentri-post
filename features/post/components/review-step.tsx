import { memo, useMemo } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Clock, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { PLATFORM_CHAR_LIMIT, PLATFORM_COLOR } from "../constants";
import { usePostState } from "../context/post-state-context";

const ReviewStep = memo(() => {
  const { selectedIds, channels, posts, confirmedSlots } = usePostState();

  const activeChannels = useMemo(
    () => channels.filter((c) => selectedIds.includes(c.id)),
    [channels, selectedIds]
  );

  const confirmedCount = selectedIds.filter(
    (id) => !!confirmedSlots[id]
  ).length;

  const allConfirmed = confirmedCount === selectedIds.length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 shadow-sm">
          <Send size={16} className="text-white" />
        </div>

        <div>
          <p className="text-sm font-bold text-emerald-900">
            {allConfirmed ? "Siap dijadwalkan" : "Periksa kembali jadwal"}
          </p>

          <p className="mt-1 text-xs text-emerald-700">
            {confirmedCount} dari {selectedIds.length} channel sudah dijadwalkan
          </p>
        </div>
      </div>

      {/* Cards */}
      {activeChannels.map((ch) => {
        const p = posts[ch.id];
        const slot = confirmedSlots[ch.id];

        const charCount = p?.text?.length ?? 0;
        const limit = PLATFORM_CHAR_LIMIT[ch.platform];

        const contentOk = charCount > 0 && charCount <= limit;
        const scheduleOk = !!slot;
        const allOk = contentOk && scheduleOk;

        return (
          <div
            key={ch.id}
            className={cn(
              "rounded-2xl border p-4 transition-all duration-200 hover:border-emerald-300 space-y-4",
              allOk
                ? "border-emerald-200 bg-emerald-50"
                : "border-emerald-200 bg-white"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    PLATFORM_COLOR[ch.platform]
                  )}
                >
                  <Image
                    src={ch.icon}
                    width={14}
                    height={14}
                    alt={ch.platform}
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-800">
                    {ch.platform}
                  </p>

                  <p className="text-[11px] text-gray-500">{ch.name}</p>
                </div>
              </div>

              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold",
                  allOk
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {allOk ? (
                  <>
                    <CheckCircle2 size={12} />
                    Siap
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} />
                    Perlu diisi
                  </>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-3 text-xs",
                scheduleOk
                  ? "border-emerald-200 bg-white text-emerald-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
            >
              <Clock size={14} className="text-emerald-700 shrink-0" />

              {scheduleOk ? (
                <span>
                  {new Date(slot.scheduledAtUTC).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                  {slot.score && (
                    <span className="ml-2 text-gray-500">
                      • Skor {slot.score.toFixed(1)}
                    </span>
                  )}
                  {slot.mode === "smart" && (
                    <span className="ml-2 text-emerald-700 font-medium">
                      • Best Time Recommendation
                    </span>
                  )}
                </span>
              ) : (
                <span>Jadwal belum dipilih</span>
              )}
            </div>

            {/* Content */}
            {p?.text ? (
              <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                {p.text}
              </p>
            ) : (
              <p className="text-sm italic text-emerald-600">
                Belum ada konten.
              </p>
            )}

            {/* Media */}
            {p?.previewUrl && (
              <div className="relative h-24 overflow-hidden rounded-xl border border-emerald-200">
                <Image
                  src={p.previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Character Count */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                {charCount} / {limit.toLocaleString()} karakter
              </span>

              <div className="h-2 w-24 overflow-hidden rounded-full bg-emerald-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    charCount > limit ? "bg-red-500" : "bg-emerald-700"
                  )}
                  style={{
                    width: `${Math.min((charCount / limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

ReviewStep.displayName = "ReviewStep";

export default ReviewStep;
