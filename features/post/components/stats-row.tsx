import { cn } from "@/lib/utils";
import { CheckSquare, Clock, TrendingUp } from "lucide-react";

const StatsRow = ({
  queued,
  drafts,
  sent,
}: {
  queued: number;
  drafts: number;
  sent: number;
}) => (
  <div className="grid grid-cols-3 gap-3 mb-6">
    {[
      {
        label: "Scheduled",
        value: queued,
        icon: Clock,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Drafts",
        value: drafts,
        icon: CheckSquare,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        label: "Sent",
        value: sent,
        icon: TrendingUp,
        color: "text-[#4F7A28]",
        bg: "bg-[#EBF5E1]",
      },
    ].map(({ label, value, icon: Icon, color, bg }) => (
      <div
        key={label}
        className="rounded-xl bg-white border border-gray-100 px-4 py-3 flex items-center gap-3"
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            bg
          )}
        >
          <Icon className={cn("w-4 h-4", color)} strokeWidth={2} />
        </div>
        <div>
          <p className="text-xl font-black text-gray-900 leading-none">
            {value}
          </p>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            {label}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export default StatsRow;
