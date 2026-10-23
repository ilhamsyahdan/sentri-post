import { cn } from "@/lib/utils";
import { Trend } from "./trend-badge";

export function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-5 flex flex-col gap-3 overflow-hidden transition-shadow hover:shadow-lg",
        highlight
          ? "bg-linear-to-br from-emerald-800 to-emerald-900 border-emerald-950 text-white"
          : "bg-white border-gray-100"
      )}
    >
      {highlight && (
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      <div className="flex items-center justify-between relative">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-widest",
            highlight ? "text-emerald-200" : "text-gray-400"
          )}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={14} style={{ color: iconColor }} />
        </div>
      </div>

      <div className="relative">
        <p
          className={cn(
            "text-3xl font-black tracking-tight leading-none",
            highlight ? "text-white" : "text-gray-900"
          )}
        >
          {value}
        </p>
        {sub && (
          <p
            className={cn(
              "text-[11px] mt-1.5",
              highlight ? "text-emerald-300" : "text-gray-400"
            )}
          >
            {sub}
          </p>
        )}
      </div>

      {trend !== undefined && (
        <div className={cn("relative", highlight ? "opacity-100" : "")}>
          <Trend value={trend} inverted={highlight} />
        </div>
      )}
    </div>
  );
}
